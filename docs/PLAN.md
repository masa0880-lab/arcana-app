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

## M3 — Anthropic API 連携（鑑定文生成）

**ゴール**: 引いたカード+質問+スプレッドからClaudeが鑑定文を返す。

- `app/api/reading/route.ts`（POST）：
  - リクエスト: `{ question, spreadId, drawnCards: DrawnCard[] }`
  - サーバー側で `ANTHROPIC_API_KEY` を使い `@anthropic-ai/sdk` 経由でClaudeを呼ぶ。
  - レスポンス: `{ interpretation: string, perCard?: string[] }`
- プロンプト設計：スプレッド種別ごとにシステムプロンプトを切り替え（過去/現在/未来、ケルト十字の各位置の意味など）。
- レート制限の簡易対策（同一IPで連打されたとき429を返す等）。
- エラー時は鑑定中止＋メッセージ表示。

**完了基準**: Postman/curlで叩いて鑑定文が返ってくる。フロントは未配線でOK。

---

## M4 — UI実装（質問→スプレッド→ドロー→鑑定）

**ゴール**: ユーザーが最初から最後まで占いを完了できる。

- `/reading` のフロー：
  1. 質問テキスト入力
  2. スプレッド選択（1枚 / 3枚 / ケルト十字）
  3. カードを引く演出（Framer Motion でめくり）
  4. API呼び出し → 鑑定文を表示
  5. 結果を `localStorage` に保存
- `components/Card.tsx` — 表/裏のフリップ
- `components/SpreadLayout.tsx` — スプレッドごとの配置
- `/` トップ：今日の1枚（M2の `getDailyCard`）を表示 + 「占いを始める」CTA

**完了基準**: 1枚引きと3枚引きが実機で完走する（ケルト十字はレイアウトのみでも可）。

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

