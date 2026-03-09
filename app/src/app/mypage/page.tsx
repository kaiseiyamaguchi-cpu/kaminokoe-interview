"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AuthForm } from "@/components/AuthForm";

type Plan = "ticket1" | "ticket3" | "ticket18" | "ticket36";

const PLANS: Record<Plan, { name: string; price: number; tickets: number; minutes: number; popular?: boolean }> = {
  ticket1: {
    name: "1チケット",
    price: 200,
    tickets: 1,
    minutes: 10,
  },
  ticket3: {
    name: "30分パック",
    price: 500,
    tickets: 3,
    minutes: 30,
  },
  ticket18: {
    name: "5回分パック",
    price: 2500,
    tickets: 18,
    minutes: 180,
    popular: true,
  },
  ticket36: {
    name: "10回分パック",
    price: 5000,
    tickets: 36,
    minutes: 360,
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
      if (data.url) {
        window.location.href = data.url;
      }
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
      className={`relative w-full p-4 border-2 rounded-xl transition disabled:opacity-50 ${
        planInfo.popular
          ? "border-[#f97316] bg-[#fff7ed]"
          : "border-[#e5e7eb] hover:border-[#f97316] hover:bg-[#fffbf7]"
      }`}
    >
      {planInfo.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#f97316] text-white text-xs rounded-full">
          人気
        </span>
      )}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <div className="font-medium text-[#1e3a5f]">{planInfo.name}</div>
          <div className="text-xs text-[#6b7280]">
            {planInfo.tickets}チケット / {planInfo.minutes}分
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-[#1e3a5f]">¥{planInfo.price.toLocaleString()}</div>
          <div className="text-xs text-[#6b7280]">
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
      return { label: "初回ボーナス", color: "text-green-600" };
    case "purchase":
      return { label: "購入", color: "text-blue-600" };
    case "affiliate":
      return { label: "紹介特典", color: "text-purple-600" };
    case "consume":
      return { label: "使用", color: "text-gray-600" };
    default:
      return { label: type, color: "text-gray-600" };
  }
}

// 購入通知コンポーネント（useSearchParamsを使用）
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
      className={`p-4 rounded-xl flex items-center justify-between ${
        notification.type === "success"
          ? "bg-green-50 border border-green-200"
          : "bg-gray-50 border border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">
          {notification.type === "success" ? "🎉" : "↩️"}
        </span>
        <div>
          {notification.type === "success" ? (
            <>
              <p className="font-medium text-green-800">購入完了</p>
              <p className="text-sm text-green-600">
                {notification.tickets}チケットが追加されました
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-gray-800">購入をキャンセルしました</p>
              <p className="text-sm text-gray-600">
                またのご利用をお待ちしています
              </p>
            </>
          )}
        </div>
      </div>
      <button
        onClick={() => setNotification(null)}
        className="text-gray-400 hover:text-gray-600"
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
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-medium text-[#1e3a5f]">
            神の声
          </Link>
          <span className="text-sm text-[#6b7280]">マイページ</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 購入通知 */}
        <Suspense fallback={null}>
          <PurchaseNotification />
        </Suspense>

        {/* チケット残高 */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-center">
            <p className="text-sm text-[#6b7280] mb-1">残りチケット</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-bold text-[#1e3a5f]">
                {profile?.tickets ?? 0}
              </span>
              <span className="text-lg text-[#6b7280]">チケット</span>
            </div>
            <p className="text-xs text-[#9ca3af] mt-2">
              1チケット = 10分間の面接練習
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/"
              className="block w-full py-3 bg-[#f97316] hover:bg-[#ea580c] text-white text-center font-medium rounded-xl transition"
            >
              面接練習を始める
            </Link>
          </div>
        </section>

        {/* チケット購入 */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-4">
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
          <p className="text-xs text-[#9ca3af] mt-4 text-center">
            クレジットカード決済（Stripe）で安全にお支払い
          </p>
        </section>

        {/* チケット履歴 */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-4">履歴</h2>
          {ticketHistory && ticketHistory.length > 0 ? (
            <div className="space-y-3">
              {ticketHistory.map((tx) => {
                const typeInfo = getTransactionTypeLabel(tx.type);
                return (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between py-2 border-b border-[#f3f4f6] last:border-0"
                  >
                    <div>
                      <span className={`text-sm font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {tx.description && (
                        <p className="text-xs text-[#9ca3af]">{tx.description}</p>
                      )}
                      <p className="text-xs text-[#d1d5db]">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`font-bold ${
                        tx.amount > 0 ? "text-green-600" : "text-[#6b7280]"
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
            <p className="text-sm text-[#9ca3af] text-center py-4">
              履歴はありません
            </p>
          )}
        </section>

        {/* リンク */}
        <section className="space-y-2">
          <Link
            href="/legal/tokushoho"
            className="block text-sm text-[#6b7280] hover:text-[#374151] transition"
          >
            特定商取引法に基づく表示 →
          </Link>
          <Link
            href="/legal/terms"
            className="block text-sm text-[#6b7280] hover:text-[#374151] transition"
          >
            利用規約 →
          </Link>
          <Link
            href="/legal/privacy"
            className="block text-sm text-[#6b7280] hover:text-[#374151] transition"
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
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#f97316] border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <MyPageContent />
    </Suspense>
  );
}
