import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // ユーザー追加情報（チケット数・プロフィール）
  userProfiles: defineTable({
    userId: v.id("users"),
    tickets: v.number(), // 残りチケット数（1チケット = 10分）
    lineUserId: v.optional(v.string()), // LINE User ID（重複防止用）

    // 基本情報（必須 - プロフィール入力で取得）
    email: v.optional(v.string()),
    university: v.optional(v.string()),
    faculty: v.optional(v.string()),
    graduationYear: v.optional(v.string()), // "26卒", "27卒", "28卒"

    // 就活情報（任意）
    industries: v.optional(v.array(v.string())),
    jobTypes: v.optional(v.array(v.string())),
    preferredLocations: v.optional(v.array(v.string())),

    // LINE公式連携
    lineFriendAdded: v.optional(v.boolean()),

    /** 画面上の名前（音声の話者識別・自己紹介に使用）— 強みなどは別テーブルの想定質問回答集へ */
    displayName: v.optional(v.string()),

    /**
     * オンボーディング説明スライドの視聴バージョン。
     * undefined = 過去ユーザー扱い（再表示しない） / 0 = 未視聴 / 現在バージョン以上で視聴済み
     */
    onboardingGuideSeenVersion: v.optional(v.number()),

    // メタ
    profileCompletedAt: v.optional(v.number()), // nullならプロフィール未完了
    lastActiveAt: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_line_user_id", ["lineUserId"])
    .index("by_graduation_year", ["graduationYear"]),

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
      v.literal("starter"),
      v.literal("standard"),
      v.literal("interview"),
      v.literal("addon"),
      v.literal("ticket1"),
      v.literal("ticket3"),
      v.literal("ticket18"),
      v.literal("ticket36")
    ),
    ticketsAdded: v.number(),
    amount: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // アフィリエイト報酬
  /** 想定質問への一問一答（ガクチカ・強み等はここ。presetKey ありはテンプレ質問） */
  interviewQaItems: defineTable({
    userId: v.id("users"),
    presetKey: v.optional(v.string()),
    question: v.string(),
    answer: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  /** 企業別に生成された面接対策（編集可） */
  companyInterviewPreps: defineTable({
    userId: v.id("users"),
    companyName: v.string(),
    companyUrl: v.string(),
    companyVision: v.optional(v.string()),
    /** Phase1 で生成した会社分析 (Markdown) */
    analysis: v.optional(v.string()),
    /** Phase2 で生成した想定質問 + 回答（title が必ず疑問形） */
    sections: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        content: v.string(),
      })
    ),
    updatedAt: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  /** Desktop アプリ用一時ハンドオフトークン (ログインフロー) */
  desktopHandoffs: defineTable({
    sessionId: v.string(),
    payload: v.string(),
    expiresAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    consumedAt: v.optional(v.number()),
  }).index("by_session", ["sessionId"]),

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
