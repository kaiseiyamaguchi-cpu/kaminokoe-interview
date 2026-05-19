import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const TTL_MS = 5 * 60 * 1000; // 5 分

/**
 * Web 側で OAuth 完了後にトークンを Convex に格納。
 * sessionId は Desktop が生成した UUID。
 */
export const store = mutation({
  args: { sessionId: v.string(), payload: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("desktopHandoffs")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    const expiresAt = Date.now() + TTL_MS;
    if (existing) {
      await ctx.db.patch(existing._id, {
        payload: args.payload,
        expiresAt,
      });
    } else {
      await ctx.db.insert("desktopHandoffs", {
        sessionId: args.sessionId,
        payload: args.payload,
        expiresAt,
      });
    }
  },
});

/** Desktop が purpose-id をリアクティブに subscribe するクエリ */
export const get = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("desktopHandoffs")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    if (!row) return null;
    if ((row.expiresAt ?? 0) < Date.now()) return null;
    return { payload: row.payload };
  },
});

/** Desktop がトークン取得後に呼び出して 1 回限りで削除 */
export const consume = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("desktopHandoffs")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    if (row) {
      await ctx.db.delete(row._id);
    }
  },
});
