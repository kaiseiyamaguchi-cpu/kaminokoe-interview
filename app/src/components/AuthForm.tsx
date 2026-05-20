"use client";

import Image from "next/image";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function AuthForm() {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState<"google" | "line" | null>(null);
  const [error, setError] = useState("");

  const handleProvider = async (provider: "google" | "line") => {
    setError("");
    setLoading(provider);
    try {
      const result = await signIn(provider);
      if (result?.redirect) window.location.href = result.redirect.toString();
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setError(`${provider === "google" ? "Google" : "LINE"} ログインに失敗しました`);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Image src="/icon-512.png" alt="kanpe.ai" width={32} height={32} className="h-8 w-8" />
            <span className="text-2xl font-medium tracking-tight">kanpe.ai</span>
          </div>
          <p className="text-sm text-[color:var(--text-dim)] leading-relaxed">
            面接の暗記大会、降りていい。<br />
            ブラウザだけで使える面接サポート。
          </p>
        </div>

        <div className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-2xl p-6 mb-4">
          <p className="text-xs text-[color:var(--text-dim)] text-center mb-5">
            初回登録で <span className="text-[color:var(--accent2)] font-bold">30分無料</span>（3チケット）
          </p>

          {error && (
            <p className="text-[color:var(--error)] text-sm text-center mb-4">{error}</p>
          )}

          <button
            onClick={() => handleProvider("google")}
            disabled={loading !== null}
            className="w-full mb-3 py-3 px-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center gap-3 font-semibold transition-all"
          >
            {loading === "google" ? (
              "接続中..."
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google でログイン
              </>
            )}
          </button>

          <button
            onClick={() => handleProvider("line")}
            disabled={loading !== null}
            className="w-full py-3 px-4 bg-[#06C755] text-white rounded-xl hover:bg-[#05b34c] disabled:opacity-50 flex items-center justify-center gap-3 font-semibold transition-all"
          >
            {loading === "line" ? (
              "接続中..."
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINE でログイン
              </>
            )}
          </button>
        </div>

        <div className="text-center text-[11px] text-[color:var(--text-mute)] leading-relaxed">
          ログインすると{" "}
          <a href="https://kanpe.ai/legal/terms" className="underline">利用規約</a>
          {" "}と{" "}
          <a href="https://kanpe.ai/legal/privacy" className="underline">プライバシーポリシー</a>
          に同意したものとみなされます
        </div>
      </div>
    </div>
  );
}
