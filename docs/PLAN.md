# arcana-app マイルストーン

開発を6つのマイルストーン（M1〜M6）に分ける。各マイルストーンは独立してデプロイ可能な状態を目指す。

---

## M1 — 設計 & スキャフォルド ✅ (このコミット)

**ゴール**: Next.jsプロジェクトが立ち上がり、空のページ3つが表示できる。

- [x] `CLAUDE.md`：プロダクト方針・技術スタック・ディレクトリ規約
- [x] `docs/PLAN.md`：本ファイル（M1〜M6）
- [x] `docs/DATA_MODEL.md`：Card / Spread / Reading の型仕様 + サンプル
- [x] Next.js 14 + TypeScript + Tailwind 構成
- [x] ダーク基調のルートレイアウト
- [x] `/` `/reading` `/history` の空ページ
- [x] `types/tarot.ts` に基本型
- [x] `manifest.webmanifest` と最小限の `sw.js`
- [x] `.env.local.example`、`.gitignore`
- [x] `npm run dev` で起動できる

**完了基準**: `npm install && npm run dev` で3ページが表示される。

---

## M2 — 78枚デッキとシャッフル ✅

**ゴール**: 78枚のカードデータと、シード可能なシャッフル/正逆ロジックがある。

- [x] `data/deck.ts` に大アルカナ22 + 小アルカナ56を定義（日本語名 + 英語名 + 正逆キーワード）
- [x] `data/spreads.ts` に3スプレッド（single / three-card / celtic-cross）を定義
- [x] `lib/deck.ts`：
  - `shuffleDeck(seed?)` — Fisher–Yates + Mulberry32（決定論的）
  - `drawCards(count, seed?)` — 正位置/逆位置付与、決定論的
  - `getDailyCard(date)` — 日付シードで1日固定
- [x] `lib/__tests__/deck.test.ts` で重複なし・78枚・seed再現性をテスト（22ケース）
- [x] `lib/__tests__/card-images.test.ts` で78枚分の画像ファイル存在確認
- [x] Vitestをテストランナーとして導入（`npm test` / `npm run test:watch`）
- [x] Rider–Waite画像78枚を `public/cards/` にWebP同梱（出典: searge/tarot, Unlicense）
- [x] `/` トップに「今日の1枚」を実装（カード画像 + 名前 + キーワード）

**完了基準**: シャッフル/ドローが純関数として動き、テストが通る。

---

## M3 — Anthropic API 連携（鑑定文生成）✅

**ゴール**: 引いたカード+質問+スプレッドからClaudeが鑑定文を返す。

- [x] `app/api/reading/route.ts`（POST）：
  - リクエスト: `{ question, spreadId, drawnCards: DrawnCard[] }`
  - サーバー側で `ANTHROPIC_API_KEY` を使い `@anthropic-ai/sdk` 経由でClaudeを呼ぶ
  - レスポンス: `{ interpretation: string }`
- [x] モデル: `claude-sonnet-4-6`（`ANTHROPIC_MODEL` env で上書き可能）
  - `thinking: { type: 'disabled' }` + `output_config: { effort: 'low' }` でコスト最適化
- [x] バリデーション: 質問空 / 500字超過 / 不正スプレッド / 枚数不一致 / 存在しないカードID
- [x] プロンプト設計：システムプロンプトに占い師のスタンス・文体・安全配慮を集約、ユーザーメッセージでスプレッド種別と位置の意味（日英）+ カード詳細を渡す
- [x] レート制限：同一IP 5回/分（in-memoryバケット、Vercel本格運用ではUpstash推奨と注釈）
- [x] エラー時のメッセージ表示（401 / 429 / APIエラー / その他）

**完了基準**: curlで叩いて鑑定文が返ってくる。フロントは未配線でOK。 → ✅ バリデーション/レート制限/Anthropic呼び出しの全パスを動作確認

---

## M4 — UI実装（質問→スプレッド→ドロー→鑑定）✅

**ゴール**: ユーザーが最初から最後まで占いを完了できる。

- [x] `/reading` のフロー（フェーズ状態機械）:
  1. 質問入力（500字上限、文字数カウンタ）
  2. スプレッド選択（1枚 / 3枚 / ケルト十字、カード型ボタン）
  3. カードを引く演出（Framer Motionで1枚ずつ順番にフリップ、ケルト十字は速め）
  4. `/api/reading` 呼び出し → 鑑定文を表示
  5. `localStorage` に保存（自動）
- [x] `components/TarotCardView.tsx` — 表/裏のフリップアニメーション（3Dローテーション、逆位置で180°回転）
- [x] `components/SpreadLayout.tsx` — スプレッドごとの配置（single=中央、three-card=横並び、celtic-cross=2×5グリッド ※本格レイアウトはM6）
- [x] `lib/history.ts` — `localStorage` CRUD（キー `arcana:history:v1`、最新100件保持、バリデーション付き読み込み）
- [x] エラーハンドリング: 入力バリデーション失敗 / API呼び出し失敗で再試行可能

**完了基準**: 1枚引きと3枚引きが実機で完走する（ケルト十字はレイアウトのみでも可）。 → ✅ UIフロー実装完了、実APIキーでの動作確認はM6のVercelデプロイ時に行う。

---

## M5 — 履歴機能

**ゴール**: 過去の占い結果を見返せる。

- `lib/history.ts` — `localStorage` への CRUD
  - キー: `arcana:history:v1`
  - エントリ: `Reading`（`DATA_MODEL.md`参照）
- `/history` ページ：一覧 + 詳細展開
- 件数上限（例: 最新100件）と削除UI

**完了基準**: 占い結果が履歴に出る／消せる。

---

## M6 — PWA仕上げ & デプロイ

**ゴール**: iPhoneのホーム画面に追加できる、Vercel本番URLが動く。

- `public/manifest.webmanifest` 完成（name, short_name, icons, theme_color, background_color, display: standalone）
- アイコン（192/512、maskable）を `public/icons/` に配置
- `sw.js` で静的アセットのキャッシュ（API はキャッシュしない）
- `<head>` に Apple用メタタグ（`apple-touch-icon`, `apple-mobile-web-app-capable` 等）
- Vercelに `ANTHROPIC_API_KEY` を設定してデプロイ
- README にデプロイ手順を追記

**完了基準**: iPhone Safari で「ホーム画面に追加」→ スタンドアロン起動できる。

---

## スコープ外（やらない）

- ユーザー認証 / クラウドDB
- 課金 / 広告
- 多言語対応（日本語UIのみ）
- リアルタイム共有 / SNS連携

