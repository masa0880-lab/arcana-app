# arcana-app データモデル

このドキュメントはアプリ内のドメインデータ（カード・スプレッド・占い結果）の正式仕様。型定義は `types/tarot.ts` と一致させること。

---

## 1. カード（`Card`）

タロット78枚それぞれの**静的データ**（個別の引きとは独立）。

```ts
export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';

export interface Card {
  /** 一意ID。例: 'major-00', 'wands-01', 'cups-king' */
  id: string;
  /** 表示名（日本語）。例: '愚者', 'ワンドの1' */
  name: string;
  /** 英語名。例: 'The Fool' */
  nameEn: string;
  arcana: Arcana;
  /** minor のときのみ必須 */
  suit?: Suit;
  /**
   * 大アルカナ: 0..21
   * 小アルカナ: 1..10（ピップ）、11=Page, 12=Knight, 13=Queen, 14=King
   */
  number: number;
  keywords: {
    upright: string[];
    reversed: string[];
  };
  /** `public/cards/` 配下の相対パス。M2以降で埋める */
  imagePath: string;
}
```

### ID 命名規則

| 種別 | パターン | 例 |
| --- | --- | --- |
| 大アルカナ | `major-{00..21}` | `major-00`（愚者）、`major-21`（世界） |
| 小アルカナ ピップ | `{suit}-{01..10}` | `wands-01`, `cups-10` |
| 小アルカナ コート | `{suit}-{page,knight,queen,king}` | `swords-queen` |

### 78枚の内訳

- 大アルカナ: 22枚（`major-00`〜`major-21`）
- 小アルカナ × 4スート × 14枚 = 56枚
  - Wands（杖）、Cups（聖杯）、Swords（剣）、Pentacles（金貨）
  - 各スート: Ace(1)〜10、Page、Knight、Queen、King

---

## 2. 引かれたカード（`DrawnCard`）

特定の占いセッションで**実際に引かれた1枚**。正逆を含む。

```ts
export type Orientation = 'upright' | 'reversed';

export interface DrawnCard {
  cardId: string;       // Card.id への参照
  orientation: Orientation;
  /** スプレッド内での位置インデックス（0始まり） */
  position: number;
}
```

---

## 3. スプレッド（`Spread`）

カード配置パターンの定義。

```ts
export type SpreadId = 'single' | 'three-card' | 'celtic-cross';

export interface SpreadPosition {
  /** 0始まりの位置インデックス */
  index: number;
  /** その位置の意味ラベル（日本語）。例: '過去', 'あなたの現状' */
  label: string;
  /** Claudeに渡す英語の意味（プロンプト用） */
  meaningEn: string;
}

export interface Spread {
  id: SpreadId;
  name: string;           // 表示名（日本語）
  description: string;    // 1行説明
  cardCount: number;
  positions: SpreadPosition[];
}
```

### 3つのスプレッド定義

| id | name | cardCount | 用途 |
| --- | --- | --- | --- |
| `single` | 1枚引き | 1 | 今日の助言 / シンプルなYes-No |
| `three-card` | 3枚スプレッド（過去・現在・未来） | 3 | 流れを見る |
| `celtic-cross` | ケルト十字 | 10 | 詳細な状況分析 |

ケルト十字の10ポジション（例）：

1. 現状
2. 障害／助けになるもの
3. 顕在意識（目標）
4. 潜在意識（基盤）
5. 過去
6. 近い未来
7. 自分自身
8. 周囲の環境
9. 希望と恐れ
10. 最終結果

---

## 4. 占い結果（`Reading`）

1回の占いセッションの結果。`localStorage` に保存する単位。

```ts
export interface Reading {
  /** UUID（crypto.randomUUID()） */
  id: string;
  /** ISO 8601 文字列 */
  createdAt: string;
  question: string;
  spreadId: SpreadId;
  drawnCards: DrawnCard[];
  /** Claude から返ってきた鑑定文（全体） */
  interpretation: string;
  /** 任意：位置ごとの鑑定文 */
  perCard?: string[];
  /** シャッフルseed（再現可能にするため） */
  seed?: string;
}
```

### localStorage スキーマ

```
key:   "arcana:history:v1"
value: JSON.stringify(Reading[])  // 最新が末尾。上限100件で切り詰め。
```

バージョン番号 `v1` を末尾に付け、将来のマイグレーションに備える。

---

## 5. APIインターフェース（`/api/reading`）

M3で実装。型は `types/tarot.ts` から共有。

```ts
// POST /api/reading
export interface ReadingRequest {
  question: string;
  spreadId: SpreadId;
  drawnCards: DrawnCard[];
}

export interface ReadingResponse {
  interpretation: string;
  perCard?: string[];
}
```

---

## 6. サンプルカード（M2でフルセット化）

参考として大アルカナ2枚と小アルカナ2枚のサンプルを示す。`data/deck.ts` ではこの形で全78枚を定義する。

```ts
// 大アルカナ
{
  id: 'major-00',
  name: '愚者',
  nameEn: 'The Fool',
  arcana: 'major',
  number: 0,
  keywords: {
    upright: ['新しい始まり', '自由', '無邪気', '冒険'],
    reversed: ['無謀', '不注意', '優柔不断'],
  },
  imagePath: '/cards/major-00.jpg',
}

{
  id: 'major-01',
  name: '魔術師',
  nameEn: 'The Magician',
  arcana: 'major',
  number: 1,
  keywords: {
    upright: ['創造', '意志', 'スキル', '集中'],
    reversed: ['才能の浪費', '欺瞞', '迷い'],
  },
  imagePath: '/cards/major-01.jpg',
}

// 小アルカナ（ピップ）
{
  id: 'wands-01',
  name: 'ワンドのエース',
  nameEn: 'Ace of Wands',
  arcana: 'minor',
  suit: 'wands',
  number: 1,
  keywords: {
    upright: ['情熱', '新しいエネルギー', 'インスピレーション'],
    reversed: ['遅延', '意欲低下', '方向性の喪失'],
  },
  imagePath: '/cards/wands-01.jpg',
}

// 小アルカナ（コート）
{
  id: 'cups-queen',
  name: 'カップのクイーン',
  nameEn: 'Queen of Cups',
  arcana: 'minor',
  suit: 'cups',
  number: 13,
  keywords: {
    upright: ['共感', '直感', '優しさ', '感受性'],
    reversed: ['依存', '情緒不安定', '過剰な感情移入'],
  },
  imagePath: '/cards/cups-queen.jpg',
}
```

### サンプル `Reading`

```ts
{
  id: '3f1c2a8e-...',
  createdAt: '2026-05-28T09:30:00.000Z',
  question: '今週の仕事のテーマは？',
  spreadId: 'three-card',
  drawnCards: [
    { cardId: 'major-00', orientation: 'upright', position: 0 },
    { cardId: 'wands-01', orientation: 'reversed', position: 1 },
    { cardId: 'cups-queen', orientation: 'upright', position: 2 },
  ],
  interpretation: '過去は新しい挑戦への一歩…（Claude生成）',
  seed: '2026-05-28-週仕事',
}
```

