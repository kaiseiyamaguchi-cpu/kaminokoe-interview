import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const TICKET_MINUTES = 10; // 1チケット = 10分

export const startSession = mutation({
  args: {
    ticketCount: v.number(), // 使用するチケット数
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (args.ticketCount < 1) {
      throw new Error("チケット数は1以上を指定してください");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    if (profile.tickets < args.ticketCount) {
      throw new Error("チケットが不足しています");
    }

    // Check for active session and auto-close it
    const activeSession = await ctx.db
      .query("sessionLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (activeSession) {
      // 前回のセッションを強制終了（チケットは既に消費済みなので返却しない）
      await ctx.db.patch(activeSession._id, {
        endedAt: Date.now(),
        status: "cancelled",
        ticketsConsumed: activeSession.allocatedTickets ?? 1,
      });
    }

    const maxDurationMinutes = args.ticketCount * TICKET_MINUTES;

    // チケットを先に消費
    const newTicketCount = profile.tickets - args.ticketCount;
    await ctx.db.patch(profile._id, {
      tickets: newTicketCount,
    });

    // トランザクション記録
    await ctx.db.insert("ticketTransactions", {
      userId,
      amount: -args.ticketCount,
      type: "consume",
      description: `面接練習 ${maxDurationMinutes}分`,
      createdAt: Date.now(),
    });

    const sessionId = await ctx.db.insert("sessionLogs", {
      userId,
      startedAt: Date.now(),
      allocatedTickets: args.ticketCount,
      maxDurationMinutes,
      status: "active",
    });

    return {
      sessionId,
      maxDurationMinutes,
      remainingTickets: newTicketCount,
    };
  },
});

export const endSession = mutation({
  args: {
    sessionId: v.id("sessionLogs"),
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

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    if (session.status !== "active") {
      throw new Error("Session already ended");
    }

    const endedAt = Date.now();
    const durationMinutes = Math.ceil(
      (endedAt - session.startedAt) / (1000 * 60)
    );

    const ticketsConsumed = session.allocatedTickets ?? 1;

    // チケットは開始時に消費済み
    await ctx.db.patch(args.sessionId, {
      endedAt,
      durationMinutes,
      ticketsConsumed,
      status: "completed",
    });

    return {
      durationMinutes,
      ticketsConsumed,
      remainingTickets: profile.tickets,
    };
  },
});

export const getActiveSession = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("sessionLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

export const getSessionHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("sessionLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .take(20);
  },
});
