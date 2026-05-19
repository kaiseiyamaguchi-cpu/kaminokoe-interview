"use client";

import { Suspense } from "react";
import { LiveSession } from "./LiveSession";

export default function LivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-[color:var(--text-dim)]">読み込み中...</div>}>
      <LiveSession />
    </Suspense>
  );
}
