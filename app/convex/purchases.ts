import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const PLAN_SESSIONS = {
  single: 1,
  pack10: 10,
  pack15: 15,
} as const;

const PLAN_AMOUNTS = {
  single: 398,
  pack10: 3580,
  pack15: 4980,
} as const;

// Stripe Webhookから呼ばれる内部mutation
export const recordPurchaseInternal = internalMutation({
  args: {
    userId: v.id("users"),
    stripePaymentId: v.string(),
    plan: v.union(v.literal("single"), v.literal("pack10"), v.literal("pack15")),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const sessionsToAdd = PLAN_SESSIONS[args.plan];
    const amount = PLAN_AMOUNTS[args.plan];

    // Record purchase
    await ctx.db.insert("purchases", {
      userId: args.userId,
      stripePaymentId: args.stripePaymentId,
      plan: args.plan,
      sessionsAdded: sessionsToAdd,
      amount,
      createdAt: Date.now(),
    });

    // Add sessions to profile
    await ctx.db.patch(profile._id, {
      sessions: profile.sessions + sessionsToAdd,
    });

    return {
      sessionsAdded: sessionsToAdd,
      newTotal: profile.sessions + sessionsToAdd,
    };
  },
});

export const getPurchaseHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("purchases")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const getPlanInfo = query({
  args: {},
  handler: async () => {
    return {
      single: { sessions: 1, price: 398 },
      pack10: { sessions: 10, price: 3580 },
      pack15: { sessions: 15, price: 4980 },
    };
  },
});
