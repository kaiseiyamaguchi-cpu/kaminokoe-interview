"use client";

import { useEffect, useRef, useState } from "react";
import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL as string;

export function HandoffReceiver() {
  const handled = useRef(false);
  const [status, setStatus] = useState<"idle" | "applying" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (handled.current) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("handoffSession");
    if (!sessionId) return;
    handled.current = true;

    void (async () => {
      setStatus("applying");
      try {
        const client = new ConvexHttpClient(CONVEX_URL);
        // desktopHandoff:get は public query（未認証でも呼べる）
        const result = await client.query(
          "desktopHandoff:get" as never,
          { sessionId } as never,
        );
        const payloadB64 = (result as { payload: string } | null)?.payload;
        if (!payloadB64) throw new Error("ハンドオフが見つからないか期限切れです");

        const json = decodeURIComponent(escape(atob(payloadB64)));
        const tokens = JSON.parse(json) as Record<string, string>;

        for (const [k, v] of Object.entries(tokens)) {
          window.localStorage.setItem(k, v);
        }

        // 一回限り消費
        await client.mutation(
          "desktopHandoff:consume" as never,
          { sessionId } as never,
        );

        // URL を綺麗にして再読込（ConvexAuth が localStorage を読む）
        const clean = new URL(window.location.href);
        clean.searchParams.delete("handoffSession");
        window.history.replaceState({}, "", clean.toString());
        window.location.reload();
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    })();
  }, []);

  if (status === "applying") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--bg)]/95 text-[color:var(--text-dim)] text-sm">
        ログイン情報を取得中...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--bg)]/95 p-6">
        <div className="max-w-sm text-center">
          <p className="text-[color:var(--error)] text-sm mb-3">{error}</p>
          <button
            onClick={() => {
              const clean = new URL(window.location.href);
              clean.searchParams.delete("handoffSession");
              window.location.href = clean.toString();
            }}
            className="px-4 py-2 rounded-lg border border-[color:var(--line2)] text-sm"
          >
            最初からやり直す
          </button>
        </div>
      </div>
    );
  }

  return null;
}
