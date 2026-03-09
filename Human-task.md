# Human Task - Kaminokoe

Claudeではなく、人間が対応するタスク一覧

---

## 優先度：高

### LINE Developers チャネル作成（10分）

**目的**: LINE認証を使うためのAPI設定

1. https://developers.line.biz/ にアクセス
2. LINEアカウントでログイン
3. 「プロバイダー作成」
   - 名前: `Kaminokoe`
4. 「新規チャネル作成」→ **LINE Login** を選択
5. 入力項目:
   | 項目 | 入力値 |
   |------|--------|
   | チャネル名 | Kaminokoe |
   | チャネル説明 | 面接対策AI |
   | アプリタイプ | ウェブアプリ |
   | メールアドレス | あなたのメール |
6. 作成後、以下をコピー:
   - [x] **チャネルID**：2008874422
   - [x] **チャネルシークレット**：d234f87181f831d2cc1f574521aac4f8
7. 「LINE Login設定」→「コールバックURL」に追加:
   - [x] `http://localhost:3000/api/auth/callback/line`
   - [ ] `https://kaminokoe.jp/api/auth/callback/line`
   - [ ] **重要**: `https://joyous-viper-877.convex.site/api/auth/callback/line` ← Convex Auth用

**完了したらClaudeに共有** → 実装開始

---

### Stripeアカウント設定（15分）

**目的**: 決済機能を有効化

1. https://dashboard.stripe.com/ にアクセス
2. アカウント作成 or ログイン
3. 本番モード有効化（本人確認）
   - [ ] 事業情報入力
   - [ ] 銀行口座登録
4. 以下をコピー:
   - [ ] **本番用シークレットキー**（`sk_live_...`）
   - [ ] **本番用公開キー**（`pk_live_...`）

**完了したらClaudeに共有** → Webhook設定

---

## 優先度：中

### LINE公式アカウント作成（10分）

**目的**: ユーザーへのプッシュ通知、友だち追加特典

1. https://www.linebiz.com/jp/entry/ にアクセス
2. 「LINE公式アカウントを作成」
3. 入力項目:
   | 項目 | 入力値 |
   |------|--------|
   | アカウント名 | 神の声｜面接AI |
   | 業種（大） | 教育・学習支援 |
   | 業種（小） | 学習塾・予備校 |
4. 作成後:
   - [ ] プロフィール画像設定
   - [ ] あいさつメッセージ設定
   - [ ] リッチメニュー作成（後でOK）

---

### TikTokアカウント開設（5分）

**目的**: 公式デモ動画投稿

1. TikTokアプリでアカウント作成
2. アカウント情報:
   | 項目 | 入力値 |
   |------|--------|
   | ユーザー名 | @kaminokoe_ai |
   | 表示名 | 神の声｜面接AI |
   | プロフィール | 面接中にAIが答えを教えてくれる🎤 |
3. プロフィールリンク設定:
   - [ ] `https://kaminokoe.jp`

---

### ASP登録（各10分）

**目的**: アフィリエイト収益

- [ ] **A8.net** - 登録済み
- [ ] **アクセストレード** - https://www.accesstrade.ne.jp/
- [ ] **バリューコマース** - https://www.valuecommerce.ne.jp/

---

## 優先度：低（後でOK）

### ドメイン設定

- [ ] kaminokoe.jp のDNS設定（Vercel連携時）

### 動画撮影

- [ ] デモ動画の画面録画
- [ ] 編集（CapCut）

---

## 完了報告テンプレート

```
【LINE Developers】
チャネルID: xxxxxxxxxxxx
チャネルシークレット: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
コールバックURL設定: 完了

【Stripe】
シークレットキー: sk_live_xxxx
公開キー: pk_live_xxxx
```

---

*最終更新: 2026年3月9日*
