# arcana-app

タロット占いWebアプリ。78枚フルデッキで占い、Claudeが鑑定文を生成します。

- 78枚フルデッキ（大22 + 小56）、正位置/逆位置あり
- スプレッド3種: 1枚 / 3枚（過去・現在・未来）/ ケルト十字
- 「今日の1枚」（日付シードで1日固定）
- 履歴はブラウザのlocalStorageに保存（ログインなし）
- PWA: iPhoneのホーム画面に追加してスタンドアロン起動可

## クイックスタート

```bash
npm install
cp .env.local.example .env.local      # ANTHROPIC_API_KEY を貼る
npm run dev                           # http://localhost:3000
```

その他のコマンド:

```bash
npm run build         # 本番ビルド
npm run start         # ビルド済みアプリを起動
npm run lint          # ESLint
npm run typecheck     # TypeScript型チェック（出力なし）
npm test              # Vitest（純関数 + 画像存在）
npm run test:watch    # Vitest 監視モード
```

## ドキュメント

- 開発方針・ディレクトリ規約: [`CLAUDE.md`](./CLAUDE.md)
- マイルストーン（M1〜M6）: [`docs/PLAN.md`](./docs/PLAN.md)
- データモデル仕様: [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md)

## Vercelデプロイ手順

1. [Vercel](https://vercel.com) で **Add New → Project** からこのリポジトリをimport。
2. Project Settings → Environment Variables で次を追加：
   - キー: `ANTHROPIC_API_KEY`
   - 値: Anthropic ConsoleのAPIキー（`sk-ant-...`）
   - Environment: Production / Preview / Development すべて
   - **`NEXT_PUBLIC_` 接頭辞は絶対に付けないこと**（クライアントに漏れます）
3. （任意）`ANTHROPIC_MODEL` を追加してモデルを上書き（既定: `claude-sonnet-4-6`）。
4. Deployボタン → 完了後、発行されたURLを iPhone Safari で開く。
5. 共有メニュー → 「ホーム画面に追加」でPWAインストール完了。

ローカルから手動デプロイする場合：

```bash
npm i -g vercel
vercel link
vercel env add ANTHROPIC_API_KEY production
vercel --prod
```

## 技術スタック

Next.js 14 (App Router) / TypeScript / Tailwind CSS / Framer Motion / `@anthropic-ai/sdk` / PWA / Vercel

## クレジット

- カード画像: [searge/tarot](https://github.com/searge/tarot) (Unlicense, Rider-Waite Tarotのパブリックドメイン版)
- 鑑定文生成: Anthropic Claude (`claude-sonnet-4-6` 既定)
