"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Shell({ children, active }: { children: React.ReactNode; active?: "home" | "mypage" }) {
  const { signOut } = useAuthActions();
  const me = useQuery(api.users.getProfile);

  return (
    <div className="max-w-[880px] mx-auto px-6 pt-8 pb-16">
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[color:var(--line)]">
        <Link href="/" className="flex items-center gap-2 no-underline text-current">
          <Image src="/icon-512.png" alt="kanpe.ai" width={24} height={24} className="h-6 w-6" />
          <span className="text-[15px] font-medium tracking-tight">kanpe.ai</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className={active === "home" ? "font-semibold" : "text-[color:var(--text-dim)]"}>ホーム</Link>
          <Link href="/mypage" className={active === "mypage" ? "font-semibold" : "text-[color:var(--text-dim)]"}>マイページ</Link>
          {me ? (
            <button onClick={() => signOut()} className="text-xs text-[color:var(--text-mute)]">ログアウト</button>
          ) : null}
        </nav>
      </div>
      {children}
    </div>
  );
}
