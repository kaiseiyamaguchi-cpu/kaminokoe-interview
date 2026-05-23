"use client";

import { useConvexAuth } from "convex/react";
import { AuthForm } from "@/components/AuthForm";
import { Shell } from "@/components/Shell";

const STEPS = [
  {
    num: "1",
    title: "想定問答を登録する",
    desc: "「想定問答」ページで自己紹介・志望動機・ガクチカなどの回答を事前に登録しておくと、AIがあなたの言葉でヒントを出せるようになります。",
  },
  {
    num: "2",
    title: "面接モードを開始",
    desc: "ホーム画面で企業対策（任意）と時間を設定し、「面接を開始」をクリックします。",
  },
  {
    num: "3",
    title: "会議をブラウザで開く",
    desc: "Zoom / Meet / Teams の招待URLを貼り付けると、自動でブラウザ参加用URLに変換されます。",
  },
  {
    num: "4",
    title: "音声を共有する",
    desc: "マイクへのアクセスを許可し、会議タブの音声も共有します。「タブの音声も共有する」のチェックを忘れずに。",
  },
  {
    num: "5",
    title: "AIがヒントを表示",
    desc: "面接官の質問をAIが聞き取り、あなたの想定問答をもとにフロート窓でヒントを表示します。",
  },
];

const FAQ = [
  {
    q: "カンニングじゃないの？",
    a: "事前に丸暗記した綺麗事はOKで、本番中に自分の言葉を思い出す補助はNG——その線引きに、意味はあるだろうか。kanpeは「思考は自分、記憶はAI」という考え方で作られています。",
  },
  {
    q: "実際の面接で使っていいの？",
    a: "面接準備・練習を支援するツールです。実際の面接でのご使用は、応募先企業のポリシーに従ってください。",
  },
  {
    q: "音声データは保存される？",
    a: "端末内で処理し、サーバーに送信・保存しません。会話は終了と同時に消えます。",
  },
  {
    q: "どのブラウザに対応していますか？",
    a: "Chrome、Edge、Brave を推奨しています。Safari では一部機能（タブ音声の共有）に制限があります。Firefox は現在非対応です。",
  },
  {
    q: "スマホで使えますか？",
    a: "現在はPC版ブラウザのみ対応しています。画面共有・タブ音声共有の機能がモバイルブラウザでは利用できないためです。",
  },
  {
    q: "Zoom / Meet / Teams のどれに対応していますか？",
    a: "3つすべてに対応しています。招待URLを貼り付けると自動でブラウザ参加URLに変換されます。",
  },
  {
    q: "チケットとは何ですか？",
    a: "1チケット = 10分の面接サポート利用時間です。初回登録で3チケット（30分）が無料で付与されます。マイページで追加購入できます。",
  },
  {
    q: "フロート窓が出ません",
    a: "Chrome / Edge / Brave の最新版をお使いください。Document Picture-in-Picture API に対応したブラウザが必要です。ブラウザの設定でポップアップがブロックされている場合も表示されないことがあります。",
  },
  {
    q: "想定問答を登録するメリットは？",
    a: "AIがあなた自身の経験や強みを使ってヒントを出すため、汎用的なAI回答とは違い、あなたの言葉で答えるサポートができます。記入率が高いほど精度が上がります。",
  },
];

const BROWSERS = [
  { name: "Chrome 116+", status: "full", label: "完全対応" },
  { name: "Edge 116+", status: "full", label: "完全対応" },
  { name: "Brave", status: "full", label: "完全対応" },
  { name: "Safari", status: "partial", label: "一部制限あり" },
  { name: "Firefox", status: "none", label: "非対応" },
];

export default function HelpPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[color:var(--text-dim)] text-sm">
        読み込み中...
      </div>
    );
  }
  if (!isAuthenticated) return <AuthForm />;

  return (
    <Shell active="help">
      <h1 className="text-xl font-bold mb-6">ヘルプ</h1>

      {/* 使い方ガイド */}
      <section className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-2xl p-6 mb-5">
        <h2 className="text-base font-bold mb-4">使い方ガイド</h2>
        <div className="space-y-4">
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-3.5">
              <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                {step.num}
              </div>
              <div className="pt-0.5">
                <p className="text-sm font-semibold text-[color:var(--text)]">{step.title}</p>
                <p className="text-[12px] text-[color:var(--text-dim)] mt-0.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-2xl p-6 mb-5">
        <h2 className="text-base font-bold mb-4">よくある質問</h2>
        <div className="divide-y divide-[color:var(--line)]">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-3.5 first:pt-0 last:pb-0">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-[color:var(--text)]">
                {f.q}
                <span className="ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--line2)] text-[10px] text-[color:var(--text-mute)] transition group-open:rotate-45 group-open:border-[color:var(--accent)] group-open:bg-[color:var(--accent)] group-open:text-white">
                  +
                </span>
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--text-dim)]">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ブラウザ対応 */}
      <section className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-2xl p-6 mb-5">
        <h2 className="text-base font-bold mb-4">ブラウザ対応状況</h2>
        <div className="space-y-2">
          {BROWSERS.map((b) => (
            <div
              key={b.name}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-[color:var(--bg)] border border-[color:var(--line)]"
            >
              <span className="text-sm text-[color:var(--text)]">{b.name}</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  b.status === "full"
                    ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                    : b.status === "partial"
                    ? "bg-[color:var(--warn)]/15 text-[color:var(--warn)]"
                    : "bg-[color:var(--error)]/15 text-[color:var(--error)]"
                }`}
              >
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* お問い合わせ */}
      <section className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-2xl p-6 mb-8">
        <h2 className="text-base font-bold mb-2">お問い合わせ</h2>
        <p className="text-[13px] text-[color:var(--text-dim)] leading-relaxed">
          不具合やご要望はお気軽にお知らせください。
        </p>
        <a
          href="mailto:support@accelshift.co.jp"
          className="inline-block mt-3 px-4 py-2 rounded-lg border border-[color:var(--line2)] text-sm text-[color:var(--accent2)] hover:bg-[color:var(--accent-bg)] transition"
        >
          support@accelshift.co.jp
        </a>
      </section>
    </Shell>
  );
}
