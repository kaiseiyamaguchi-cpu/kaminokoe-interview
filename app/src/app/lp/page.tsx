"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "本当に無料で使えるの？",
      answer:
        "はい。基本機能は完全無料です。まずは試してみてください。",
    },
    {
      question: "音声データはどうなる？",
      answer:
        "端末内でリアルタイム処理されます。サーバーに保存されることはありません。",
    },
    {
      question: "どんな面接でも使える？",
      answer:
        "新卒・中途・アルバイト、すべての面接に対応しています。日本語に最適化されています。",
    },
    {
      question: "実際の面接で使っていい？",
      answer:
        "神の声は面接練習・準備ツールです。実際の面接でのご使用は、応募先企業のポリシーをご確認ください。",
    },
    {
      question: "Google Meetでどうやって使うの？",
      answer:
        "神の声で「開始」を押すと画面共有ダイアログが出ます。「Chromeタブ」→ Meetのタブを選択 →「タブの音声を共有」にチェック →「共有」でOKです。詳しくは使い方ガイドをご覧ください。",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-medium tracking-tight text-[#1e3a5f]">
            神の声
          </span>
          <Link
            href="/"
            className="px-4 py-2 text-sm bg-[#f97316] text-white rounded hover:bg-[#ea580c] transition"
          >
            始める
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-[#6b7280] mb-6">面接AI</p>
          <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-6 tracking-tight text-[#1e3a5f]">
            面接で頭が真っ白になっても、
            <br />
            <span className="relative inline-block">
              もう大丈夫。
              <svg
                className="absolute -bottom-1 left-0 w-full"
                height="8"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5.5C40 2 80 7 120 4C160 1 180 6 199 3"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="text-lg text-[#4b5563] mb-10 max-w-xl leading-relaxed">
            AIが面接官の質問をリアルタイムで聞き取り、
            あなたに最適な回答のヒントを表示します。
            緊張で言葉が出てこない、あの瞬間をなくす。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="px-6 py-3 bg-[#f97316] text-white font-medium rounded hover:bg-[#ea580c] transition text-center"
            >
              無料で試す
            </Link>
            <Link
              href="/howto"
              className="px-6 py-3 text-[#4b5563] border border-[#d1d5db] rounded hover:border-[#9ca3af] hover:text-[#1f2937] transition text-center"
            >
              使い方を見る
            </Link>
          </div>
        </div>
      </section>

      {/* Demo / Product Visual */}
      <section id="demo" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
            {/* Browser Chrome */}
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center gap-2 bg-[#f9fafb]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#d1d5db]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#d1d5db]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#d1d5db]"></div>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Interviewer */}
              <div className="max-w-lg">
                <p className="text-xs text-[#6b7280] mb-2">面接官</p>
                <p className="text-[#374151] leading-relaxed">
                  「当社を志望した理由を教えてください」
                </p>
              </div>

              {/* AI Suggestion */}
              <div className="max-w-lg ml-auto">
                <p className="text-xs text-[#f97316] mb-2 font-medium">神の声</p>
                <div className="bg-[#fff7ed] border-l-2 border-[#f97316] p-4 rounded-r">
                  <p className="text-[#374151] text-sm leading-relaxed">
                    御社の「〇〇」という事業に共感しました。
                    私は大学で△△を学び、特に□□の経験を通じて…
                  </p>
                  <p className="text-xs text-[#9ca3af] mt-3">
                    ↑ あなたのプロフィールに基づいた回答例
                  </p>
                </div>
              </div>

              {/* Your response */}
              <div className="max-w-lg">
                <p className="text-xs text-[#6b7280] mb-2">あなた（文字起こし）</p>
                <p className="text-[#6b7280]">
                  「御社の〇〇という事業に共感しています。私は…」
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it helps */}
      <section className="py-24 px-6 border-t border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-medium mb-12 text-[#1e3a5f]">
            こんな経験、ありませんか？
          </h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <span className="text-[#9ca3af] text-sm mt-1">01</span>
              <div>
                <p className="text-[#374151] mb-1">
                  準備してたのに、本番で頭が真っ白になった
                </p>
                <p className="text-sm text-[#6b7280]">
                  → AIが即座にヒントを表示。思い出すきっかけを与えます
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <span className="text-[#9ca3af] text-sm mt-1">02</span>
              <div>
                <p className="text-[#374151] mb-1">
                  想定外の質問が来て、しどろもどろになった
                </p>
                <p className="text-sm text-[#6b7280]">
                  → その場でAIが回答の方向性を提案
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <span className="text-[#9ca3af] text-sm mt-1">03</span>
              <div>
                <p className="text-[#374151] mb-1">
                  自分の経歴をうまく言語化できなかった
                </p>
                <p className="text-sm text-[#6b7280]">
                  → プロフィールを元に、あなたの言葉で回答を提案
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple features */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-medium mb-12 text-[#1e3a5f]">仕組み</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-[#6b7280] mb-2">音声認識</p>
              <p className="text-[#4b5563] leading-relaxed">
                面接官の質問とあなたの回答を自動で文字起こし。
                録音ではなくリアルタイム処理。
              </p>
            </div>
            <div>
              <p className="text-sm text-[#6b7280] mb-2">AI解析</p>
              <p className="text-[#4b5563] leading-relaxed">
                質問の意図を理解し、あなたの経歴に基づいた
                回答のヒントを即座に生成。
              </p>
            </div>
            <div>
              <p className="text-sm text-[#6b7280] mb-2">プライバシー</p>
              <p className="text-[#4b5563] leading-relaxed">
                音声は端末内で処理。
                サーバーに送信・保存されることはありません。
              </p>
            </div>
            <div>
              <p className="text-sm text-[#6b7280] mb-2">パーソナライズ</p>
              <p className="text-[#4b5563] leading-relaxed">
                あなたの経歴・志望動機を登録すると、
                より的確な回答を提案できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof - minimal */}
      <section className="py-24 px-6 border-t border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-medium mb-12 text-[#1e3a5f]">
            使った人の声
          </h2>
          <div className="space-y-8">
            <blockquote className="border-l-2 border-[#1e3a5f] pl-6">
              <p className="text-[#4b5563] leading-relaxed mb-3">
                「緊張で何も考えられなくなる自分が嫌だった。
                神の声があると、最悪の状態でも立て直せる安心感がある」
              </p>
              <cite className="text-sm text-[#6b7280] not-italic">
                26卒 / IT企業内定
              </cite>
            </blockquote>
            <blockquote className="border-l-2 border-[#1e3a5f] pl-6">
              <p className="text-[#4b5563] leading-relaxed mb-3">
                「ケース面接の練習に使った。
                自分の回答に足りない視点をAIが補完してくれるので、
                一人でも質の高い練習ができた」
              </p>
              <cite className="text-sm text-[#6b7280] not-italic">
                転職活動中 / コンサル志望
              </cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium mb-12 text-[#1e3a5f]">
            よくある質問
          </h2>
          <div className="space-y-1">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-[#e5e7eb]">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full py-5 text-left flex items-center justify-between hover:text-[#1e3a5f] transition"
                >
                  <span className="text-[#374151]">{faq.question}</span>
                  <span className="text-[#9ca3af] text-sm">
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>
                {openFaq === index && (
                  <p className="pb-5 text-[#6b7280] text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-[#e5e7eb]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-medium mb-4 text-[#1e3a5f]">
            次の面接、神の声と一緒に。
          </h2>
          <p className="text-[#6b7280] mb-8">
            無料で始められます。クレジットカードは不要です。
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-[#f97316] text-white font-medium rounded hover:bg-[#ea580c] transition"
          >
            無料で試す
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#e5e7eb] bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <span className="text-sm text-[#6b7280]">神の声</span>
            <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-[#6b7280]">
              <Link href="/legal/tokushoho" className="hover:text-[#374151] transition">
                特定商取引法に基づく表示
              </Link>
              <Link href="/legal/terms" className="hover:text-[#374151] transition">
                利用規約
              </Link>
              <Link href="/legal/privacy" className="hover:text-[#374151] transition">
                プライバシーポリシー
              </Link>
            </div>
          </div>
          <p className="text-xs text-[#9ca3af] leading-relaxed max-w-xl">
            ※ 本サービスは面接練習・準備を支援するものです。
            実際の面接でのご使用は応募先企業のポリシーをご確認ください。
            本サービスの使用による採用結果について当社は責任を負いません。
          </p>
          <p className="text-xs text-[#d1d5db] mt-6">
            © 2026 Kaminokoe / 株式会社AccelShift
          </p>
        </div>
      </footer>
    </div>
  );
}
