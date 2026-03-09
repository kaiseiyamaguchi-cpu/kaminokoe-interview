"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type AffiliateService = {
  id: string;
  name: string;
  description: string;
  baseLink: string;
  trackingPixel: string;
};

const AFFILIATE_SERVICES: AffiliateService[] = [
  {
    id: "kimisuka",
    name: "キミスカ",
    description: "企業からスカウトが届く逆求人型就活サービス",
    baseLink: "https://px.a8.net/svt/ejp?a8mat=4AZAW7+BJKL0Y+24ZO+HV7V6",
    trackingPixel: "https://www10.a8.net/0.gif?a8mat=4AZAW7+BJKL0Y+24ZO+HV7V6",
  },
];

export function AffiliatePromo() {
  const [requestedServices, setRequestedServices] = useState<Set<string>>(new Set());
  const [claiming, setClaiming] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const requestReward = useMutation(api.affiliate.requestAffiliateReward);
  const rewardHistory = useQuery(api.affiliate.getAffiliateRewardHistory);
  const trackingId = useQuery(api.affiliate.getUserTrackingId);

  // サービスの状態を取得
  const getServiceStatus = (serviceId: string): "none" | "pending" | "approved" | "rejected" => {
    if (requestedServices.has(serviceId)) return "pending";
    if (!rewardHistory) return "none";
    const reward = rewardHistory.find(
      (r) => r.serviceName?.toLowerCase().includes(serviceId)
    );
    if (reward) return reward.status;
    return "none";
  };

  // id1パラメータ付きリンクを生成
  const generateTrackingLink = (baseLink: string) => {
    if (!trackingId) return baseLink;
    return `${baseLink}&id1=${trackingId}`;
  };

  const handleClaim = async (service: AffiliateService) => {
    setClaiming(service.id);
    setMessage(null);
    try {
      const result = await requestReward({ serviceName: service.name });
      setRequestedServices((prev) => new Set(prev).add(service.id));
      setMessage(result.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      setMessage(errorMessage);
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎁</span>
        <h3 className="font-bold text-foreground">無料で30分ゲット!</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        下記サービスに登録すると、3チケット（30分）がもらえます
      </p>

      {message && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          {message}
        </div>
      )}

      <div className="space-y-3">
        {AFFILIATE_SERVICES.map((service) => {
          const status = getServiceStatus(service.id);

          return (
            <div
              key={service.id}
              className="bg-white rounded-lg p-3 border border-orange-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{service.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {service.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {status === "approved" ? (
                    <span className="text-xs text-green-600 font-medium">
                      取得済み
                    </span>
                  ) : status === "pending" ? (
                    <span className="text-xs text-amber-600 font-medium">
                      審査中
                    </span>
                  ) : status === "rejected" ? (
                    <span className="text-xs text-red-600 font-medium">
                      却下
                    </span>
                  ) : (
                    <>
                      <a
                        href={generateTrackingLink(service.baseLink)}
                        target="_blank"
                        rel="nofollow noopener"
                        className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded hover:bg-primary-dark transition"
                      >
                        登録する
                      </a>
                      <button
                        onClick={() => handleClaim(service)}
                        disabled={claiming === service.id}
                        className="text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        {claiming === service.id
                          ? "処理中..."
                          : "登録済みの方はこちら"}
                      </button>
                      {/* Tracking pixel */}
                      <img
                        src={service.trackingPixel}
                        width="1"
                        height="1"
                        alt=""
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3">
        ※ 各サービス1回限り。承認後にチケットが付与されます。
      </p>
    </div>
  );
}
