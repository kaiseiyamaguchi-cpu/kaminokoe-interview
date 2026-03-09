import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// チケット制の料金プラン
const PLAN_TICKETS = {
  ticket1: 1,      // 単発1チケット
  ticket3: 3,      // 30分パック
  ticket18: 18,    // 5回分（15枚+3枚無料）
  ticket36: 36,    // 10回分（30枚+6枚無料）
} as const;

const PLAN_AMOUNTS = {
  ticket1: 200,
  ticket3: 500,
  ticket18: 2500,
  ticket36: 5000,
} as const;

type PlanType = keyof typeof PLAN_TICKETS;

// Stripe Webhookから呼ばれる内部mutation
export const recordPurchaseInternal = internalMutation({
  args: {
    userId: v.id("users"),
    stripePaymentId: v.string(),
    plan: v.union(
      v.literal("ticket1"),
      v.literal("ticket3"),
      v.literal("ticket18"),
      v.literal("ticket36")
    ),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const ticketsToAdd = PLAN_TICKETS[args.plan];
    const amount = PLAN_AMOUNTS[args.plan];

    // Record purchase
    await ctx.db.insert("purchases", {
      userId: args.userId,
      stripePaymentId: args.stripePaymentId,
      plan: args.plan,
      ticketsAdded: ticketsToAdd,
      amount,
      createdAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("ticketTransactions", {
      userId: args.userId,
      amount: ticketsToAdd,
      type: "purchase",
      description: `${ticketsToAdd}チケット購入`,
      createdAt: Date.now(),
    });

    // Add tickets to profile
    await ctx.db.patch(profile._id, {
      tickets: profile.tickets + ticketsToAdd,
    });

    return {
      ticketsAdded: ticketsToAdd,
      newTotal: profile.tickets + ticketsToAdd,
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
      ticket1: { tickets: 1, price: 200, minutes: 10 },
      ticket3: { tickets: 3, price: 500, minutes: 30 },
      ticket18: { tickets: 18, price: 2500, minutes: 180 },
      ticket36: { tickets: 36, price: 5000, minutes: 360 },
    };
  },
});
