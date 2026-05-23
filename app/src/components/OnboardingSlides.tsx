"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";

const SLIDES = [
  {
    title: "kanpe.ai へようこそ",
    body: "面接中にAIがリアルタイムで質問を聞き取り、あなたの情報をもとに回答のヒントを表示します。\n\n暗記に頼らず、自分の言葉で答える力をサポートします。",
    visual: "welcome",
  },
  {
    title: "使い方はかんたん 3ステップ",
    body: "",
    visual: "steps",
  },
  {
    title: "想定問答で精度UP",
    body: "「想定問答」ページで自己紹介・志望動機・ガクチカの回答を事前に登録しておくと、AIがあなた自身の経験や強みを使ってヒントを出せます。\n\n汎用的なAI回答ではなく、あなたの言葉で答えるサポートが可能になります。",
    visual: "qa",
  },
  {
    title: "準備完了!",
    body: "まずは「想定問答」から回答を登録してみましょう。\n記入率が高いほど面接サポートの精度が上がります。",
    visual: "ready",
  },
];

export function OnboardingSlides() {
  const [current, setCurrent] = useState(0);
  const markSeen = useMutation(api.users.markProductOnboardingSeen);

  const handleComplete = async () => {
    await markSeen({});
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[color:var(--bg)]">
      <div className="w-full max-w-lg">
        {/* ロゴ */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/icon-512.png" alt="kanpe.ai" width={28} height={28} className="h-7 w-7" />
          <span className="text-lg font-medium tracking-tight text-[color:var(--text)]">kanpe.ai</span>
        </div>

        {/* スライドコンテンツ */}
        <div className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-2xl p-8 min-h-[360px] flex flex-col">
          <h2 className="text-xl font-bold text-[color:var(--text)] text-center mb-5">
            {slide.title}
          </h2>

          <div className="flex-1 flex flex-col justify-center">
            {slide.visual === "steps" ? (
              <div className="space-y-4">
                {[
                  { icon: "1", label: "会議をブラウザで開く", sub: "Zoom / Meet / Teams のURLを貼り付け" },
                  { icon: "2", label: "マイクと音声を共有", sub: "「タブの音声も共有する」をチェック" },
                  { icon: "3", label: "AIがヒントを表示", sub: "フロート窓で面接中にサポート" },
                ].map((s) => (
                  <div key={s.icon} className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--text)]">{s.label}</p>
                      <p className="text-xs text-[color:var(--text-dim)] mt-0.5">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[color:var(--text-dim)] leading-relaxed text-center whitespace-pre-line">
                {slide.body}
              </p>
            )}
          </div>
        </div>

        {/* プログレスドット */}
        <div className="flex justify-center gap-2 mt-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current
                  ? "bg-[color:var(--accent)] w-6"
                  : "bg-[color:var(--text-mute)]/40 hover:bg-[color:var(--text-mute)]"
              }`}
            />
          ))}
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleComplete}
            className="text-xs text-[color:var(--text-mute)] hover:text-[color:var(--text-dim)] transition"
          >
            スキップ
          </button>

          <div className="flex gap-3">
            {current > 0 && (
              <button
                onClick={() => setCurrent(current - 1)}
                className="px-5 py-2.5 rounded-xl border border-[color:var(--line2)] text-sm text-[color:var(--text-dim)] hover:bg-[color:var(--bg2)] transition"
              >
                戻る
              </button>
            )}
            {isLast ? (
              <button
                onClick={handleComplete}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 transition"
              >
                はじめる
              </button>
            ) : (
              <button
                onClick={() => setCurrent(current + 1)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 transition"
              >
                次へ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
