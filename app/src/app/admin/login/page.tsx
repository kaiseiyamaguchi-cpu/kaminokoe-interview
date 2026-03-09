"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();

  // 既にログイン済みの場合はリダイレクト
  if (isAuthenticated) {
    router.push("/admin/affiliate");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("flow", isSignUp ? "signUp" : "signIn");

      await signIn("password", formData);
      router.push("/admin/affiliate");
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        err instanceof Error
          ? err.message
          : isSignUp
          ? "登録に失敗しました。このメールアドレスは登録できません。"
          : "ログインに失敗しました。メールアドレスまたはパスワードが正しくありません。"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            管理者ログイン
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                placeholder="admin@kaminokoe.jp"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                placeholder="8文字以上"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? "処理中..." : isSignUp ? "新規登録" : "ログイン"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp
                ? "既にアカウントをお持ちの方はこちら"
                : "初めての方はこちら（新規登録）"}
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-500 text-center">
            ※ 管理者専用ページです。一般ユーザーはLINEログインをご利用ください。
          </p>
        </div>
      </div>
    </div>
  );
}
