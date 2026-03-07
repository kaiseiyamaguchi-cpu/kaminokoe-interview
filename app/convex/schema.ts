import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // ユーザー追加情報（セッション数など）
  userProfiles: defineTable({
    userId: v.id("users"), // Convex Auth の users テーブルへの参照
    sessions: v.number(), // 残りセッション数
    createdAt: v.number(),
  }).index("by_user_id", ["userId"]),

  // 面接練習のログ
  sessionLogs: defineTable({
    userId: v.id("users"),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    durationMinutes: v.optional(v.number()),
    sessionsConsumed: v.optional(v.number()), // 1 or 2
    status: v.union(v.literal("active"), v.literal("completed")),
  }).index("by_user", ["userId"]),

  // 購入履歴
  purchases: defineTable({
    userId: v.id("users"),
    stripePaymentId: v.string(),
    plan: v.union(
      v.literal("single"),
      v.literal("pack10"),
      v.literal("pack15")
    ),
    sessionsAdded: v.number(),
    amount: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // アフィリエイト報酬
  affiliateRewards: defineTable({
    userId: v.id("users"),
    sessionsAdded: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
