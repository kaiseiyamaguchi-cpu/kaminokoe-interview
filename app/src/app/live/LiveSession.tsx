"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { PipMount } from "./PipMount";

// ─── Types ─────────────────────────────────────────
type Stage = "prepare" | "asking_share" | "live" | "done" | "error";
type Speaker = "interviewer" | "candidate";
type Message = {
  id: string;
  type: "question" | "suggestion" | "transcript";
  content: string;
  matchedPrepTitle?: string | null;
  cues?: string[];
};

// ─── Zoom URL → ブラウザ参加URL 変換 ───────────────
function normalizeMeetingUrl(input: string): { url: string; service: "zoom" | "meet" | "teams" | "other" } {
  const trimmed = input.trim();
  if (!trimmed) return { url: "", service: "other" };
  try {
    const u = new URL(trimmed);
    if (u.hostname.includes("zoom.us")) {
      // https://us05web.zoom.us/j/123?pwd=xxx → https://app.zoom.us/wc/join/123?pwd=xxx
      const m = u.pathname.match(/\/j\/(\d+)/);
      if (m) {
        const search = u.search;
        return { url: `https://app.zoom.us/wc/join/${m[1]}${search}`, service: "zoom" };
      }
      return { url: trimmed, service: "zoom" };
    }
    if (u.hostname.includes("meet.google.com")) return { url: trimmed, service: "meet" };
    if (u.hostname.includes("teams.microsoft.com") || u.hostname.includes("teams.live.com")) {
      return { url: trimmed, service: "teams" };
    }
    return { url: trimmed, service: "other" };
  } catch {
    return { url: trimmed, service: "other" };
  }
}

export function LiveSession() {
  const params = useSearchParams();
  const rawPrepId = params.get("prepId");
  const prepId = rawPrepId ? (rawPrepId as Id<"companyInterviewPreps">) : null;
  const ticketCount = Math.max(1, Math.min(36, parseInt(params.get("tickets") ?? "1", 10) || 1));

  const profile = useQuery(api.users.getProfile);
  const qaRows = useQuery(api.interviewPrep.listInterviewQa, {});
  const companyPrep = useQuery(api.interviewPrep.getCompanyPrep, prepId ? { prepId } : "skip");

  const createRealtimeToken = useAction(api.openai.createRealtimeToken);
  const generateAnswer = useAction(api.interviewPrepAi.generateAnswer);

  // ─── State ─────────────────────────────────────────
  const [stage, setStage] = useState<Stage>("prepare");
  const [meetingUrlInput, setMeetingUrlInput] = useState("");
  const [meetingUrlNormalized, setMeetingUrlNormalized] = useState<{ url: string; service: "zoom" | "meet" | "teams" | "other" } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [latestQuestion, setLatestQuestion] = useState<string>("");
  const [latestSuggestion, setLatestSuggestion] = useState<Message | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPipActive, setIsPipActive] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState(ticketCount * 600);

  // Refs for non-state side effects
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<"candidate" | "interviewer" | "idle">("idle");
  const speechStartedSourceRef = useRef<"candidate" | "interviewer" | null>(null);
  const speakerByItemRef = useRef<Map<string, Speaker>>(new Map());
  const conversationLogRef = useRef<{ source: Speaker; text: string }[]>([]);
  const lastInterviewerQuestionRef = useRef<string>("");
  const inflightRef = useRef<AbortController | null>(null);
  const vadFrameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Profile snapshot for prompt ───────────────────
  const profileSnapshot = useMemo(() => {
    if (!profile || !qaRows) return null;
    const map: Record<string, string> = {};
    for (const row of qaRows) if (row.presetKey) map[row.presetKey] = row.answer;
    let hints = "";
    if (companyPrep?.sections?.length) {
      hints = companyPrep.sections.map((s: { title: string; content: string }) => `### ${s.title}\n${s.content}`).join("\n\n");
    }
    return {
      userName: profile.displayName ?? "",
      companyName: companyPrep?.companyName ?? "",
      companyVision: companyPrep?.companyVision ?? "",
      strengths: map.strength ?? "",
      experience: map.gakuchika ?? "",
      motivation: map.motivation ?? "",
      companyPrepHints: hints,
    };
  }, [profile, qaRows, companyPrep]);

  // ─── Cleanup ───────────────────────────────────────
  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (vadFrameRef.current !== null) { window.clearTimeout(vadFrameRef.current); vadFrameRef.current = null; }
    dcRef.current?.close(); dcRef.current = null;
    pcRef.current?.close(); pcRef.current = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop()); micStreamRef.current = null;
    displayStreamRef.current?.getTracks().forEach((t) => t.stop()); displayStreamRef.current = null;
    if (audioContextRef.current) { audioContextRef.current.close().catch(() => {}); audioContextRef.current = null; }
    inflightRef.current?.abort(); inflightRef.current = null;
    activeSourceRef.current = "idle";
    speechStartedSourceRef.current = null;
    speakerByItemRef.current.clear();
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  // ─── Trigger answer via Convex Action ──────────────
  const triggerAnswer = useCallback(async (question: string) => {
    if (!profileSnapshot) return;
    if (inflightRef.current) inflightRef.current.abort();
    const ac = new AbortController();
    inflightRef.current = ac;
    try {
      const prepSections =
        companyPrep?.sections?.map((s: { id?: string; title: string; content: string }, idx: number) => ({
          id: s.id ?? `s-${idx}`,
          title: s.title,
          content: s.content,
        })) ?? [];
      const result = await generateAnswer({
        question,
        prepSections,
        profile: {
          displayName: profileSnapshot.userName || undefined,
          companyName: profileSnapshot.companyName || undefined,
          companyVision: profileSnapshot.companyVision || undefined,
          strengths: profileSnapshot.strengths || undefined,
          experience: profileSnapshot.experience || undefined,
          motivation: profileSnapshot.motivation || undefined,
        },
        conversationLog: conversationLogRef.current.slice(-6),
      });
      if (ac.signal.aborted) return;
      // matched_prep_id があれば該当 section の title を引く
      let matchedTitle: string | null = null;
      if (result.matched_prep_id) {
        const sec = prepSections.find((s) => s.id === result.matched_prep_id);
        matchedTitle = sec?.title ?? null;
      }
      const msg: Message = {
        id: crypto.randomUUID(),
        type: "suggestion",
        content: result.answer,
        matchedPrepTitle: matchedTitle,
      };
      setMessages((p) => [...p, msg]);
      setLatestSuggestion(msg);
    } catch (e) {
      if (!ac.signal.aborted) console.error(e);
    }
  }, [generateAnswer, profileSnapshot, companyPrep]);

  // ─── Realtime event handler ────────────────────────
  const handleEvent = useCallback((ev: { type: string; [k: string]: unknown }) => {
    const type = ev.type;
    if (type === "input_audio_buffer.speech_started") {
      const src = activeSourceRef.current === "interviewer" ? "interviewer" : "candidate";
      speechStartedSourceRef.current = src;
      return;
    }
    if (type === "conversation.item.created") {
      const item = (ev as { item?: { id?: string } }).item;
      if (item?.id && speechStartedSourceRef.current) {
        speakerByItemRef.current.set(item.id, speechStartedSourceRef.current);
      }
      return;
    }
    if (type === "conversation.item.input_audio_transcription.completed") {
      const text = ((ev as { transcript?: string }).transcript || "").trim();
      const itemId = (ev as { item_id?: string }).item_id;
      if (!text) return;
      const speaker: Speaker = (itemId && speakerByItemRef.current.get(itemId)) || "candidate";
      conversationLogRef.current.push({ source: speaker, text });
      if (conversationLogRef.current.length > 10) conversationLogRef.current.shift();
      setMessages((p) => [...p, { id: crypto.randomUUID(), type: "transcript", content: `${speaker === "interviewer" ? "🎤 面接官" : "🗣 自分"}: ${text}` }]);

      if (speaker === "interviewer") {
        setLatestQuestion(text);
        lastInterviewerQuestionRef.current = text;
        const looksLikeQuestion = /[?？]|教えて|聞か|どう|なぜ|何|どんな|どうして|について/.test(text);
        if (looksLikeQuestion) {
          setMessages((p) => [...p, { id: crypto.randomUUID(), type: "question", content: text }]);
          triggerAnswer(text);
        }
      }
    }
  }, [triggerAnswer]);

  // ─── Connect & start ───────────────────────────────
  const startListening = useCallback(async () => {
    setError(null);
    setStage("asking_share");
    try {
      // 1. mic
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      micStreamRef.current = mic;

      // 2. display media (tab audio)
      let display: MediaStream | null = null;
      try {
        // user MUST select a tab and check "share tab audio"
        display = await navigator.mediaDevices.getDisplayMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
          video: true,
        });
        // we don't need video — stop it immediately
        display.getVideoTracks().forEach((t) => t.stop());
      } catch (e) {
        console.warn("display media canceled or failed", e);
      }
      displayStreamRef.current = display;
      const hasTabAudio = !!display && display.getAudioTracks().length > 0;

      // 3. mix mic + tab audio via WebAudio
      let combinedStream: MediaStream;
      if (hasTabAudio && display) {
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        const micSrc = ctx.createMediaStreamSource(mic);
        const sysSrc = ctx.createMediaStreamSource(new MediaStream([display.getAudioTracks()[0]]));
        const micGain = ctx.createGain(); micGain.gain.value = 1;
        const sysGain = ctx.createGain(); sysGain.gain.value = 1;
        const micAna = ctx.createAnalyser(); micAna.fftSize = 1024;
        const sysAna = ctx.createAnalyser(); sysAna.fftSize = 1024;
        micSrc.connect(micAna);
        sysSrc.connect(sysAna);
        const dest = ctx.createMediaStreamDestination();
        micSrc.connect(micGain).connect(dest);
        sysSrc.connect(sysGain).connect(dest);
        activeSourceRef.current = "idle";

        const VAD = 0.018, HOLD = 350, FADE = 0.04;
        let lastSwitch = 0;
        const buf = new Float32Array(micAna.fftSize);
        const rms = (an: AnalyserNode) => {
          an.getFloatTimeDomainData(buf);
          let s = 0;
          for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
          return Math.sqrt(s / buf.length);
        };
        const tick = () => {
          const now = performance.now();
          const m = rms(micAna), s = rms(sysAna);
          const ma = m > VAD, sa = s > VAD;
          let next: "candidate" | "interviewer" | "idle";
          if (sa && ma) next = m > s * 2 ? "candidate" : "interviewer";
          else if (sa) next = "interviewer";
          else if (ma) next = "candidate";
          else next = "idle";
          if (next !== activeSourceRef.current && now - lastSwitch >= HOLD) {
            activeSourceRef.current = next;
            lastSwitch = now;
            const t = ctx.currentTime;
            if (next === "candidate") { micGain.gain.setTargetAtTime(1, t, FADE); sysGain.gain.setTargetAtTime(0, t, FADE); }
            else if (next === "interviewer") { micGain.gain.setTargetAtTime(0, t, FADE); sysGain.gain.setTargetAtTime(1, t, FADE); }
            else { micGain.gain.setTargetAtTime(1, t, FADE); sysGain.gain.setTargetAtTime(1, t, FADE); }
          }
          vadFrameRef.current = window.setTimeout(tick, 33) as unknown as number;
        };
        vadFrameRef.current = window.setTimeout(tick, 0) as unknown as number;
        combinedStream = dest.stream;
      } else {
        activeSourceRef.current = "candidate";
        combinedStream = mic;
      }

      // 4. WebRTC + Realtime API
      const tokenData = await createRealtimeToken();
      const token = tokenData.value;
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.addTrack(combinedStream.getTracks()[0]);
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      dc.onopen = () => {
        dc.send(JSON.stringify({
          type: "session.update",
          session: {
            type: "realtime",
            output_modalities: ["text"],
            instructions: "あなたは音声をテキストに転写するだけのシステムです。発話以外の出力をしないでください。",
            audio: {
              input: {
                transcription: { model: "gpt-4o-mini-transcribe", language: "ja" },
                turn_detection: { type: "server_vad", threshold: 0.5, prefix_padding_ms: 150, silence_duration_ms: 300, create_response: false },
              },
            },
          },
        }));
      };
      dc.onmessage = (e) => handleEvent(JSON.parse(e.data));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/sdp" },
        body: offer.sdp,
      });
      if (!sdpRes.ok) {
        const errBody = await sdpRes.text().catch(() => "");
        throw new Error(`接続失敗 ${sdpRes.status}: ${errBody.slice(0, 160)}`);
      }
      await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });

      // 5. start timer
      setStartedAt(Date.now());
      timerRef.current = setInterval(() => {
        setRemainingSec((r) => {
          if (r <= 1) {
            endSession();
            return 0;
          }
          return r - 1;
        });
      }, 1000);

      setStage("live");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : String(e));
      cleanup();
      setStage("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createRealtimeToken, handleEvent]);

  const endSession = useCallback(() => {
    cleanup();
    setStage("done");
    setIsPipActive(false);
  }, [cleanup]);

  // ─── Format helpers ────────────────────────────────
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // ─── PiP open ──────────────────────────────────────
  const openPip = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dpip = (window as any).documentPictureInPicture;
      if (!dpip) {
        alert("Document Picture-in-Picture が利用できません。Chrome / Edge / Brave をお使いください。");
        return;
      }
      await dpip.requestWindow({ width: 380, height: 480 });
      setIsPipActive(true);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // ─── Render branches ───────────────────────────────
  return (
    <div className="max-w-[760px] mx-auto px-5 pt-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-[color:var(--text-dim)]">
          ← ホーム
        </Link>
        {stage === "live" && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[color:var(--success)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[color:var(--success)] pulse-dot inline-block" />
              受信中
            </span>
            <span className="text-sm tabular text-[color:var(--text-dim)]">⏱ {fmt(remainingSec)}</span>
          </div>
        )}
      </div>

      {stage === "prepare" && (
        <PrepareView
          meetingUrlInput={meetingUrlInput}
          setMeetingUrlInput={(v) => {
            setMeetingUrlInput(v);
            setMeetingUrlNormalized(normalizeMeetingUrl(v));
          }}
          normalized={meetingUrlNormalized}
          onStart={startListening}
        />
      )}

      {stage === "asking_share" && <SharingView />}

      {stage === "live" && (
        <LiveView
          latestQuestion={latestQuestion}
          latestSuggestion={latestSuggestion}
          messages={messages}
          isPipActive={isPipActive}
          openPip={openPip}
          endSession={endSession}
        />
      )}

      {stage === "done" && (
        <DoneView
          messages={messages}
          startedAt={startedAt}
        />
      )}

      {stage === "error" && (
        <ErrorView
          error={error}
          onRetry={() => { setError(null); setStage("prepare"); }}
        />
      )}

      {/* PiP content mount */}
      {isPipActive && (
        <PipMount
          latestQuestion={latestQuestion}
          latestSuggestion={latestSuggestion}
          remainingSec={remainingSec}
          onClose={() => setIsPipActive(false)}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════
// Sub-views
// ════════════════════════════════════════════════════

function PrepareView({
  meetingUrlInput, setMeetingUrlInput, normalized, onStart,
}: {
  meetingUrlInput: string;
  setMeetingUrlInput: (v: string) => void;
  normalized: { url: string; service: "zoom" | "meet" | "teams" | "other" } | null;
  onStart: () => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">面接モードの準備</h1>
      <p className="text-sm text-[color:var(--text-dim)] mb-6">会議をブラウザで開いて、その音声をかんぺに共有します。</p>

      <div className="bg-[color:var(--bg2)] border border-[color:var(--accent)] rounded-2xl p-6 mb-4">
        <div className="text-[11px] font-bold tracking-widest text-[color:var(--accent2)] uppercase mb-2">STEP 1</div>
        <h2 className="text-lg font-bold mb-2">🌐 会議をブラウザで開く</h2>
        <p className="text-xs text-[color:var(--text-dim)] mb-3">招待URLを貼ると、ブラウザ参加URLに自動変換して新しいタブで開きます。</p>

        <div className="flex gap-2 mb-3">
          <input
            value={meetingUrlInput}
            onChange={(e) => setMeetingUrlInput(e.target.value)}
            placeholder="https://meet.google.com/... または https://us05web.zoom.us/j/..."
            className="flex-1 bg-[color:var(--bg)] border border-[color:var(--line2)] text-[color:var(--text)] px-3 py-2.5 rounded-lg text-xs font-mono"
          />
          <button
            disabled={!normalized?.url}
            onClick={() => normalized?.url && window.open(normalized.url, "_blank")}
            className="px-4 py-2.5 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-lg text-sm font-semibold disabled:opacity-30 disabled:pointer-events-none whitespace-nowrap"
          >
            🌐 開く
          </button>
        </div>

        {normalized && normalized.url && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
            normalized.service === "other"
              ? "bg-[color:var(--warn)]/10 text-[color:var(--warn)] border border-[color:var(--warn)]/30"
              : "bg-[color:var(--success)]/10 text-[color:var(--success)] border border-[color:var(--success)]/30"
          }`}>
            <span>{normalized.service === "other" ? "⚠" : "✓"}</span>
            <span>
              {normalized.service === "zoom" && "Zoom として認識。app.zoom.us（ブラウザ参加）に変換しました"}
              {normalized.service === "meet" && "Google Meet として認識。そのままブラウザで開けます"}
              {normalized.service === "teams" && "Microsoft Teams として認識"}
              {normalized.service === "other" && "URL を認識できませんでした。手動で確認してください"}
            </span>
          </div>
        )}

        <div className="text-xs bg-indigo-500/[0.08] border-l-2 border-indigo-400 px-3 py-2.5 mt-3 rounded">
          <strong className="text-[color:var(--accent2)]">💡 Zoomの罠：</strong>
          <span className="text-[color:var(--text-dim)]"> Zoomは招待URLを開くとデスクトップアプリを起動しようとします。かんぺが自動で「ブラウザ参加URL」に変換するので、そのまま開くだけで OK</span>
        </div>
      </div>

      <div className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-2xl p-6 mb-4">
        <div className="text-[11px] font-bold tracking-widest text-[color:var(--text-dim)] uppercase mb-2">STEP 2</div>
        <h2 className="text-lg font-bold mb-2">🔊 マイクと相手の声を取り込む</h2>
        <p className="text-xs text-[color:var(--text-dim)] mb-4">
          下のボタンを押すと、ブラウザがマイクと「画面共有」の許可を求めます。<br />
          画面共有では <strong className="text-[color:var(--text)]">「Chromeタブ」</strong> →
          <strong className="text-[color:var(--text)]"> 会議タブ</strong> を選び、
          <strong className="text-[color:var(--success)]">「タブの音声も共有する」</strong> を必ず ✅ してください。
        </p>
        <button
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-xl font-bold text-base shadow-lg shadow-indigo-500/30"
        >
          🎯 マイク + 音声共有を開始
        </button>
      </div>

      <div className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-2xl p-6 opacity-55">
        <div className="text-[11px] font-bold tracking-widest text-[color:var(--text-dim)] uppercase mb-2">STEP 3</div>
        <h2 className="text-lg font-bold mb-2">🪟 フロート窓に切り替え</h2>
        <p className="text-xs text-[color:var(--text-dim)]">音声共有が成功したらフロート窓ボタンが出ます。会議タブの上にかんぺが常に表示されます。</p>
      </div>
    </div>
  );
}

function SharingView() {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🎯</div>
      <h2 className="text-xl font-bold mb-2">マイクと画面共有を確認中...</h2>
      <p className="text-sm text-[color:var(--text-dim)]">ブラウザのダイアログで Chromeタブ → 会議タブ → 「音声を共有」 を選んでください</p>
    </div>
  );
}

function LiveView({
  latestQuestion, latestSuggestion, messages, isPipActive, openPip, endSession,
}: {
  latestQuestion: string;
  latestSuggestion: Message | null;
  messages: Message[];
  isPipActive: boolean;
  openPip: () => void;
  endSession: () => void;
}) {
  return (
    <div>
      {isPipActive ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🪟</div>
          <h2 className="text-xl font-bold mb-2">フロート窓で稼働中</h2>
          <p className="text-sm text-[color:var(--text-dim)] mb-6">会議タブに切り替えてください。フロート窓が常に最前面に出ています</p>
          <button onClick={endSession} className="px-6 py-3 rounded-lg bg-red-500/15 border border-red-400/30 text-red-300 text-sm font-bold">
            ⏹ セッションを終了
          </button>
        </div>
      ) : (
        <>
          <div className="bg-yellow-400/[0.06] border-l-2 border-yellow-400 px-4 py-3 rounded mb-3">
            <div className="text-[10px] font-bold tracking-widest text-yellow-300 uppercase mb-1">❓ 直近の質問</div>
            <div className="text-sm">{latestQuestion || "音声を待っています..."}</div>
          </div>

          {latestSuggestion && (
            <div className="bg-[color:var(--bg2)] border border-[color:var(--accent)] rounded-2xl p-6 mb-4">
              <div className="text-[10px] font-bold tracking-widest text-[color:var(--accent2)] uppercase mb-2">💡 回答候補</div>
              <p className="text-base leading-relaxed mb-4">{latestSuggestion.content}</p>
              {latestSuggestion.cues && latestSuggestion.cues.length > 0 && (
                <div className="border-t border-[color:var(--line)] pt-3 mt-3">
                  <div className="text-[10px] text-[color:var(--text-mute)] uppercase tracking-widest mb-1">▼ 触れるべき要素</div>
                  {latestSuggestion.cues.map((c, i) => (
                    <div key={i} className="text-xs text-[color:var(--text-dim)] leading-relaxed">
                      <span className="text-yellow-400">▸</span> {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button onClick={openPip} className="flex-1 py-3.5 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-xl font-bold">
              🪟 フロート窓で使う
            </button>
            <button onClick={endSession} className="px-5 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm font-bold">
              終了
            </button>
          </div>

          <div className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[color:var(--line)] text-[11px] font-bold tracking-widest text-[color:var(--text-dim)] uppercase">ライブログ</div>
            <div className="max-h-72 overflow-y-auto px-4">
              {messages.slice(-12).reverse().map((m) => (
                <div key={m.id} className="py-2.5 border-b border-white/[0.04] last:border-none text-xs leading-relaxed">
                  {m.content}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DoneView({ messages, startedAt }: { messages: Message[]; startedAt: number | null }) {
  const durationMin = startedAt ? Math.round((Date.now() - startedAt) / 60000) : 0;
  const questions = messages.filter((m) => m.type === "question").length;
  const suggestions = messages.filter((m) => m.type === "suggestion").length;

  return (
    <div className="text-center">
      <div className="text-5xl mb-3">🎉</div>
      <h1 className="text-2xl font-bold mb-2">お疲れさまでした</h1>
      <p className="text-sm text-[color:var(--text-dim)] mb-6">{durationMin}分のセッションが終了しました</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-xl p-5">
          <div className="text-3xl font-bold text-[color:var(--accent2)] tabular">{questions}</div>
          <div className="text-[11px] text-[color:var(--text-dim)] uppercase tracking-widest mt-1">質問数</div>
        </div>
        <div className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-xl p-5">
          <div className="text-3xl font-bold text-[color:var(--accent2)] tabular">{suggestions}</div>
          <div className="text-[11px] text-[color:var(--text-dim)] uppercase tracking-widest mt-1">回答候補数</div>
        </div>
      </div>

      <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-xl font-bold">
        ホームに戻る
      </Link>
    </div>
  );
}

function ErrorView({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3">⚠️</div>
      <h2 className="text-xl font-bold mb-2">開始できませんでした</h2>
      <p className="text-sm text-red-300 mb-6 max-w-md mx-auto whitespace-pre-wrap leading-relaxed">{error ?? "不明なエラー"}</p>
      <button onClick={onRetry} className="px-6 py-3 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-xl font-bold">
        もう一度試す
      </button>
    </div>
  );
}
