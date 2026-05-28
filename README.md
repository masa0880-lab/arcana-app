# arcana-app

タロット占いWebアプリ。78枚フルデッキで占い、Claudeが鑑定文を生成します。

## クイックスタート

```bash
npm install
cp .env.local.example .env.local   # ANTHROPIC_API_KEY をセット
npm run dev                        # http://localhost:3000
```

## ドキュメント

- 開発方針・ディレクトリ規約: [`CLAUDE.md`](./CLAUDE.md)
- マイルストーン（M1〜M6）: [`docs/PLAN.md`](./docs/PLAN.md)
- データモデル仕様: [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md)

## 技術スタック

Next.js 14 (App Router) / TypeScript / Tailwind CSS / Framer Motion / Anthropic API / PWA / Vercel
