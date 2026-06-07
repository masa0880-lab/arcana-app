import Link from 'next/link';
import { DailyCard } from '@/components/DailyCard';
import { getCardById } from '@/data/deck';
import { getDailyCard } from '@/lib/deck';

// 今日の1枚は日付シードで決まるので、その日のうちはサーバーで毎リクエスト同じ結果。
// next: 60秒キャッシュ程度で十分（日付が変わるまで同じ）。
export const revalidate = 60;

const DIVINATIONS = [
  {
    href: '/reading',
    title: 'タロット占い',
    description: '78枚のカードで、質問への核心を読み解く',
    accent: 'TAROT',
  },
  {
    href: '/zodiac',
    title: '星座占い',
    description: '生年月日から、今日一日の運勢を星に問う',
    accent: 'ZODIAC',
  },
  {
    href: '/animal',
    title: '動物占い',
    description: '生年月日から、内なる動物キャラクターを知る',
    accent: 'ANIMAL',
  },
  {
    href: '/numerology',
    title: '数秘術',
    description: '生年月日から、人生のテーマと特性を導く',
    accent: 'NUMEROLOGY',
  },
  {
    href: '/palm',
    title: '手相占い',
    description: '手のひらの写真から、Claudeが線を読み解く',
    accent: 'PALM',
  },
];

export default function HomePage() {
  const drawn = getDailyCard();
  const card = getCardById(drawn.cardId);

  return (
    <div className="space-y-12">
      <section className="space-y-4 text-center">
        <p className="text-sm tracking-[0.3em] text-arcana-accent">ARCANA</p>
        <h1 className="font-serif text-4xl text-balance sm:text-5xl">
          静かに問えば、
          <br />
          答えは現れる。
        </h1>
        <p className="mx-auto max-w-md text-arcana-muted text-balance">
          タロット、星座、動物、数秘術、手相 — 5つの方法であなたの問いを照らします。Claudeがあなたのために鑑定文を綴ります。
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {DIVINATIONS.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="group flex flex-col gap-1 rounded-2xl border border-white/5 bg-arcana-surface/50 p-5 transition hover:border-arcana-accent/40 hover:bg-arcana-surface/70"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-arcana-accent">
              {d.accent}
            </p>
            <p className="font-serif text-lg text-arcana-text">{d.title}</p>
            <p className="text-xs text-arcana-muted">{d.description}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-white/5 bg-arcana-surface/60 p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-arcana-accent">今日の1枚</h2>
          <span className="text-xs text-arcana-muted">日付ごとに固定</span>
        </div>
        {card ? (
          <DailyCard card={card} drawn={drawn} />
        ) : (
          <p className="text-sm text-arcana-muted">カードを読み込めませんでした。</p>
        )}
      </section>

      <p className="text-center text-xs text-arcana-muted">
        <Link href="/history" className="hover:text-arcana-text">
          過去の鑑定を見る →
        </Link>
      </p>
    </div>
  );
}
