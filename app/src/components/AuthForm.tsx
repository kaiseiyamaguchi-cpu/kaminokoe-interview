"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function AuthForm() {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLineLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signIn("line");
      console.log("LINE login result:", result);

      // OAuth flowの場合、redirectURLが返される
      if (result?.redirect) {
        window.location.href = result.redirect.toString();
      }
    } catch (err) {
      console.error("LINE login error:", err);
      setError("LINEログインに失敗しました。もう一度お試しください。");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-accent mb-2">神の声</h1>
        <p className="text-muted-foreground">面接対策AI</p>
      </div>

      <div className="bg-muted rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-center mb-4">
          LINEでログイン
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          初回登録で<span className="font-bold text-primary">30分無料</span>（3チケット）
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleLineLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-[#06C755] text-white rounded-lg hover:bg-[#05b34c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {loading ? (
            "接続中..."
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINEでログイン
            </>
          )}
        </button>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        <p>ログインすることで、</p>
        <p>
          <a href="/terms" className="underline">利用規約</a>
          および
          <a href="/privacy" className="underline">プライバシーポリシー</a>
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
