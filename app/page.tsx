import Link from 'next/link';
import { DailyCard } from '@/components/DailyCard';
import { getCardById } from '@/data/deck';
import { getDailyCard } from '@/lib/deck';

// 今日の1枚は日付シードで決まるので、その日のうちはサーバーで毎リクエスト同じ結果。
// next: 60秒キャッシュ程度で十分（日付が変わるまで同じ）。
export const revalidate = 60;

export default function HomePage() {
  const drawn = getDailyCard();
  const card = getCardById(drawn.cardId);

  return (
    <div className="space-y-12">
      <section className="space-y-4 text-center">
        <p className="text-sm tracking-[0.3em] text-arcana-accent">ARCANA</p>
        <h1 className="font-serif text-4xl text-balance sm:text-5xl">
          78枚のカードが、
          <br />
          あなたの問いに答える。
        </h1>
        <p className="mx-auto max-w-md text-arcana-muted text-balance">
          質問を心に思い浮かべて、カードを引いてみましょう。Claudeがあなたのために鑑定文を綴ります。
        </p>
      </section>

      <section className="flex flex-col items-center gap-4">
        <Link
          href="/reading"
          className="rounded-full border border-arcana-accent/60 bg-arcana-accent/10 px-8 py-3 font-serif text-lg text-arcana-accent transition hover:bg-arcana-accent/20"
        >
          占いを始める
        </Link>
        <Link href="/history" className="text-sm text-arcana-muted hover:text-arcana-text">
          過去の占いを見る →
        </Link>
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
    </div>
  );
}
