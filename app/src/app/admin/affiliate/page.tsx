"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminAffiliatePage() {
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [processing, setProcessing] = useState<string | null>(null);

  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  const isAdmin = useQuery(api.affiliate.isAdmin);
  const pendingRequests = useQuery(api.affiliate.getPendingAffiliateRequests);
  const allRequests = useQuery(api.affiliate.getAllAffiliateRequests);

  // 未認証の場合はログインページへ
  if (!isLoading && !isAuthenticated) {
    router.push("/admin/login");
    return null;
  }

  const approveReward = useMutation(api.affiliate.approveAffiliateReward);
  const rejectReward = useMutation(api.affiliate.rejectAffiliateReward);

  const handleApprove = async (rewardId: Id<"affiliateRewards">) => {
    setProcessing(rewardId);
    try {
      await approveReward({ rewardId });
    } catch (err) {
      console.error("Approval failed:", err);
      alert("承認に失敗しました");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (rewardId: Id<"affiliateRewards">) => {
    if (!confirm("この申請を却下しますか？")) return;
    setProcessing(rewardId);
    try {
      await rejectReward({ rewardId });
    } catch (err) {
      console.error("Rejection failed:", err);
      alert("却下に失敗しました");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ローディング中
  if (isLoading || isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  // 管理者でない場合
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-gray-600 mb-6">
            このページは管理者のみアクセス可能です。
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/admin/login"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
            >
              管理者ログイン
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const requests = tab === "pending" ? pendingRequests : allRequests;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            アフィリエイト管理
          </h1>
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            ホームに戻る
          </Link>
        </div>

        {/* タブ */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === "pending"
                ? "bg-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            審査待ち
            {pendingRequests && pendingRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === "all"
                ? "bg-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            全履歴
          </button>
        </div>

        {/* 申請一覧 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {!requests ? (
            <div className="p-8 text-center text-gray-500">読み込み中...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {tab === "pending" ? "審査待ちの申請はありません" : "申請履歴がありません"}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">
                        {request.userName}
                      </span>
                      {request.userEmail && (
                        <span className="text-xs text-gray-500">
                          ({request.userEmail})
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      サービス: <span className="font-medium">{request.serviceName}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      申請日時: {formatDate(request.createdAt)}
                      {request.approvedAt && (
                        <span className="ml-2">
                          | 承認日時: {formatDate(request.approvedAt)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Tracking ID: <code className="bg-gray-100 px-1 rounded">{request.trackingId}</code>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {request.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleApprove(request._id)}
                          disabled={processing === request._id}
                          className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition disabled:opacity-50"
                        >
                          {processing === request._id ? "..." : "承認"}
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          disabled={processing === request._id}
                          className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition disabled:opacity-50"
                        >
                          却下
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {request.status === "approved" ? "承認済み" : "却下"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* A8確認用リンク */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">A8.net確認手順</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>A8.netの成果レポートを開く</li>
            <li>id1パラメータでTracking IDを確認</li>
            <li>上記のTracking IDと照合して承認</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
