import Link from 'next/link';

export default function HomePage() {
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
        <h2 className="font-serif text-xl text-arcana-accent">今日の1枚</h2>
        <p className="mt-2 text-sm text-arcana-muted">
          ※ M2 で実装予定。日付シードで1日固定のカードがここに表示されます。
        </p>
      </section>
    </div>
  );
}
