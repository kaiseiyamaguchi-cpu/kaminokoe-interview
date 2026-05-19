import { action } from "./_generated/server";

/**
 * OpenAI Realtime API のクライアント secret を発行する。
 * 認証済みユーザーのみ呼び出し可能。Tauri デスクトップアプリから利用。
 */
export const createRealtimeToken = action({
  args: {},
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured in Convex env");
    }

    const res = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime-2025-08-28",
          audio: { output: { voice: "verse" } },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as { value: string; expires_at?: number };
    return { value: data.value, expiresAt: data.expires_at };
  },
});
