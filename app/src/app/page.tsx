"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { AuthForm } from "@/components/AuthForm";
import { UserInfo } from "@/components/UserInfo";
import { AffiliatePromo } from "@/components/AffiliatePromo";

// 残り時間をフォーマット
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

type Message = {
  id: string;
  type: "transcript" | "question" | "suggestion" | "system";
  content: string;
  timestamp: Date;
};

type ProfileData = {
  userName: string; // 候補者の名前（話者判定に使用）
  companyUrl: string;
  companyName: string;
  companyVision: string;
  strengths: string;
  experience: string;
  motivation: string;
};

const getSystemInstructions = (profile: ProfileData) => `あなたは面接支援AIです。面接官の質問に対して、就活生がそのまま読み上げられる回答を提供してください。

## 就活生のプロフィール
${profile.companyName ? `【志望企業】${profile.companyName}` : ""}
${profile.companyVision ? `【企業理念・ビジョン】${profile.companyVision}` : ""}
${profile.strengths ? `【強み】${profile.strengths}` : ""}
${profile.experience ? `【ガクチカ】${profile.experience}` : ""}
${profile.motivation ? `【志望理由】${profile.motivation}` : ""}

## 応答しないケース
以下の場合のみ「[SKIP]」と出力：
- 明らかに就活生自身の発言（自分が話している内容）
- 単純な挨拶のみ（よろしくお願いします、ありがとうございます等）
- 面接官の事務的な案内（次の質問に移りますね、等）

## 応答するケース（積極的に回答）
面接官からの質問には**すべて回答**する：
- 定番の質問（志望動機、自己PR、ガクチカ、強み・弱み）
- 想定外・変わった質問（最近読んだ本、趣味、時事問題、フェルミ推定等）
- 深掘り質問（なぜ？具体的には？他には？）
- 圧迫気味の質問にも冷静に対応

**重要**: 質問かどうか迷ったら、回答を出力する（SKIPしない）

## 出力ルール
1. 回答は**そのまま声に出して読める文章**にする（箇条書きNG、解説NG）
2. 「〜と思います」「〜です」など、自然な敬語の一人称で書く
3. プロフィール情報を自然に織り込む
${profile.companyVision ? `4. 企業理念に沿った回答にする` : ""}

## 想定外の質問への対応
- プロフィールに情報がなくても、一般的で無難な回答を生成
- 「わかりません」とは言わず、考え方や姿勢を示す回答にする
- フェルミ推定等は論理的な思考プロセスを示す

## 出力形式（厳守）
質問に対する回答文をそのまま出力。余計な前置きや解説は一切不要。

## 重要
- 30秒〜1分で読める長さ（150〜300文字程度）
- 具体的なエピソードや数字を含める
- 暗記感が出ないよう、自然な話し言葉で
`;

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const [profile, setProfile] = useState<ProfileData>({
    userName: "",
    companyUrl: "",
    companyName: "",
    companyVision: "",
    strengths: "",
    experience: "",
    motivation: "",
  });

  // ターン追跡: "interviewer" = 面接官の番, "candidate" = 候補者の番
  const [currentTurn, setCurrentTurn] = useState<"interviewer" | "candidate">("interviewer");
  const lastSuggestionTimeRef = useRef<number>(0);
  const [isLoadingVision, setIsLoadingVision] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<Id<"sessionLogs"> | null>(null);

  // チケット・時間管理
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [maxDurationMinutes, setMaxDurationMinutes] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = useMutation(api.sessions.startSession);
  const endSession = useMutation(api.sessions.endSession);
  const userProfile = useQuery(api.users.getProfile);
  const userTickets = userProfile?.tickets ?? 0;

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = useCallback(
    (type: Message["type"], content: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type,
          content,
          timestamp: new Date(),
        },
      ]);
    },
    []
  );

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setShowSettings(false);

    try {
      // チケット消費セッション開始
      const sessionResult = await startSession({ ticketCount: selectedTickets });
      setCurrentSessionId(sessionResult.sessionId);
      setMaxDurationMinutes(sessionResult.maxDurationMinutes);
      setSessionStartTime(Date.now());
      setRemainingSeconds(sessionResult.maxDurationMinutes * 60);

      const tokenRes = await fetch("/api/token");
      if (!tokenRes.ok) {
        throw new Error("トークン取得に失敗しました");
      }
      const tokenData = await tokenRes.json();
      const token = tokenData.value;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.addTrack(stream.getTracks()[0]);

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.onopen = () => {
        dc.send(
          JSON.stringify({
            type: "session.update",
            session: {
              type: "realtime",
              output_modalities: ["text"],
              instructions: getSystemInstructions(profile),
              audio: {
                input: {
                  transcription: {
                    model: "gpt-4o-mini-transcribe",
                    language: "ja",
                  },
                  turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 800,
                  },
                },
              },
            },
          })
        );
        addMessage("system", "会話を聞いています...");
        setIsListening(true);
      };

      dc.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealtimeEvent(data);
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!sdpRes.ok) {
        throw new Error(`接続に失敗しました`);
      }

      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: await sdpRes.text(),
      };
      await pc.setRemoteDescription(answer);

      setIsConnected(true);
    } catch (err) {
      console.error("Connection error:", err);
      setError(err instanceof Error ? err.message : "接続エラー");
      disconnect();
    } finally {
      setIsConnecting(false);
    }
  }, [addMessage, profile, startSession, selectedTickets]);

  // 強い質問パターン（これがあれば確実に面接官）
  const isStrongQuestionPattern = (text: string): boolean => {
    const patterns = [
      /[?？]$/,
      /ですか[。]?$/,
      /ますか[。]?$/,
      /でしょうか[。]?$/,
      /教えてください/,
      /聞かせてください/,
      /お聞かせ/,
    ];
    return patterns.some((p) => p.test(text));
  };

  // 候補者の名前を含むかチェック
  const containsUserName = (text: string): boolean => {
    if (!profile.userName || profile.userName.length < 2) return false;
    return text.includes(profile.userName);
  };

  // 話者を判定（ターン追跡 + パターン + 名前）
  const determineSpeaker = (text: string): "interviewer" | "candidate" => {
    // 1. AI提案直後（10秒以内）→ 候補者の回答（最優先）
    const timeSinceLastSuggestion = Date.now() - lastSuggestionTimeRef.current;
    if (timeSinceLastSuggestion < 10000 && currentTurn === "candidate") {
      // ただし、明確な新しい質問パターンは例外
      if (isStrongQuestionPattern(text) && timeSinceLastSuggestion > 5000) {
        return "interviewer";
      }
      return "candidate";
    }

    // 2. 自分の名前を含む自己紹介 → 候補者
    if (containsUserName(text) && /と申します|です。.*よろしく/.test(text)) {
      return "candidate";
    }

    // 3. 強い質問パターン → 面接官
    if (isStrongQuestionPattern(text)) {
      return "interviewer";
    }

    // 4. 面接官っぽいキーワード
    const interviewerKeywords = [
      /株式会社.*(?:の|と申し)/,
      /人事|採用|担当/,
      /では早速|それでは|次の質問/,
      /志望動機.*(?:を|について)/,
      /自己紹介.*(?:を|して)/,
    ];
    if (interviewerKeywords.some((p) => p.test(text))) {
      return "interviewer";
    }

    // 5. 候補者っぽいキーワード
    const candidateKeywords = [
      /大学|学部|サークル/,
      /私(?:は|が|の)/,
      /御社|貴社/,
      /と考えて|に貢献|を活かし/,
      /ございます。$/,
    ];
    if (candidateKeywords.some((p) => p.test(text))) {
      return "candidate";
    }

    // 6. デフォルト: 現在のターンに従う
    return currentTurn;
  };

  const handleRealtimeEvent = useCallback(
    (event: { type: string; [key: string]: unknown }) => {
      switch (event.type) {
        case "conversation.item.input_audio_transcription.completed":
          if (event.transcript) {
            const text = event.transcript as string;
            const speaker = determineSpeaker(text);

            if (speaker === "interviewer") {
              addMessage("question", text);
              setCurrentTurn("candidate"); // 次は候補者の番
            } else {
              addMessage("transcript", text);
              // 候補者が話し終わったら面接官の番に戻る（次の発言で判定）
            }
          }
          break;

        case "response.output_text.done":
          if (event.text) {
            const text = event.text as string;
            if (!text.includes("[SKIP]")) {
              addMessage("suggestion", text);
              lastSuggestionTimeRef.current = Date.now();
              setCurrentTurn("candidate"); // 提案後は候補者が話す番
            }
          }
          break;

        case "response.text.done":
          if (event.text) {
            const text = event.text as string;
            if (!text.includes("[SKIP]")) {
              addMessage("suggestion", text);
              lastSuggestionTimeRef.current = Date.now();
              setCurrentTurn("candidate");
            }
          }
          break;

        case "response.audio_transcript.done":
          if (event.transcript) {
            const text = event.transcript as string;
            if (!text.includes("[SKIP]")) {
              addMessage("suggestion", text);
              lastSuggestionTimeRef.current = Date.now();
              setCurrentTurn("candidate");
            }
          }
          break;

        case "input_audio_buffer.speech_started":
          setIsListening(true);
          break;

        case "input_audio_buffer.speech_stopped":
          setIsListening(false);
          break;

        case "error":
          console.error("API error:", event);
          break;
      }
    },
    [addMessage]
  );

  const disconnect = useCallback(async () => {
    // タイマーをクリア
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // セッション終了
    if (currentSessionId) {
      try {
        await endSession({ sessionId: currentSessionId });
      } catch (err) {
        console.error("Failed to end session:", err);
      }
      setCurrentSessionId(null);
    }

    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsConnected(false);
    setIsListening(false);
    setShowSettings(true);
    setMessages([]); // 会話をリセット
    setSessionStartTime(null);
    setRemainingSeconds(null);
    setMaxDurationMinutes(0);
  }, [currentSessionId, endSession]);

  // 残り時間タイマー
  useEffect(() => {
    if (!isConnected || !sessionStartTime || maxDurationMinutes === 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      const remaining = maxDurationMinutes * 60 - elapsed;
      setRemainingSeconds(remaining);

      // 時間切れで自動終了
      if (remaining <= 0) {
        addMessage("system", "時間切れです。セッションを終了します。");
        disconnect();
      }
      // 残り1分で警告
      else if (remaining === 60) {
        addMessage("system", "残り1分です。");
      }
      // 残り30秒で警告
      else if (remaining === 30) {
        addMessage("system", "残り30秒です。");
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isConnected, sessionStartTime, maxDurationMinutes, disconnect, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const updateProfile = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未認証
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <AuthForm />
      </div>
    );
  }

  // 認証済み
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-accent">神の声</h1>
            <div className="flex items-center gap-4">
              {isListening && isConnected && (
                <div className="flex gap-0.5">
                  <span className="w-1 h-3 bg-primary rounded-full animate-pulse"></span>
                  <span className="w-1 h-4 bg-primary rounded-full animate-pulse"></span>
                  <span className="w-1 h-2 bg-primary rounded-full animate-pulse"></span>
                </div>
              )}
              <UserInfo />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {showSettings && !isConnected ? (
          <div className="max-w-2xl mx-auto p-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground mb-1">
                面接情報を入力
              </h2>
              <p className="text-sm text-muted-foreground">
                入力した情報をもとに、あなたに合った回答を提案します
              </p>
            </div>

            <div className="space-y-4">
              {/* 名前入力（話者判定に使用） */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  あなたの名前 <span className="text-xs text-muted-foreground">（話者判定に使用）</span>
                </label>
                <input
                  type="text"
                  placeholder="例：山口"
                  value={profile.userName}
                  onChange={(e) => updateProfile("userName", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="bg-muted rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  志望企業
                </h3>
                <input
                  type="text"
                  placeholder="企業名"
                  value={profile.companyName}
                  onChange={(e) => updateProfile("companyName", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="企業URL（理念ページ等）"
                    value={profile.companyUrl}
                    onChange={(e) => updateProfile("companyUrl", e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!profile.companyUrl) return;
                      setIsLoadingVision(true);
                      try {
                        const res = await fetch("/api/scrape-company", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ url: profile.companyUrl }),
                        });
                        const data = await res.json();
                        if (data.vision) {
                          updateProfile("companyVision", data.vision);
                        }
                      } catch {
                        console.error("Failed to fetch vision");
                      } finally {
                        setIsLoadingVision(false);
                      }
                    }}
                    disabled={!profile.companyUrl || isLoadingVision}
                    className="px-3 py-2 bg-primary text-white text-sm rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isLoadingVision ? "..." : "抽出"}
                  </button>
                </div>
                {profile.companyVision && (
                  <div className="bg-white border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      抽出された企業理念
                    </p>
                    <p className="text-sm text-foreground">
                      {profile.companyVision}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  強み
                </label>
                <textarea
                  placeholder="例：粘り強さ、チームワーク、課題解決力..."
                  value={profile.strengths}
                  onChange={(e) => updateProfile("strengths", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  ガクチカ（学生時代に力を入れたこと）
                </label>
                <textarea
                  placeholder="例：サークルで100人規模のイベントを企画運営。集客に苦戦したが、SNS戦略を見直して目標達成..."
                  value={profile.experience}
                  onChange={(e) => updateProfile("experience", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  志望理由
                </label>
                <textarea
                  placeholder="例：御社のミッションに共感。特に〇〇事業で△△に挑戦したい..."
                  value={profile.motivation}
                  onChange={(e) => updateProfile("motivation", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {/* アフィリエイト誘導 */}
              <AffiliatePromo />
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-4 space-y-3">
            {messages.length === 0 && isConnected && (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-sm">面接の会話を聞いています...</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl ${
                  msg.type === "question"
                    ? "bg-amber-50 border-l-4 border-amber-400 text-foreground"
                    : msg.type === "transcript"
                      ? "bg-muted text-muted-foreground text-sm ml-8"
                      : msg.type === "suggestion"
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground text-sm text-center"
                }`}
              >
                {msg.type === "question" && (
                  <span className="text-xs text-amber-600 font-medium block mb-1">
                    👔 面接官
                  </span>
                )}
                {msg.type === "transcript" && (
                  <span className="text-xs text-muted-foreground block mb-1">
                    🙋 あなた
                  </span>
                )}
                {msg.type === "suggestion" && (
                  <span className="text-xs text-white/70 block mb-2">
                    💬 こう答えよう
                  </span>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {error && (
        <div className="bg-red-50 border-t border-red-200 p-3 text-center text-red-600 text-sm">
          {error}
        </div>
      )}

      <footer className="border-t border-border bg-white p-4">
        <div className="max-w-2xl mx-auto">
          {!isConnected ? (
            <div className="space-y-3">
              {/* チケット選択 */}
              <div className="flex items-center justify-between bg-muted rounded-xl p-3">
                <span className="text-sm font-medium text-foreground">
                  使用チケット
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTickets(Math.max(1, selectedTickets - 1))}
                    disabled={selectedTickets <= 1}
                    className="w-8 h-8 rounded-lg bg-white border border-border text-foreground hover:bg-gray-50 disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-bold text-lg">
                    {selectedTickets}枚
                  </span>
                  <button
                    onClick={() => setSelectedTickets(Math.min(userTickets, selectedTickets + 1))}
                    disabled={selectedTickets >= userTickets}
                    className="w-8 h-8 rounded-lg bg-white border border-border text-foreground hover:bg-gray-50 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {selectedTickets * 10}分間利用可能（残り{userTickets}枚）
              </div>
              <button
                onClick={connect}
                disabled={isConnecting || userTickets < 1}
                className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-medium text-lg transition-colors"
              >
                {isConnecting ? "接続中..." : userTickets < 1 ? "チケット不足" : "🎤 開始"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 残り時間表示 */}
              {remainingSeconds !== null && (
                <div className={`text-center py-2 rounded-xl font-bold text-lg ${
                  remainingSeconds <= 60
                    ? "bg-red-100 text-red-600"
                    : remainingSeconds <= 180
                    ? "bg-amber-100 text-amber-600"
                    : "bg-green-100 text-green-600"
                }`}>
                  残り {formatTime(remainingSeconds)}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={clearMessages}
                  className="flex-1 py-3 bg-muted hover:bg-gray-200 text-foreground rounded-xl font-medium transition-colors"
                >
                  クリア
                </button>
                <button
                  onClick={disconnect}
                  className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors"
                >
                  終了
                </button>
              </div>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground text-center mt-3">
            ※ 面接練習としてご利用ください
          </p>
        </div>
      </footer>
    </div>
  );
}
