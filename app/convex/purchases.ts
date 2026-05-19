import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// チケット制の料金プラン（かんぺAI 新プラン）
const PLAN_TICKETS = {
  starter: 10,     // スターター
  standard: 30,    // スタンダード
  interview: 100,  // 就活パック
  addon: 10,       // 追加チケット
} as const;

const PLAN_AMOUNTS = {
  starter: 1200,
  standard: 3600,
  interview: 9990,
  addon: 1300,
} as const;

// Stripe Webhookから呼ばれる内部mutation
export const recordPurchaseInternal = internalMutation({
  args: {
    userId: v.id("users"),
    stripePaymentId: v.string(),
    plan: v.union(
      v.literal("starter"),
      v.literal("standard"),
      v.literal("interview"),
      v.literal("addon")
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
      starter: { tickets: 10, price: 1200, minutes: 100 },
      standard: { tickets: 30, price: 3600, minutes: 300 },
      interview: { tickets: 100, price: 9990, minutes: 1000 },
      addon: { tickets: 10, price: 1300, minutes: 100 },
    };
  },
});
