"use client";

import Link from "next/link";
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
      getOrCreateProfile({});
    }
  }, [profile, getOrCreateProfile]);

  if (profile === undefined) {
    return <div className="animate-pulse text-sm">読み込み中...</div>;
  }

  const tickets = profile?.tickets ?? 0;
  const minutes = tickets * 10;

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/mypage"
        className="text-sm flex items-center gap-2 hover:opacity-80 transition"
      >
        <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg font-medium">
          🎫 {tickets}枚
        </span>
        <span className="text-muted-foreground text-xs">
          （{minutes}分）
        </span>
      </Link>
      <button
        onClick={() => signOut()}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ログアウト
      </button>
    </div>
  );
}
