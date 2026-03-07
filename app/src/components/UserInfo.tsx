"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export function UserInfo() {
  const { signOut } = useAuthActions();
  const profile = useQuery(api.users.getProfile);
  const getOrCreateProfile = useMutation(api.users.getOrCreateProfile);

  // 初回ログイン時にプロフィールを作成
  useEffect(() => {
    if (profile === null) {
      getOrCreateProfile();
    }
  }, [profile, getOrCreateProfile]);

  if (profile === undefined) {
    return <div className="animate-pulse">読み込み中...</div>;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <span className="font-medium">残りセッション:</span>{" "}
        <span className="text-blue-600 font-bold">{profile?.sessions ?? 0}回</span>
      </div>
      <button
        onClick={() => signOut()}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ログアウト
      </button>
    </div>
  );
}
