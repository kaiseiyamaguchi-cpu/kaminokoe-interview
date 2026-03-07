import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const SESSION_MAX_MINUTES = 30;

export const startSession = mutation({
  args: {},
  handler: async (ctx) => {
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

    if (profile.sessions < 1) {
      throw new Error("No sessions remaining");
    }

    // Check for active session
    const activeSession = await ctx.db
      .query("sessionLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (activeSession) {
      throw new Error("Session already active");
    }

    const sessionId = await ctx.db.insert("sessionLogs", {
      userId,
      startedAt: Date.now(),
      status: "active",
    });

    return { sessionId, remainingSessions: profile.sessions };
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

    // 30分超過で2セッション消費
    const sessionsConsumed = durationMinutes > SESSION_MAX_MINUTES ? 2 : 1;

    // Update session log
    await ctx.db.patch(args.sessionId, {
      endedAt,
      durationMinutes,
      sessionsConsumed,
      status: "completed",
    });

    // Deduct sessions from profile
    const newSessionCount = Math.max(0, profile.sessions - sessionsConsumed);
    await ctx.db.patch(profile._id, {
      sessions: newSessionCount,
    });

    return {
      durationMinutes,
      sessionsConsumed,
      remainingSessions: newSessionCount,
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
