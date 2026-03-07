"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: "🎯",
      title: "リアルタイム回答サジェスト",
      description: "面接官の質問をAIが即座に解析。最適な回答をリアルタイムで提案します。",
    },
    {
      icon: "🎤",
      title: "音声認識で自動文字起こし",
      description: "あなたの回答も面接官の質問も、すべて自動で文字起こし。振り返りも簡単。",
    },
    {
      icon: "📝",
      title: "プロフィール連携",
      description: "あなたの経歴・志望動機を登録すれば、よりパーソナライズされた回答を提案。",
    },
    {
      icon: "🔒",
      title: "プライバシー重視",
      description: "音声データは端末内で処理。面接内容が外部に漏れる心配はありません。",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "プロフィールを入力",
      description: "あなたの経歴と志望動機を登録",
    },
    {
      step: "02",
      title: "面接を開始",
      description: "オンライン面接に神の声を接続",
    },
    {
      step: "03",
      title: "AIがサポート",
      description: "リアルタイムで最適な回答をサジェスト",
    },
  ];

  const faqs = [
    {
      question: "神の声は無料で使えますか？",
      answer: "基本機能は無料でご利用いただけます。より高度な機能は有料プランをご用意しています。",
    },
    {
      question: "どんな面接に対応していますか？",
      answer: "新卒採用、中途採用、アルバイト面接など、あらゆる面接に対応しています。日本語での面接に最適化されています。",
    },
    {
      question: "音声データはどう扱われますか？",
      answer: "音声データは端末内でリアルタイム処理され、サーバーに保存されることはありません。プライバシーを最優先に設計しています。",
    },
    {
      question: "面接中にバレませんか？",
      answer: "神の声は面接練習・準備ツールとして設計されています。実際の面接でのご使用は、応募先企業のポリシーをご確認ください。",
    },
  ];

  const stats = [
    { value: "3倍", label: "内定率向上" },
    { value: "10,000+", label: "ユーザー数" },
    { value: "98%", label: "満足度" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛩️</span>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              神の声
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-300 hover:text-white transition">
              機能
            </a>
            <a href="#how-it-works" className="text-sm text-slate-300 hover:text-white transition">
              使い方
            </a>
            <a href="#faq" className="text-sm text-slate-300 hover:text-white transition">
              FAQ
            </a>
          </nav>
          <Link
            href="/"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/25"
          >
            無料で始める
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-slate-300 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            就活生・転職者向けAI面接サポート
          </div>

          {/* Main Copy */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              面接をハックせよ
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            神の声が、あなたの面接を最強にする
          </p>
          <p className="text-slate-400 mb-10 max-w-2xl mx-auto">
            AIがリアルタイムで質問を解析し、最適な回答をサジェスト。
            緊張してド忘れしても大丈夫。神の声があなたを導きます。
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg rounded-xl hover:from-amber-600 hover:to-orange-700 transition shadow-xl shadow-orange-500/30"
            >
              無料で始める
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white font-medium text-lg rounded-xl border border-slate-700 hover:bg-slate-700 transition"
            >
              使い方を見る
            </a>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Visual / Demo */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/50 shadow-2xl">
            {/* Mock Interface */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-sm text-slate-400">神の声 - 面接サポート</span>
            </div>
            <div className="p-8 space-y-6">
              {/* Sample Conversation */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                  👔
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">面接官</p>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-200">
                      当社を志望した理由を教えてください。
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm">
                  ⛩️
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-400 mb-1">神の声</p>
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-slate-200">
                      <span className="text-amber-400">💡 回答サジェスト:</span>{" "}
                      御社の「〇〇」という事業に共感しています。私は大学で△△を学び、特に□□の経験を通じて...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              面接の不安を、
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                自信に変える
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              神の声は、AIの力であなたの面接をサポート。
              準備ゼロでも、緊張しても、最高のパフォーマンスを引き出します。
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 transition group"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition">
                  {feature.title}
                </h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                3ステップ
              </span>
              で始められる
            </h2>
            <p className="text-slate-400">
              セットアップは簡単。今すぐ神の声を体験しましょう。
            </p>
          </div>
          <div className="space-y-8">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-6 p-6 rounded-2xl bg-slate-800/30 border border-slate-700"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ユーザーの
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              声
            </span>
          </h2>
          <p className="text-slate-400 mb-12">
            神の声を使って内定を勝ち取ったユーザーの声
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "T.S.",
                role: "26卒 / IT業界内定",
                comment: "面接中にド忘れしても、神の声がすぐにヒントをくれた。本当に助かりました。",
              },
              {
                name: "M.K.",
                role: "転職活動中 / 外資コンサル内定",
                comment: "ケース面接の対策に最適。AIのサジェストでロジカルに回答できるようになった。",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 text-left"
              >
                <p className="text-slate-300 mb-4">"{testimonial.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              よくある
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                質問
              </span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-slate-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 transition"
                >
                  <span className="font-medium">{faq.question}</span>
                  <span
                    className={`transform transition ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-slate-800/30 text-slate-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            今すぐ
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              面接をハック
            </span>
            しよう
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            神の声があなたの面接を最強にする。
            無料で今すぐ始めましょう。
          </p>
          <Link
            href="/"
            className="inline-block px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xl rounded-xl hover:from-amber-600 hover:to-orange-700 transition shadow-xl shadow-orange-500/30"
          >
            無料で始める
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            クレジットカード不要 • 3分でセットアップ完了
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⛩️</span>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                神の声
              </span>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition">利用規約</a>
              <a href="#" className="hover:text-white transition">プライバシーポリシー</a>
              <a href="#" className="hover:text-white transition">お問い合わせ</a>
            </div>
          </div>
          {/* Legal Disclaimer */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500 max-w-2xl mx-auto">
              ※ 本サービスは面接練習・準備を支援するものです。
              実際の面接でのご使用は、応募先企業のポリシーをご確認ください。
              本サービスの使用による採用結果について、当社は一切の責任を負いません。
            </p>
          </div>
          <div className="mt-4 text-center text-xs text-slate-500">
            © 2026 Kaminokoe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
