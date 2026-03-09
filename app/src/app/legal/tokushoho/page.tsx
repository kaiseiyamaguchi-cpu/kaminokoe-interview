import Link from "next/link";

export default function TokushohoPage() {
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
            特定商取引法に基づく表示
          </h1>

          <div className="space-y-6">
            <section>
              <h2 className="text-sm text-[#6b7280] mb-2">販売業者</h2>
              <p className="text-[#374151]">株式会社AccelShift</p>
            </section>

            <section>
              <h2 className="text-sm text-[#6b7280] mb-2">代表者</h2>
              <p className="text-[#374151]">山口 快生</p>
            </section>

            <section>
              <h2 className="text-sm text-[#6b7280] mb-2">所在地</h2>
              <p className="text-[#374151]">
                〒153-0064
                <br />
                東京都目黒区下目黒1丁目1番14号 コノトラビル7F
              </p>
            </section>

            <section>
              <h2 className="text-sm text-[#6b7280] mb-2">連絡先</h2>
              <p className="text-[#374151]">
                メール: info@accelshift.jp
              </p>
            </section>

            <section>
              <h2 className="text-sm text-[#6b7280] mb-2">販売価格</h2>
              <div className="text-[#374151] space-y-1">
                <p>・単発チケット（10分）: ¥200（税込）</p>
                <p>・30分パック（3チケット）: ¥500（税込）</p>
                <p>・5回分パック（18チケット）: ¥2,500（税込）</p>
                <p>・10回分パック（36チケット）: ¥5,000（税込）</p>
              </div>
            </section>

            <section>
              <h2 className="text-sm text-[#6b7280] mb-2">
                販売価格以外の必要料金
              </h2>
              <p className="text-[#374151]">
                インターネット接続料金、通信料金等はお客様のご負担となります。
              </p>
            </section>

            <section>
              <h2 className="text-sm text-[#6b7280] mb-2">支払方法</h2>
              <p className="text-[#374151]">クレジットカード決済（Stripe）</p>
            </section>

            <section>
              <h2 className="text-sm text-[#6b7280] mb-2">支払時期</h2>
              <p className="text-[#374151]">
                クレジットカード決済：ご注文時に即時決済
              </p>
            </section>

            <section>
              <h2 className="text-sm text-[#6b7280] mb-2">商品の引渡し時期</h2>
              <p className="text-[#374151]">
                決済完了後、即時にチケットが付与されます。
              </p>
            </section>

            <section>
              <h2 className="text-sm text-[#6b7280] mb-2">
                返品・キャンセルについて
              </h2>
              <p className="text-[#374151]">
                本サービスはデジタルコンテンツの性質上、購入後の返品・キャンセルはお受けできません。
                <br />
                ただし、システム障害等により正常にサービスをご利用いただけなかった場合は、
                お問い合わせください。
              </p>
            </section>

            <section>
              <h2 className="text-sm text-[#6b7280] mb-2">動作環境</h2>
              <p className="text-[#374151]">
                ・マイク付きのPC、スマートフォン、タブレット
                <br />
                ・対応ブラウザ: Chrome、Safari、Edge（最新版推奨）
                <br />
                ・インターネット接続環境
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
