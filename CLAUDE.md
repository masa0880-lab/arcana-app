# arcana-app — Claude Code 開発ガイド

タロット占いWebアプリ。78枚フルデッキを使い、Anthropic API（Claude）で鑑定文を生成する。

このドキュメントは Claude Code がこのリポジトリで作業するときの方針を示すもの。新しいファイルを足すとき・既存ファイルを編集するときは、まずここを参照すること。

---

## プロダクトの方針

- **ユーザー**: スマホ（特にiPhone）で気軽にタロット占いを引きたい個人。ログインなし。
- **コア体験**: 質問を入力 → スプレッド選択 → カードを引く演出 → Claudeが鑑定文を生成 → 履歴に保存。
- **MVPの核**:
  - 78枚フルデッキ（大アルカナ22 + 小アルカナ56）、正位置/逆位置あり。
  - スプレッド3種: 1枚引き / 3枚（過去・現在・未来）/ ケルト十字（10枚）。
  - 今日の1枚（日付シードで1日固定）。
- **非ゴール**（MVPでは作らない）:
  - ユーザー認証、サーバーDB、課金、SNSシェア機能、多言語対応。

---

## 技術スタック

| レイヤ | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 14（App Router）+ TypeScript |
| スタイル | Tailwind CSS（ダーク基調） |
| アニメーション | Framer Motion（カードめくり演出） |
| AI | Anthropic API（`@anthropic-ai/sdk`）でClaudeを呼び出し |
| 永続化 | ブラウザの `localStorage`（バックエンドDB不要） |
| PWA | `manifest.webmanifest` + Service Worker |
| デプロイ | Vercel |

### Anthropic API の取り扱い（重要）

- **API呼び出しは必ずサーバー側で実行する**。`app/api/**` のRoute Handler経由のみ。
- APIキーは `ANTHROPIC_API_KEY` 環境変数で受け取り、**`NEXT_PUBLIC_` 接頭辞は絶対に付けない**（クライアントバンドルに混入するため）。
- `.env.local` は `.gitignore` 済み。サンプルは `.env.local.example` を参照。
- Vercelデプロイ時は Project Settings → Environment Variables に `ANTHROPIC_API_KEY` を登録する。

---

## ディレクトリ規約

```
arcana-app/
├── app/
│   ├── layout.tsx          # ルートレイアウト（ダーク基調、メタタグ、PWAリンク）
│   ├── page.tsx            # `/` トップ：今日の1枚 + 占いを始めるCTA
│   ├── globals.css         # Tailwindエントリ
│   ├── reading/
│   │   └── page.tsx        # `/reading` 質問入力→スプレッド選択→鑑定実行
│   ├── history/
│   │   └── page.tsx        # `/history` localStorageの履歴一覧
│   └── api/
│       └── reading/
│           └── route.ts    # POST: 引いたカード+質問 → Claudeで鑑定文生成（M3で実装）
├── components/             # 再利用可能なUI（Card, Spread, etc.）M2以降で追加
├── lib/                    # ドメインロジック（デッキ・シャッフル・履歴IO等）M2以降
├── types/
│   └── tarot.ts            # Card / Spread / Reading などの型
├── data/                   # 78枚のカードデータ（M2で追加）
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js               # Service Worker（オフライン対応はM6で本格化）
│   └── icons/              # PWAアイコン（M6で追加）
├── docs/
│   ├── PLAN.md             # マイルストーン
│   └── DATA_MODEL.md       # データモデル仕様
├── .env.local.example
├── CLAUDE.md               # このファイル
└── README.md
```

### コーディング規約

- すべて TypeScript。`any` は避ける。型は `types/` に集約。
- コンポーネントは関数コンポーネント。Server Component を基本にし、状態を持つものだけ `'use client'`。
- スタイルはTailwindユーティリティを基本に、共通色は `tailwind.config.ts` の `theme.extend.colors` に集約。
- カードIDは `major-00` / `wands-01` のようなkebab-case文字列で一意に保つ（`types/tarot.ts` 参照）。
- 履歴の `localStorage` キーは `arcana:history:v1` のように **バージョン付き** にする（マイグレーション可能にするため）。

---

## マイルストーン概要

詳細は `docs/PLAN.md` を参照。

- **M1（このコミット）**: 設計書 + Next.js スキャフォルド + 空ページ3つ。
- M2以降の内容は `docs/PLAN.md` を見ること。本ガイドはM1完了時点の状態を反映している。

---

## 開発フロー

```bash
npm install
cp .env.local.example .env.local   # APIキーをセット
npm run dev                        # http://localhost:3000
```

ビルド確認は `npm run build`。Lintは `npm run lint`。

