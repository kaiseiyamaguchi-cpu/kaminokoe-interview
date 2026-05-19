"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AuthForm } from "@/components/AuthForm";
import { Shell } from "@/components/Shell";
import { useState } from "react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[color:var(--text-dim)] text-sm">読み込み中...</div>;
  }
  if (!isAuthenticated) return <AuthForm />;
  return <Home />;
}

function Home() {
  const profile = useQuery(api.users.getProfile);
  const preps = useQuery(api.interviewPrep.listCompanyPreps);
  const [selectedPrepId, setSelectedPrepId] = useState<string | null>(null);
  const [tickets, setTickets] = useState(1);

  const userName = profile?.displayName ?? "";
  const remainingTickets = profile?.tickets ?? 0;

  const liveHref = `/live?tickets=${tickets}${selectedPrepId ? `&prepId=${selectedPrepId}` : ""}`;

  return (
    <Shell active="home">
      <h1 className="text-2xl font-bold mb-1">
        こんにちは{userName ? `、${userName}さん` : ""} 👋
      </h1>
      <p className="text-sm text-[color:var(--text-dim)] mb-6">
        会議（Zoom / Meet / Teams）をブラウザで開いて、かんぺに音声を共有してください。
      </p>

      <div className="flex items-center justify-between px-5 py-3.5 bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-xl mb-6">
        <div>
          <div className="text-[11px] text-[color:var(--text-mute)]">残りチケット</div>
          <div className="text-2xl font-bold text-[color:var(--accent2)] tabular">
            {remainingTickets} <span className="text-[11px] text-[color:var(--text-dim)] font-normal">/ 1チケット = 10分</span>
          </div>
        </div>
        <Link href="/mypage" className="px-4 py-2 rounded-lg border border-[color:var(--line2)] text-sm">＋ チケット購入</Link>
      </div>

      <div className="bg-gradient-to-br from-indigo-500/[0.08] to-transparent border border-indigo-400/30 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">🚀 面接モードを開始</h2>

        <div className="mb-4">
          <label className="text-xs text-[color:var(--text-dim)] block mb-2">企業対策（任意）</label>
          <select
            value={selectedPrepId ?? ""}
            onChange={(e) => setSelectedPrepId(e.target.value || null)}
            className="w-full bg-[color:var(--bg)] border border-[color:var(--line2)] text-[color:var(--text)] px-3 py-2.5 rounded-lg text-sm"
          >
            <option value="">未指定（プロフィールのみ使用）</option>
            {preps?.map((p) => (
              <option key={p._id} value={p._id}>{p.companyName}</option>
            ))}
          </select>
          <p className="text-[11px] text-[color:var(--text-mute)] mt-1.5">
            <Link href="/mypage" className="underline">マイページ</Link>で事前に企業対策を作っておくと精度が上がります
          </p>
        </div>

        <div className="mb-5">
          <label className="text-xs text-[color:var(--text-dim)] block mb-2">時間</label>
          <div className="flex items-center justify-between bg-[color:var(--bg)] border border-[color:var(--line2)] rounded-lg px-4 py-3">
            <span className="text-sm">時間</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setTickets(Math.max(1, tickets - 1))} className="text-xl text-[color:var(--text-dim)] w-6">−</button>
              <span className="text-lg font-bold tabular w-12 text-center">{tickets * 10}分</span>
              <button onClick={() => setTickets(Math.min(Math.max(remainingTickets, 1), tickets + 1))} className="text-xl w-6 bg-[color:var(--bg3)] rounded">＋</button>
            </div>
          </div>
        </div>

        <Link
          href={liveHref}
          className={`block w-full text-center py-3.5 rounded-xl text-base font-bold transition-all ${
            remainingTickets >= tickets
              ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"
              : "bg-[color:var(--bg3)] text-[color:var(--text-mute)] pointer-events-none"
          }`}
        >
          面接を開始
        </Link>

        {remainingTickets < tickets && (
          <p className="text-xs text-[color:var(--warn)] text-center mt-3">
            チケットが不足しています。マイページで購入してください
          </p>
        )}

        <p className="text-[11px] text-[color:var(--text-mute)] text-center mt-3">
          ※ Chrome / Edge / Brave 推奨。Safari は機能制限あり
        </p>
      </div>

      <h2 className="text-base font-bold mb-1 mt-8">📋 マイページ</h2>
      <p className="text-[11px] text-[color:var(--text-mute)] mb-3">企業対策・想定問答の編集・チケット購入はこちらから</p>
      <Link
        href="/mypage"
        className="flex items-center justify-between px-5 py-4 bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-xl mb-2 hover:border-[color:var(--line2)]"
      >
        <div>
          <div className="font-semibold text-sm">企業対策と想定問答を編集</div>
          <div className="text-[11px] text-[color:var(--text-dim)] mt-0.5">登録済み {preps?.length ?? 0} 社</div>
        </div>
        <span className="text-[color:var(--text-dim)]">→</span>
      </Link>
    </Shell>
  );
}
