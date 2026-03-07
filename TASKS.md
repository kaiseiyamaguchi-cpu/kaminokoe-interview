# Kaminokoe 開発タスク

面接対策AIツール「Kaminokoe」の開発・リリースに向けたタスク一覧

---

## 1. 企画系（確定）

### 1.1 料金設計

**セッション定義**: 1セッション = 30分（超過で2セッション消費）

**原価計算**:
- OpenAI Realtime API: $0.06/分
- 30分の実質音声時間（2/3）: 20分
- 原価: $1.20 ≈ 180円/セッション

**有料プラン**:
| プラン | 価格 | 原価 | 粗利率 |
|--------|------|------|--------|
| 単発 1セッション | ¥398 | 180円 | 55% |
| 10セッション（10%OFF） | ¥3,580 | 1,800円 | 50% |
| 15セッション（15%OFF） | ¥4,980 | 2,700円 | 46% |

### 1.2 無料セッション獲得方法

| 方法 | セッション数 |
|------|-------------|
| 初回登録 | 3回 |
| アフィリエイト一括申込 | 5回 |

### 1.3 利用制限

- 1セッション = 最大30分
- 30分超過 → 2セッション消費
- セッション残数0 → 購入 or アフィリエイト申込を促す

---

## 2. 開発系

### 2.1 Convex初期化
- [ ] Convexプロジェクト作成
- [ ] 環境変数設定

### 2.2 認証機能
- [ ] Convex Auth設定
- [ ] ユーザー登録・ログイン実装
- [ ] 初回登録時に3セッション付与

### 2.3 DBスキーマ

```typescript
// users
users: {
  clerkId: string,
  email: string,
  sessions: number,  // 残りセッション数
  createdAt: number,
}

// sessionLogs（利用履歴）
sessionLogs: {
  userId: Id<"users">,
  startedAt: number,
  endedAt: number,
  durationMinutes: number,
  sessionsConsumed: number,  // 1 or 2
}

// purchases（購入履歴）
purchases: {
  userId: Id<"users">,
  stripePaymentId: string,
  plan: "single" | "pack10" | "pack15",
  sessionsAdded: number,
  amount: number,
  createdAt: number,
}

// affiliateRewards（アフィリエイト報酬）
affiliateRewards: {
  userId: Id<"users">,
  sessionsAdded: number,
  createdAt: number,
}
```

### 2.4 セッション管理機能
- [ ] セッション開始API（残数チェック）
- [ ] セッション終了API（時間計測、消費処理）
- [ ] 残数不足時のエラーハンドリング

### 2.5 Stripe連携
- [ ] Stripeアカウント設定
- [ ] 商品・価格設定（3プラン）
- [ ] Checkout Session作成
- [ ] Webhook（支払い成功 → セッション追加）

### 2.6 デプロイ
- [x] ドメイン取得（kaminokoe.jp）
- [ ] Vercel デプロイ設定
- [ ] Vercelにカスタムドメイン設定
- [ ] 本番環境テスト

---

## 3. アフィリエイト系

### 3.1 ASP登録
- [x] A8.net 登録完了
- [ ] アクセストレード 登録
- [ ] バリューコマース 登録

### 3.2 新卒向け案件連携（承認待ち）
- [ ] OfferBox 提携申請
- [ ] キミスカ 提携申請
- [ ] キャリアチケット 提携申請
- [ ] キャリアスタート 提携申請
- [ ] MeetsCompany 提携申請

### 3.3 導線実装
- [ ] 就活サービス紹介画面設計
- [ ] 一括申込フォーム
- [ ] 申込完了 → 5セッション付与

---

## 4. 集客系（TikTok 2アカウント運用）

### 4.1 アカウントA：ノウハウ系インフルエンサー
- [x] 台本10本作成済み（就活ノウハウ系）
- [x] 背景画像30枚リスト化済み（Unsplash/Pexels）
- [x] 制作ワークフロー設計済み
- [ ] TikTokアカウント開設
- [ ] Canvaで動画作成（手動）
- [ ] 初回投稿・検証

### 4.2 アカウントB：デモ動画
- [x] 戦略リサーチ完了（Final Round AI等の競合分析）
- [x] 台本10本作成済み（ギリギリ攻めるトーン）
- [ ] 神の声のデモ画面録画
- [ ] CapCutで動画作成（手動）
- [ ] TikTokアカウント開設（個人名義）
- [ ] 初回投稿・検証

### 4.3 動画制作方針
- **当面は手動作成**（CapCut / Canva）
- 自動化（Remotion等）は投稿数が増えてから検討

---

## 開発順序

1. **Convex初期化** ← 今ここ
2. **認証機能**（Convex Auth）
3. **DBスキーマ作成**
4. **セッション管理機能**
5. **Stripe連携**
6. **デプロイ**

---

*最終更新: 2026年3月7日*
*集客系タスク更新: 動画は当面手動作成*
