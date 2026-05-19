"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AuthForm } from "@/components/AuthForm";

type Plan = "starter" | "standard" | "interview" | "addon";

const PLANS: Record<
  Plan,
  { name: string; price: number; tickets: number; minutes: number; popular?: boolean }
> = {
  starter: {
    name: "スターター",
    price: 1200,
    tickets: 10,
    minutes: 100,
  },
  standard: {
    name: "スタンダード",
    price: 3600,
    tickets: 30,
    minutes: 300,
    popular: true,
  },
  interview: {
    name: "就活パック",
    price: 9990,
    tickets: 100,
    minutes: 1000,
  },
  addon: {
    name: "追加チケット",
    price: 1300,
    tickets: 10,
    minutes: 100,
  },
};

function PurchaseButton({ plan, userId }: { plan: Plan; userId: string }) {
  const [loading, setLoading] = useState(false);
  const planInfo = PLANS[plan];

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Purchase error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className={`relative w-full p-4 rounded-xl border transition disabled:opacity-50 text-left ${
        planInfo.popular
          ? "border-[color:var(--accent)] bg-[color:var(--accent-bg)]"
          : "border-[color:var(--line)] bg-[color:var(--bg2)] hover:border-[color:var(--line2)]"
      }`}
    >
      {planInfo.popular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[color:var(--accent)] text-white text-[10px] font-medium rounded-full">
          人気
        </span>
      )}
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-[color:var(--text)]">{planInfo.name}</div>
          <div className="text-xs text-[color:var(--text-dim)] mt-0.5">
            {planInfo.tickets}チケット / {planInfo.minutes}分
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-[color:var(--text)] tabular">
            ¥{planInfo.price.toLocaleString()}
          </div>
          <div className="text-[11px] text-[color:var(--text-mute)] tabular">
            ¥{Math.round(planInfo.price / planInfo.tickets)}/チケット
          </div>
        </div>
      </div>
    </button>
  );
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTransactionTypeLabel(type: string) {
  switch (type) {
    case "initial":
      return { label: "初回ボーナス", color: "text-[color:var(--success)]" };
    case "purchase":
      return { label: "購入", color: "text-[color:var(--accent2)]" };
    case "affiliate":
      return { label: "紹介特典", color: "text-[color:var(--accent2)]" };
    case "consume":
      return { label: "使用", color: "text-[color:var(--text-dim)]" };
    default:
      return { label: type, color: "text-[color:var(--text-dim)]" };
  }
}

function PurchaseNotification() {
  const searchParams = useSearchParams();
  const [notification, setNotification] = useState<{ type: "success" | "canceled"; tickets?: number } | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const tickets = searchParams.get("tickets");

    if (success === "true" && tickets) {
      setNotification({ type: "success", tickets: parseInt(tickets) });
      window.history.replaceState({}, "", "/mypage");
    } else if (canceled === "true") {
      setNotification({ type: "canceled" });
      window.history.replaceState({}, "", "/mypage");
    }
  }, [searchParams]);

  if (!notification) return null;

  return (
    <div
      className={`p-4 rounded-xl flex items-center justify-between border ${
        notification.type === "success"
          ? "bg-[color:var(--accent-bg)] border-[color:var(--accent)]/40"
          : "bg-[color:var(--bg2)] border-[color:var(--line)]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">
          {notification.type === "success" ? "🎉" : "↩️"}
        </span>
        <div>
          {notification.type === "success" ? (
            <>
              <p className="font-medium text-[color:var(--text)]">購入完了</p>
              <p className="text-sm text-[color:var(--text-dim)]">
                {notification.tickets}チケットが追加されました
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-[color:var(--text)]">購入をキャンセルしました</p>
              <p className="text-sm text-[color:var(--text-dim)]">
                またのご利用をお待ちしています
              </p>
            </>
          )}
        </div>
      </div>
      <button
        onClick={() => setNotification(null)}
        className="text-[color:var(--text-mute)] hover:text-[color:var(--text-dim)]"
      >
        ✕
      </button>
    </div>
  );
}

function MyPageContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(api.users.getProfile);
  const ticketHistory = useQuery(api.users.getTicketHistory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[color:var(--text-dim)] text-sm">
        読み込み中...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  const tickets = profile?.tickets ?? 0;
  const lowTickets = tickets <= 3;

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      {/* Header */}
      <header className="border-b border-[color:var(--line)] bg-[color:var(--bg)]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon-512.png" alt="kanpe.ai" width={22} height={22} className="h-[22px] w-[22px]" />
            <span className="text-[14px] font-medium tracking-tight text-[color:var(--text)]">kanpe.ai</span>
          </Link>
          <span className="text-xs text-[color:var(--text-mute)]">マイページ</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {/* 購入通知 */}
        <Suspense fallback={null}>
          <PurchaseNotification />
        </Suspense>

        {/* チケット残高 */}
        <section
          className={`rounded-2xl p-6 bg-[color:var(--bg2)] border ${
            lowTickets ? "border-[color:var(--warn)]/40" : "border-[color:var(--line)]"
          }`}
        >
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-wider text-[color:var(--text-mute)] mb-1">
              残りチケット
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-[color:var(--accent2)] tabular">
                {tickets}
              </span>
              <span className="text-base text-[color:var(--text-dim)]">枚</span>
            </div>
            <p className="text-xs text-[color:var(--text-mute)] mt-2 tabular">
              約 {tickets * 10} 分 ・ 1チケット = 10分間の面接サポート
            </p>
            {lowTickets && (
              <p className="text-[11px] text-[color:var(--warn)] mt-2">
                残量が少なくなっています
              </p>
            )}
          </div>

          <div className="mt-5">
            <Link
              href="/"
              className="block w-full py-3 bg-[color:var(--accent)] hover:opacity-90 text-white text-center font-medium rounded-xl transition"
            >
              面接モードを開始
            </Link>
          </div>
        </section>

        {/* チケット購入 */}
        <section className="rounded-2xl p-6 bg-[color:var(--bg2)] border border-[color:var(--line)]">
          <h2 className="text-base font-bold text-[color:var(--text)] mb-4">
            チケットを購入
          </h2>
          <div className="space-y-3">
            {(Object.keys(PLANS) as Plan[]).map((plan) => (
              <PurchaseButton
                key={plan}
                plan={plan}
                userId={profile?.userId ?? ""}
              />
            ))}
          </div>
          <p className="text-[11px] text-[color:var(--text-mute)] mt-4 text-center">
            クレジットカード決済（Stripe）で安全にお支払い
          </p>
        </section>

        {/* チケット履歴 */}
        <section className="rounded-2xl p-6 bg-[color:var(--bg2)] border border-[color:var(--line)]">
          <h2 className="text-base font-bold text-[color:var(--text)] mb-4">履歴</h2>
          {ticketHistory && ticketHistory.length > 0 ? (
            <div className="space-y-2.5">
              {ticketHistory.map((tx) => {
                const typeInfo = getTransactionTypeLabel(tx.type);
                return (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between py-2 border-b border-[color:var(--line)] last:border-0"
                  >
                    <div>
                      <span className={`text-sm font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {tx.description && (
                        <p className="text-xs text-[color:var(--text-mute)]">{tx.description}</p>
                      )}
                      <p className="text-[11px] text-[color:var(--text-mute)] tabular">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`font-bold tabular ${
                        tx.amount > 0 ? "text-[color:var(--success)]" : "text-[color:var(--text-dim)]"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[color:var(--text-mute)] text-center py-4">
              履歴はありません
            </p>
          )}
        </section>

        {/* リンク */}
        <section className="space-y-2 pb-8">
          <Link
            href="/legal/tokushoho"
            className="block text-xs text-[color:var(--text-mute)] hover:text-[color:var(--text-dim)] transition"
          >
            特定商取引法に基づく表示 →
          </Link>
          <Link
            href="/legal/terms"
            className="block text-xs text-[color:var(--text-mute)] hover:text-[color:var(--text-dim)] transition"
          >
            利用規約 →
          </Link>
          <Link
            href="/legal/privacy"
            className="block text-xs text-[color:var(--text-mute)] hover:text-[color:var(--text-dim)] transition"
          >
            プライバシーポリシー →
          </Link>
        </section>
      </main>
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[color:var(--text-dim)] text-sm">
          読み込み中...
        </div>
      }
    >
      <MyPageContent />
    </Suspense>
  );
}
