import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const AFFILIATE_REWARD_TICKETS = 3; // アフィリエイト登録1件につき3チケット（30分）

// 管理者メールアドレス
const ADMIN_EMAILS = ["kaisei.yamaguchi@accel-shift.com"];

// 管理者チェック用ヘルパー
async function checkIsAdmin(ctx: any, userId: string): Promise<boolean> {
  const user = await ctx.db.get(userId);
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email);
}

// アフィリエイト報酬申請（pending状態で作成）
export const requestAffiliateReward = mutation({
  args: {
    serviceName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // 同一サービスの重複チェック（pending/approved含む）
    const existingReward = await ctx.db
      .query("affiliateRewards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("serviceName"), args.serviceName),
          q.neq(q.field("status"), "rejected")
        )
      )
      .first();

    if (existingReward) {
      if (existingReward.status === "pending") {
        throw new Error("このサービスの申請は現在審査中です");
      }
      throw new Error("このサービスの報酬は既に受け取り済みです");
    }

    // trackingIdとしてuserIdを使用（A8のid1パラメータと照合用）
    const trackingId = userId;

    // pending状態で申請を作成
    await ctx.db.insert("affiliateRewards", {
      userId,
      ticketsAdded: AFFILIATE_REWARD_TICKETS,
      serviceName: args.serviceName,
      trackingId,
      status: "pending",
      createdAt: Date.now(),
    });

    return {
      status: "pending",
      message: "申請を受け付けました。承認後にチケットが付与されます。",
    };
  },
});

// 管理者用：申請を承認
export const approveAffiliateReward = mutation({
  args: {
    rewardId: v.id("affiliateRewards"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId || !(await checkIsAdmin(ctx, userId))) {
      throw new Error("管理者権限が必要です");
    }

    const reward = await ctx.db.get(args.rewardId);
    if (!reward) {
      throw new Error("申請が見つかりません");
    }

    if (reward.status !== "pending") {
      throw new Error("この申請は既に処理済みです");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", reward.userId))
      .first();

    if (!profile) {
      throw new Error("ユーザープロフィールが見つかりません");
    }

    // 承認処理
    await ctx.db.patch(args.rewardId, {
      status: "approved",
      approvedAt: Date.now(),
    });

    // トランザクション記録
    await ctx.db.insert("ticketTransactions", {
      userId: reward.userId,
      amount: reward.ticketsAdded,
      type: "affiliate",
      description: reward.serviceName
        ? `${reward.serviceName}への登録ボーナス`
        : "アフィリエイト登録ボーナス",
      createdAt: Date.now(),
    });

    // チケット付与
    await ctx.db.patch(profile._id, {
      tickets: profile.tickets + reward.ticketsAdded,
    });

    return {
      ticketsAdded: reward.ticketsAdded,
      newTotal: profile.tickets + reward.ticketsAdded,
    };
  },
});

// 管理者用：申請を却下
export const rejectAffiliateReward = mutation({
  args: {
    rewardId: v.id("affiliateRewards"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId || !(await checkIsAdmin(ctx, userId))) {
      throw new Error("管理者権限が必要です");
    }

    const reward = await ctx.db.get(args.rewardId);
    if (!reward) {
      throw new Error("申請が見つかりません");
    }

    if (reward.status !== "pending") {
      throw new Error("この申請は既に処理済みです");
    }

    await ctx.db.patch(args.rewardId, {
      status: "rejected",
    });

    return { success: true };
  },
});

// 管理者チェック
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    return await checkIsAdmin(ctx, userId);
  },
});

// 管理者用：pending申請一覧取得（ユーザー情報付き）
export const getPendingAffiliateRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId || !(await checkIsAdmin(ctx, userId))) {
      return [];
    }

    const rewards = await ctx.db
      .query("affiliateRewards")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    // ユーザー情報を付与
    const rewardsWithUserInfo = await Promise.all(
      rewards.map(async (reward) => {
        const user = await ctx.db.get(reward.userId);
        return {
          ...reward,
          userName: user?.name || "不明",
          userEmail: user?.email || null,
        };
      })
    );

    return rewardsWithUserInfo;
  },
});

// 管理者用：全申請一覧取得（履歴確認用）
export const getAllAffiliateRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId || !(await checkIsAdmin(ctx, userId))) {
      return [];
    }

    const rewards = await ctx.db
      .query("affiliateRewards")
      .order("desc")
      .take(100);

    const rewardsWithUserInfo = await Promise.all(
      rewards.map(async (reward) => {
        const user = await ctx.db.get(reward.userId);
        return {
          ...reward,
          userName: user?.name || "不明",
          userEmail: user?.email || null,
        };
      })
    );

    return rewardsWithUserInfo;
  },
});

export const getAffiliateRewardCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const rewards = await ctx.db
      .query("affiliateRewards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    return rewards.length;
  },
});

export const getAffiliateRewardHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("affiliateRewards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

// ユーザーのtrackingId（リンク生成用）を取得
export const getUserTrackingId = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return userId;
  },
});
