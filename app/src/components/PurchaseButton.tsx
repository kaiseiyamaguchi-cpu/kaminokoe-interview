"use client";

import { useState } from "react";
import { useQuery, Authenticated } from "convex/react";
import { api } from "../../convex/_generated/api";

type Plan = "single" | "pack10" | "pack15";

const PLANS = {
  single: {
    name: "1セッション",
    price: 398,
    sessions: 1,
  },
  pack10: {
    name: "10セッション",
    price: 3580,
    sessions: 10,
    discount: "10%OFF",
  },
  pack15: {
    name: "15セッション",
    price: 4980,
    sessions: 15,
    discount: "15%OFF",
  },
} as const;

export function PurchaseButton({ plan }: { plan: Plan }) {
  const [loading, setLoading] = useState(false);
  const profile = useQuery(api.users.getProfile);
  const planInfo = PLANS[plan];

  const handlePurchase = async () => {
    if (!profile?.userId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          userId: profile.userId,
        }),
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
      className="w-full p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50"
    >
      <div className="flex justify-between items-center">
        <div className="text-left">
          <div className="font-medium">{planInfo.name}</div>
          {"discount" in planInfo && (
            <span className="text-xs text-green-600">{planInfo.discount}</span>
          )}
        </div>
        <div className="text-right">
          <div className="font-bold">¥{planInfo.price.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            ¥{Math.round(planInfo.price / planInfo.sessions)}/回
          </div>
        </div>
      </div>
    </button>
  );
}

export function PurchaseOptions() {
  return (
    <Authenticated>
      <div className="space-y-3">
        <h3 className="font-bold text-lg">セッションを購入</h3>
        <PurchaseButton plan="single" />
        <PurchaseButton plan="pack10" />
        <PurchaseButton plan="pack15" />
      </div>
    </Authenticated>
  );
}
