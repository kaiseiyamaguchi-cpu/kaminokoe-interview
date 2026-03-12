# Kaminokoe 開発タスク

面接対策AIツール「神の声」の開発・リリースに向けたタスク一覧

---

## 1. 企画系

### 1.1 料金設計

- 料金プラン設計 → チケット制（1チケット=10分）
- 価格帯の決定 → ¥200/1枚, ¥500/3枚, ¥2,500/18枚, ¥5,000/36枚
- 競合比較・価格調査

### 1.2 利用制限

- 無料ユーザーの制限設計 → 初回3チケット（30分）
- 有料ユーザーの特典設計 → チケット購入で追加
- アフィリエイト登録で3チケット追加

---

## 2. 開発系

### 2.1 ユーザー認証

- 認証方式選定 → Convex Auth + LINE Login
- LINEログイン実装
- プロフィール設定（志望企業、強み、ガクチカ等）

### 2.2 DB連携

- DB選定 → Convex
- スキーマ設計（userProfiles, sessionLogs, ticketTransactions, purchases, affiliateRewards）
- セッション管理・チケット消費機能
- 話者判定ロジック（名前+ターン追跡）

### 2.3 Stripe連携

- Stripeアカウント本番モード有効化
- セキュリティ対策申告完了
- `/api/stripe/checkout` チケット制対応
- Webhook実装（署名検証付き）
- **Stripe商品作成**（ticket1/ticket3/ticket18/ticket36）
- **Webhook URL登録**
- 本番テスト決済

### 2.4 法的ページ ✅ NEW

- 特定商取引法に基づく表示（`/legal/tokushoho`）
- 利用規約（`/legal/terms`）
- プライバシーポリシー（`/legal/privacy`）
- LPフッターにリンク追加

### 2.5 マイページ ✅ NEW

- チケット残高表示
- チケット購入UI（4プラン）
- 購入・使用履歴表示
- メインページからの導線（チケット表示クリック）

### 2.6 デプロイ

- ドメイン取得（kaminokoe.jp）
- Vercel デプロイ設定
- Vercelにカスタムドメイン設定
- Convex本番デプロイ（`npx convex deploy`）
- 本番環境テスト

---

## 3. アフィリエイト系

### 3.1 ASP登録

- A8.net 登録完了

### 3.2 新卒向け案件連携

- キミスカ 提携申請・リンク取得済み

### 3.3 導線実装

- AffiliatePromo コンポーネント作成
- ユーザーID付きリンク生成（id1パラメータ）
- 申請→承認フロー実装（pending/approved/rejected）
- 管理画面作成（/admin/affiliate）

---

## 4. 集客系

### 4.1 公式TikTok

- 戦略ドキュメント作成（公式TikTok戦略.md）
- TikTokアカウント開設
- デモ動画撮影
- 初回投稿

### 4.2 LP

- LP作成（/lp）
- カラースキーム統一（オレンジ+ネイビー）

### 4.3 口コミ・声かけ

- 優先順位: まずは声掛けを優先する
- 就活系の学生団体とかにアプローチする
- 学生募集
- 学生団体に声かける
- ふせの君に声かける
- 恭二に声かける
- 同志社の学生団体の人に声かける
- 弟に広めてもらう
- 野田啓太に声かける
- 森本らに声かける

---

## 本番稼働チェックリスト


| カテゴリ   | タスク                     | ステータス        |
| ------ | ----------------------- | ------------ |
| Stripe | 商品4つ作成                  | ✅ 不要（動的価格使用） |
| Stripe | Webhook URL登録           | ❌            |
| Stripe | STRIPE_WEBHOOK_SECRET設定 | ❌            |
| Stripe | テスト決済                   | ✅            |
| Vercel | デプロイ                    | ✅            |
| Vercel | 環境変数設定                  | ✅            |
| Vercel | カスタムドメイン                | ❌            |
| Convex | 本番デプロイ                  | ✅            |
| LINE   | コールバックURL追加             | ❌            |


---

## 次のアクション

1. **Stripe Webhook設定**
  - URL: `https://gregarious-sockeye-275.convex.site/stripe-webhook`
  - Event: `checkout.session.completed`
2. **Convex本番にWebhookシークレット設定**
  ```bash
   npx convex env set STRIPE_WEBHOOK_SECRET "whsec_xxx" --prod
  ```
3. **LINE DevelopersでコールバックURL追加**
  - `https://gregarious-sockeye-275.convex.site/api/auth/callback/line`
4. **Vercelカスタムドメイン設定**（kaminokoe.jp）

---

## 5. 使いやすさ改善（現在進行中）

### 要件
- LPとログイン後の使い方がわかりづらい問題を解決
- 模擬面接・実際の面接での使い方を明確に
- Google Meetでの使い方をわかりやすく説明
- 利用規約の補足は小さく記載

### タスク

| # | タスク | ステータス |
|---|--------|----------|
| 5-1 | 使い方ページ新規作成 (`/howto`) | ✅ |
| 5-2 | Google Meetでの画面共有・音声共有の設定方法 | ✅ |
| 5-3 | 模擬面接・実際面接での使い方説明 | ✅ |
| 5-4 | LP改善：「使い方を見る」ボタン追加 + FAQ追加 | ✅ |
| 5-5 | ログイン後画面に「使い方」リンク追加 | ✅ |

---

*最終更新: 2026年3月13日*