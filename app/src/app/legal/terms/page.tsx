import Link from "next/link";

export default function TermsPage() {
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
          <h1 className="text-2xl font-medium mb-8 text-[#1e3a5f]">利用規約</h1>

          <div className="space-y-8 text-[#374151] leading-relaxed">
            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第1条（適用）
              </h2>
              <p>
                本規約は、株式会社AccelShift（以下「当社」）が提供する「神の声」（以下「本サービス」）の利用に関する条件を定めるものです。
                ユーザーは本規約に同意の上、本サービスを利用するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第2条（サービス内容）
              </h2>
              <p>
                本サービスは、面接練習・準備を支援するAIツールです。
                音声認識技術を用いて面接官の質問を解析し、回答のヒントを提示します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第3条（利用登録）
              </h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  本サービスの利用を希望する方は、当社の定める方法により利用登録を行うものとします。
                </li>
                <li>
                  登録情報は正確かつ最新の情報を提供してください。
                </li>
                <li>
                  当社は、以下の場合に利用登録を拒否することがあります。
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>虚偽の情報を提供した場合</li>
                    <li>過去に本規約に違反したことがある場合</li>
                    <li>その他、当社が不適切と判断した場合</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第4条（チケット制・料金）
              </h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  本サービスはチケット制を採用しています。1チケットで10分間ご利用いただけます。
                </li>
                <li>
                  チケットの購入は、当社が定める価格・決済方法により行います。
                </li>
                <li>
                  購入したチケットの有効期限は購入日から1年間とします。
                </li>
                <li>
                  チケットの払い戻しは原則として行いません。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第5条（禁止事項）
              </h2>
              <p className="mb-2">
                ユーザーは、以下の行為を行ってはなりません。
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>他のユーザーに迷惑をかける行為</li>
                <li>本サービスを商用目的で利用する行為（当社の許可がある場合を除く）</li>
                <li>本サービスの技術的保護手段を回避する行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第6条（免責事項）
              </h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  本サービスは面接練習・準備を支援するものであり、採用結果を保証するものではありません。
                </li>
                <li>
                  本サービスの利用により生じた損害について、当社は一切の責任を負いません。
                </li>
                <li>
                  AIによる回答提案は参考情報であり、その正確性・適切性を保証するものではありません。
                </li>
                <li>
                  実際の面接での本サービスの使用は、応募先企業のポリシーに従ってください。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第7条（サービスの変更・停止）
              </h2>
              <p>
                当社は、ユーザーへの事前通知なく、本サービスの内容を変更、または提供を停止することがあります。
                これによりユーザーに生じた損害について、当社は責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第8条（知的財産権）
              </h2>
              <p>
                本サービスに関する知的財産権は、当社または正当な権利者に帰属します。
                ユーザーは、本サービスを通じて提供されるコンテンツを、私的使用の範囲を超えて複製・転載・改変することはできません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第9条（規約の変更）
              </h2>
              <p>
                当社は、必要と判断した場合、本規約を変更することがあります。
                変更後の規約は、本サービス上での掲示をもって効力を生じます。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-3 text-[#1e3a5f]">
                第10条（準拠法・管轄）
              </h2>
              <p>
                本規約の解釈は日本法に準拠し、本サービスに関する紛争については、
                東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
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
