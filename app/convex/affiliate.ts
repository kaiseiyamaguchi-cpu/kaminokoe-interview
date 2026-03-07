import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const AFFILIATE_REWARD_SESSIONS = 5;

export const grantAffiliateReward = mutation({
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

    // Check if already claimed
    const existingReward = await ctx.db
      .query("affiliateRewards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingReward) {
      throw new Error("Affiliate reward already claimed");
    }

    // Record reward
    await ctx.db.insert("affiliateRewards", {
      userId,
      sessionsAdded: AFFILIATE_REWARD_SESSIONS,
      createdAt: Date.now(),
    });

    // Add sessions to profile
    await ctx.db.patch(profile._id, {
      sessions: profile.sessions + AFFILIATE_REWARD_SESSIONS,
    });

    return {
      sessionsAdded: AFFILIATE_REWARD_SESSIONS,
      newTotal: profile.sessions + AFFILIATE_REWARD_SESSIONS,
    };
  },
});

export const hasClaimedAffiliateReward = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const reward = await ctx.db
      .query("affiliateRewards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return !!reward;
  },
});
