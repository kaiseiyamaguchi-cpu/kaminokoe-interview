import Link from "next/link";

export default function PrivacyPage() {
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

      {/* Content */}
      <main className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-medium mb-8 text-[#1e3a5f]">
            プライバシーポリシー
          </h1>

          <div className="space-y-8 text-[#374151] leading-relaxed">
            <section>
              <p>
                株式会社AccelShift（以下「当社」）は、「神の声」（以下「本サービス」）における
                ユーザーの個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第1条（収集する情報）
              </h2>
              <p className="mb-2">当社は、以下の情報を収集することがあります。</p>
              <ul className="list-disc list-inside space-y-1">
                <li>メールアドレス</li>
                <li>電話番号（認証用）</li>
                <li>お支払い情報（クレジットカード情報はStripe社が管理）</li>
                <li>プロフィール情報（志望業界、経歴等、ユーザーが任意で入力した情報）</li>
                <li>サービス利用履歴</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第2条（音声データの取り扱い）
              </h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  本サービスで処理される音声データは、ユーザーの端末内でリアルタイム処理されます。
                </li>
                <li>
                  音声データは当社のサーバーに保存・送信されません。
                </li>
                <li>
                  音声認識の結果（テキストデータ）は、セッション終了後に自動的に削除されます。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第3条（利用目的）
              </h2>
              <p className="mb-2">
                当社は、収集した情報を以下の目的で利用します。
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>本サービスの提供・運営</li>
                <li>ユーザー認証・本人確認</li>
                <li>料金の請求・決済処理</li>
                <li>サービス改善・新機能開発</li>
                <li>お問い合わせへの対応</li>
                <li>重要なお知らせの送信</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第4条（第三者提供）
              </h2>
              <p className="mb-2">
                当社は、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>法令に基づく場合</li>
                <li>人の生命・身体・財産の保護に必要な場合</li>
                <li>公衆衛生・児童の健全育成に必要な場合</li>
                <li>国の機関等への協力が必要な場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第5条（外部サービスの利用）
              </h2>
              <p className="mb-2">
                本サービスでは、以下の外部サービスを利用しています。
                各サービスのプライバシーポリシーもご確認ください。
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Stripe（決済処理）</li>
                <li>OpenAI（AI処理）</li>
                <li>Convex（データベース）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第6条（Cookieの使用）
              </h2>
              <p>
                本サービスでは、ユーザー体験の向上のためCookieを使用することがあります。
                ブラウザの設定によりCookieを無効にすることも可能ですが、
                一部機能が正常に動作しなくなる場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第7条（セキュリティ）
              </h2>
              <p>
                当社は、個人情報の漏洩・滅失・毀損を防止するため、
                適切なセキュリティ対策を講じます。
                通信はSSL/TLSにより暗号化されています。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第8条（個人情報の開示・訂正・削除）
              </h2>
              <p>
                ユーザーは、当社に対して個人情報の開示・訂正・削除を請求することができます。
                ご希望の場合は、下記のお問い合わせ先までご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第9条（ポリシーの変更）
              </h2>
              <p>
                当社は、必要に応じて本ポリシーを変更することがあります。
                重要な変更がある場合は、本サービス上でお知らせします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第10条（お問い合わせ）
              </h2>
              <p>
                本ポリシーに関するお問い合わせは、以下までご連絡ください。
              </p>
              <div className="mt-3 p-4 bg-[#f9fafb] rounded border border-[#e5e7eb]">
                <p>株式会社AccelShift</p>
                <p>〒153-0064 東京都目黒区下目黒1丁目1番14号 コノトラビル7F</p>
                <p>メール: info@accelshift.jp</p>
              </div>
            </section>

            <section className="pt-4 border-t border-[#e5e7eb]">
              <p className="text-sm text-[#6b7280]">
                制定日: 2026年3月9日
                <br />
                株式会社AccelShift
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#e5e7eb] bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-6 text-sm text-[#6b7280]">
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
          <p className="text-xs text-[#d1d5db] mt-4">© 2026 Kaminokoe</p>
        </div>
      </footer>
    </div>
  );
}
