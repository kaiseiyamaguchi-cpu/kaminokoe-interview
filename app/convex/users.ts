import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const INITIAL_FREE_TICKETS = 3; // 初回登録で3チケット（30分）

export const getOrCreateProfile = mutation({
  args: {
    lineUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // 既存プロフィールチェック
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      return existing;
    }

    // LINE UserIDで重複チェック（複垢防止）
    if (args.lineUserId) {
      const duplicateLineUser = await ctx.db
        .query("userProfiles")
        .withIndex("by_line_user_id", (q) => q.eq("lineUserId", args.lineUserId))
        .first();

      if (duplicateLineUser) {
        throw new Error("このLINEアカウントは既に登録されています");
      }
    }

    // 新規プロフィール作成
    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      tickets: INITIAL_FREE_TICKETS,
      lineUserId: args.lineUserId,
      createdAt: Date.now(),
    });

    // 初回チケット付与の履歴を記録
    await ctx.db.insert("ticketTransactions", {
      userId,
      amount: INITIAL_FREE_TICKETS,
      type: "initial",
      description: "初回登録ボーナス",
      createdAt: Date.now(),
    });

    return await ctx.db.get(profileId);
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getTickets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    return profile?.tickets ?? 0;
  },
});

export const grantTickets = mutation({
  args: {
    ticketsToAdd: v.number(),
    type: v.union(
      v.literal("purchase"),
      v.literal("affiliate")
    ),
    description: v.optional(v.string()),
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

    // チケット付与
    await ctx.db.patch(profile._id, {
      tickets: profile.tickets + args.ticketsToAdd,
    });

    // 履歴を記録
    await ctx.db.insert("ticketTransactions", {
      userId,
      amount: args.ticketsToAdd,
      type: args.type,
      description: args.description,
      createdAt: Date.now(),
    });

    return profile.tickets + args.ticketsToAdd;
  },
});

export const consumeTicket = mutation({
  args: {
    ticketsToConsume: v.number(),
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

    if (profile.tickets < args.ticketsToConsume) {
      throw new Error("チケットが不足しています");
    }

    // チケット消費
    await ctx.db.patch(profile._id, {
      tickets: profile.tickets - args.ticketsToConsume,
    });

    // 履歴を記録
    await ctx.db.insert("ticketTransactions", {
      userId,
      amount: -args.ticketsToConsume,
      type: "consume",
      description: "面接練習で使用",
      createdAt: Date.now(),
    });

    return profile.tickets - args.ticketsToConsume;
  },
});

export const getTicketHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("ticketTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});
