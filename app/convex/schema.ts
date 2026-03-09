import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // ユーザー追加情報（チケット数など）
  userProfiles: defineTable({
    userId: v.id("users"),
    tickets: v.number(), // 残りチケット数（1チケット = 10分）
    lineUserId: v.optional(v.string()), // LINE User ID（重複防止用）
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_line_user_id", ["lineUserId"]),

  // チケット増減履歴
  ticketTransactions: defineTable({
    userId: v.id("users"),
    amount: v.number(), // 正: 付与, 負: 消費
    type: v.union(
      v.literal("initial"), // 初回登録
      v.literal("purchase"), // 購入
      v.literal("affiliate"), // アフィリエイト
      v.literal("consume") // 面接で消費
    ),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // 面接練習のログ
  sessionLogs: defineTable({
    userId: v.id("users"),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    durationMinutes: v.optional(v.number()),
    allocatedTickets: v.optional(v.number()), // 割り当てチケット数（開始時に決定）
    maxDurationMinutes: v.optional(v.number()), // 最大利用時間（分）
    ticketsConsumed: v.optional(v.number()), // 消費チケット数
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
  }).index("by_user", ["userId"]),

  // 購入履歴
  purchases: defineTable({
    userId: v.id("users"),
    stripePaymentId: v.string(),
    plan: v.union(
      v.literal("ticket1"), // 1チケット
      v.literal("ticket3"), // 30分パック
      v.literal("ticket18"), // 5回分（15+3）
      v.literal("ticket36") // 10回分（30+6）
    ),
    ticketsAdded: v.number(),
    amount: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // アフィリエイト報酬
  affiliateRewards: defineTable({
    userId: v.id("users"),
    ticketsAdded: v.number(),
    serviceName: v.optional(v.string()), // 登録したサービス名
    trackingId: v.optional(v.string()), // A8 id1パラメータ用（ユーザーID）
    status: v.union(
      v.literal("pending"), // 申請中（管理者承認待ち）
      v.literal("approved"), // 承認済み（チケット付与完了）
      v.literal("rejected") // 却下
    ),
    approvedAt: v.optional(v.number()), // 承認日時
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_tracking_id", ["trackingId"]),
});
