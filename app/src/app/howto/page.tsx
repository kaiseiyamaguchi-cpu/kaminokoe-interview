"use client";

import { useState } from "react";
import Link from "next/link";

export default function HowToPage() {
  const [activeTab, setActiveTab] = useState<"practice" | "real">("practice");

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/lp"
            className="text-lg font-medium tracking-tight text-[#1e3a5f]"
          >
            神の声
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-sm bg-[#f97316] text-white rounded hover:bg-[#ea580c] transition"
          >
            始める
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-medium mb-4 text-[#1e3a5f]">
            使い方ガイド
          </h1>
          <p className="text-[#6b7280]">
            Google Meetでの面接練習、そして実際の面接での活用方法を解説します
          </p>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="px-6 mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 p-1 bg-[#f3f4f6] rounded-lg">
            <button
              onClick={() => setActiveTab("practice")}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
                activeTab === "practice"
                  ? "bg-white text-[#1e3a5f] shadow-sm"
                  : "text-[#6b7280] hover:text-[#374151]"
              }`}
            >
              模擬面接で使う
            </button>
            <button
              onClick={() => setActiveTab("real")}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition ${
                activeTab === "real"
                  ? "bg-white text-[#1e3a5f] shadow-sm"
                  : "text-[#6b7280] hover:text-[#374151]"
              }`}
            >
              実際の面接で使う
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          {activeTab === "practice" ? (
            <PracticeGuide />
          ) : (
            <RealInterviewGuide />
          )}
        </div>
      </main>

      {/* CTA */}
      <section className="py-16 px-6 bg-white border-t border-[#e5e7eb]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-medium mb-4 text-[#1e3a5f]">
            準備はできましたか？
          </h2>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-[#f97316] text-white font-medium rounded hover:bg-[#ea580c] transition"
          >
            神の声を始める
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#e5e7eb] bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-[#6b7280]">
            <Link href="/lp" className="hover:text-[#374151] transition">
              トップ
            </Link>
            <Link href="/legal/terms" className="hover:text-[#374151] transition">
              利用規約
            </Link>
            <Link href="/legal/privacy" className="hover:text-[#374151] transition">
              プライバシーポリシー
            </Link>
          </div>
          <p className="text-xs text-[#d1d5db] mt-4">© 2026 Kaminokoe</p>
        </div>
      </footer>
    </div>
  );
}

function PracticeGuide() {
  return (
    <div className="space-y-12">
      {/* Overview */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
        <h2 className="text-lg font-medium text-[#1e3a5f] mb-3">
          模擬面接での使い方
        </h2>
        <p className="text-[#4b5563] leading-relaxed">
          友人や先輩にGoogle Meetで面接官役をやってもらいながら、
          神の声のサポートを受けて練習できます。
          自分の回答に自信がない質問も、AIがヒントを出してくれます。
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-[#1e3a5f]">セットアップ手順</h3>

        {/* Step 1 */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#f97316] text-white rounded-full flex items-center justify-center font-medium text-sm shrink-0">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-[#1e3a5f] mb-2">
                神の声にログイン
              </h4>
              <p className="text-[#4b5563] text-sm mb-4">
                LINEアカウントでログインし、プロフィール情報（志望企業、強み、ガクチカなど）を入力してください。
                この情報をもとにAIがあなたに合った回答を提案します。
              </p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#f97316] text-white rounded-full flex items-center justify-center font-medium text-sm shrink-0">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-[#1e3a5f] mb-2">
                Google Meetに参加
              </h4>
              <p className="text-[#4b5563] text-sm">
                面接官役の相手とGoogle Meetに参加してください。
                神の声は別のブラウザタブで開いたままにしておきます。
              </p>
            </div>
          </div>
        </div>

        {/* Step 3 - Important */}
        <div className="bg-[#fff7ed] rounded-xl border-2 border-[#f97316] p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#f97316] text-white rounded-full flex items-center justify-center font-medium text-sm shrink-0">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-[#1e3a5f] mb-2">
                🔑 神の声で「開始」を押す（重要）
              </h4>
              <p className="text-[#4b5563] text-sm mb-4">
                神の声の画面で「開始」ボタンを押すと、<strong>画面共有のダイアログ</strong>が表示されます。
                ここでの設定が最も重要です。
              </p>

              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[#f97316] font-bold">①</span>
                  <p className="text-sm text-[#374151]">
                    「Chromeタブ」を選択
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#f97316] font-bold">②</span>
                  <p className="text-sm text-[#374151]">
                    Google Meetが開いているタブを選択
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#f97316] font-bold">③</span>
                  <p className="text-sm text-[#374151]">
                    <strong className="text-[#f97316]">「タブの音声を共有」にチェック</strong>を入れる
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#f97316] font-bold">④</span>
                  <p className="text-sm text-[#374151]">
                    「共有」をクリック
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#9ca3af] mt-4">
                ※「タブの音声を共有」にチェックを入れることで、面接官（相手）の声を神の声が聞き取れるようになります
              </p>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#f97316] text-white rounded-full flex items-center justify-center font-medium text-sm shrink-0">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-[#1e3a5f] mb-2">
                面接練習開始！
              </h4>
              <p className="text-[#4b5563] text-sm">
                準備完了です。面接官役が質問をすると、神の声が回答のヒントを表示します。
                ヒントを参考にしながら自分の言葉で回答してみましょう。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-[#f0f9ff] rounded-xl border border-[#bae6fd] p-6">
        <h3 className="font-medium text-[#0369a1] mb-3">💡 練習のコツ</h3>
        <ul className="space-y-2 text-sm text-[#0c4a6e]">
          <li>• AIのヒントをそのまま読むのではなく、自分の言葉にアレンジしてみましょう</li>
          <li>• 最初はヒントを見ながら、徐々にヒントなしでも答えられるようになることを目指しましょう</li>
          <li>• 練習相手に「その回答、自然だった？」とフィードバックをもらいましょう</li>
        </ul>
      </div>
    </div>
  );
}

function RealInterviewGuide() {
  return (
    <div className="space-y-12">
      {/* Overview */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
        <h2 className="text-lg font-medium text-[#1e3a5f] mb-3">
          オンライン面接での使い方
        </h2>
        <p className="text-[#4b5563] leading-relaxed">
          実際のオンライン面接（Google Meet、Zoom等）でも、模擬面接と同じように使えます。
          緊張で頭が真っ白になっても、AIがヒントを出してくれます。
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-[#1e3a5f]">セットアップ手順</h3>

        {/* Step 1 */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#f97316] text-white rounded-full flex items-center justify-center font-medium text-sm shrink-0">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-[#1e3a5f] mb-2">
                事前にプロフィールを登録
              </h4>
              <p className="text-[#4b5563] text-sm">
                面接の前日までに、神の声にログインして志望企業・強み・ガクチカなどを入力しておきましょう。
              </p>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#f97316] text-white rounded-full flex items-center justify-center font-medium text-sm shrink-0">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-[#1e3a5f] mb-2">
                面接開始5分前に準備
              </h4>
              <p className="text-[#4b5563] text-sm mb-4">
                ブラウザで2つのタブを用意します。
              </p>
              <div className="bg-[#f9fafb] rounded-lg p-4 space-y-2 text-sm">
                <p><strong>タブ①：</strong>面接用（Google Meet / Zoom など）</p>
                <p><strong>タブ②：</strong>神の声</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-[#fff7ed] rounded-xl border-2 border-[#f97316] p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#f97316] text-white rounded-full flex items-center justify-center font-medium text-sm shrink-0">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-[#1e3a5f] mb-2">
                🔑 面接開始直前に「開始」（重要）
              </h4>
              <p className="text-[#4b5563] text-sm mb-4">
                面接官が入室する直前に、神の声で「開始」を押します。
                模擬面接と同じ手順で設定してください。
              </p>

              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[#f97316] font-bold">①</span>
                  <p className="text-sm text-[#374151]">
                    「Chromeタブ」を選択
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#f97316] font-bold">②</span>
                  <p className="text-sm text-[#374151]">
                    面接ツール（Meet/Zoomなど）のタブを選択
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#f97316] font-bold">③</span>
                  <p className="text-sm text-[#374151]">
                    <strong className="text-[#f97316]">「タブの音声を共有」にチェック</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#f97316] font-bold">④</span>
                  <p className="text-sm text-[#374151]">
                    「共有」をクリック
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#f97316] text-white rounded-full flex items-center justify-center font-medium text-sm shrink-0">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-[#1e3a5f] mb-2">
                画面配置を工夫する
              </h4>
              <p className="text-[#4b5563] text-sm mb-4">
                面接ツールと神の声を同時に見られるように、ウィンドウを並べて配置しましょう。
              </p>
              <div className="bg-[#f9fafb] rounded-lg p-4">
                <p className="text-sm text-[#374151] mb-2">
                  <strong>おすすめの配置：</strong>
                </p>
                <p className="text-sm text-[#6b7280]">
                  画面左側に面接ツール（カメラON）、右側に神の声を小さく表示。
                  自然に視線を動かせる位置に配置すると、違和感なく確認できます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-[#fef2f2] rounded-xl border border-[#fecaca] p-6">
        <h3 className="font-medium text-[#991b1b] mb-3">⚠️ ご利用にあたって</h3>
        <ul className="space-y-2 text-sm text-[#7f1d1d]">
          <li>• 神の声は面接練習・準備ツールとして開発されています</li>
          <li>• 実際の面接でのご使用は、応募先企業のポリシーをご確認ください</li>
          <li>• AIの提案は参考情報です。最終的には自分の言葉で回答することが大切です</li>
        </ul>
      </div>

      {/* Tips */}
      <div className="bg-[#f0f9ff] rounded-xl border border-[#bae6fd] p-6">
        <h3 className="font-medium text-[#0369a1] mb-3">💡 本番でのコツ</h3>
        <ul className="space-y-2 text-sm text-[#0c4a6e]">
          <li>• 神の声はあくまで「お守り」として。まずは自分で考えて答える意識を</li>
          <li>• 頭が真っ白になったときだけ、チラッと確認する程度に</li>
          <li>• AIのヒントを丸読みすると不自然になるので、キーワードだけ参考に</li>
          <li>• 事前に模擬面接で何度も練習しておくことが一番の対策です</li>
        </ul>
      </div>
    </div>
  );
}
