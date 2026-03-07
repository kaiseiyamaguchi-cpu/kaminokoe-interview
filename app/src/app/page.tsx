"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Message = {
  id: string;
  type: "transcript" | "question" | "suggestion" | "system";
  content: string;
  timestamp: Date;
};

type ProfileData = {
  companyUrl: string;
  companyName: string;
  companyVision: string; // 自動抽出 or 手動入力
  strengths: string;
  experience: string; // ガクチカ
  motivation: string; // 志望理由
};

const getSystemInstructions = (profile: ProfileData) => `あなたは面接支援AIです。面接官の質問に対して、就活生がそのまま読み上げられる回答を提供してください。

## 就活生のプロフィール
${profile.companyName ? `【志望企業】${profile.companyName}` : ""}
${profile.companyVision ? `【企業理念・ビジョン】${profile.companyVision}` : ""}
${profile.strengths ? `【強み】${profile.strengths}` : ""}
${profile.experience ? `【ガクチカ】${profile.experience}` : ""}
${profile.motivation ? `【志望理由】${profile.motivation}` : ""}

## 応答しないケース（厳守）
以下の場合は「[SKIP]」とだけ出力し、それ以外は何も出力しない：
- 就活生（面接を受ける側）の発言
- 挨拶（よろしくお願いします、ありがとうございます、失礼します、等）
- 雑談や世間話
- 面接官の説明や案内

## 応答するケース
面接官からの実質的な質問のみ：
- 「〜を教えてください」「〜について聞かせてください」
- 「なぜ〜ですか」「どのように〜」
- 志望動機、自己PR、ガクチカ、強み・弱み等の質問

## 出力ルール
1. 回答は**そのまま声に出して読める文章**にする（箇条書きNG、解説NG）
2. 「〜と思います」「〜です」など、自然な敬語の一人称で書く
3. プロフィール情報を自然に織り込む
${profile.companyVision ? `4. 企業理念に沿った回答にする` : ""}

## 出力形式（厳守）
質問に対する回答文をそのまま出力。余計な前置きや解説は一切不要。

## 重要
- 30秒〜1分で読める長さ（150〜300文字程度）
- 具体的なエピソードや数字を含める
- 暗記感が出ないよう、自然な話し言葉で
`;

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const [profile, setProfile] = useState<ProfileData>({
    companyUrl: "",
    companyName: "",
    companyVision: "",
    strengths: "",
    experience: "",
    motivation: "",
  });
  const [isLoadingVision, setIsLoadingVision] = useState(false);

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
                    model: "gpt-4o-transcribe",
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
  }, [addMessage, profile]);

  // 面接官の質問かどうかを判定
  const isInterviewerQuestion = (text: string): boolean => {
    const questionPatterns = [
      /[?？]$/,
      /ですか[。]?$/,
      /ますか[。]?$/,
      /でしょうか[。]?$/,
      /教えてください/,
      /聞かせてください/,
      /お聞かせ/,
      /どうですか/,
      /いかがですか/,
      /ありますか/,
      /志望動機/,
      /自己紹介/,
      /自己PR/,
      /強み/,
      /弱み/,
      /ガクチカ/,
      /学生時代/,
      /なぜ.*(?:です|ます)/,
      /どのような/,
      /どんな/,
    ];
    return questionPatterns.some(pattern => pattern.test(text));
  };

  const handleRealtimeEvent = useCallback(
    (event: { type: string; [key: string]: unknown }) => {
      switch (event.type) {
        case "conversation.item.input_audio_transcription.completed":
          if (event.transcript) {
            const text = event.transcript as string;
            // 質問っぽければ面接官、そうでなければ自分の発言
            if (isInterviewerQuestion(text)) {
              addMessage("question", text);
            } else {
              addMessage("transcript", text);
            }
          }
          break;

        case "response.output_text.done":
          if (event.text) {
            const text = event.text as string;
            // [SKIP]を含む応答は無視
            if (!text.includes("[SKIP]")) {
              addMessage("suggestion", text);
            }
          }
          break;

        case "response.text.done":
          if (event.text) {
            const text = event.text as string;
            if (!text.includes("[SKIP]")) {
              addMessage("suggestion", text);
            }
          }
          break;

        case "response.audio_transcript.done":
          if (event.transcript) {
            const text = event.transcript as string;
            if (!text.includes("[SKIP]")) {
              addMessage("suggestion", text);
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

  const disconnect = useCallback(() => {
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
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const updateProfile = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary">Kaminokoe</h1>
            <div className="flex items-center gap-2">
              {isListening && isConnected && (
                <div className="flex gap-0.5 mr-2">
                  <span className="w-1 h-3 bg-primary rounded-full animate-pulse"></span>
                  <span className="w-1 h-4 bg-primary rounded-full animate-pulse"></span>
                  <span className="w-1 h-2 bg-primary rounded-full animate-pulse"></span>
                </div>
              )}
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-success" : "bg-gray-300"}`}
              />
              <span className="text-xs text-muted-foreground">
                {isConnected ? "接続中" : "未接続"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {showSettings && !isConnected ? (
          /* Settings Form */
          <div className="max-w-2xl mx-auto p-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground mb-1">面接情報を入力</h2>
              <p className="text-sm text-muted-foreground">
                入力した情報をもとに、あなたに合った回答を提案します
              </p>
            </div>

            <div className="space-y-4">
              {/* Company Info */}
              <div className="bg-muted rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-foreground">志望企業</h3>
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
                    <p className="text-xs text-muted-foreground mb-1">抽出された企業理念</p>
                    <p className="text-sm text-foreground">{profile.companyVision}</p>
                  </div>
                )}
              </div>

              {/* Strengths */}
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

              {/* Experience (ガクチカ) */}
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

              {/* Motivation */}
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
            </div>
          </div>
        ) : (
          /* Messages */
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
                  <span className="text-xs text-amber-600 font-medium block mb-1">👔 面接官</span>
                )}
                {msg.type === "transcript" && (
                  <span className="text-xs text-muted-foreground block mb-1">🙋 あなた</span>
                )}
                {msg.type === "suggestion" && (
                  <span className="text-xs text-white/70 block mb-2">💬 こう答えよう</span>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 p-3 text-center text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-white p-4">
        <div className="max-w-2xl mx-auto">
          {!isConnected ? (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-medium text-lg transition-colors"
            >
              {isConnecting ? "接続中..." : "🎤 開始"}
            </button>
          ) : (
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
          )}
          <p className="text-[10px] text-muted-foreground text-center mt-3">
            ※ 面接練習としてご利用ください
          </p>
        </div>
      </footer>
    </div>
  );
}
