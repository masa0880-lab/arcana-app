import Image from 'next/image';
import type { Card, DrawnCard } from '@/types/tarot';

interface Props {
  card: Card;
  drawn: DrawnCard;
}

export function DailyCard({ card, drawn }: Props) {
  const isReversed = drawn.orientation === 'reversed';
  const keywords = isReversed ? card.keywords.reversed : card.keywords.upright;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      <div
        className={`relative h-[240px] w-[140px] flex-shrink-0 overflow-hidden rounded-lg border border-arcana-accent/30 shadow-[0_0_30px_-10px_rgba(200,169,106,0.5)] ${
          isReversed ? 'rotate-180' : ''
        }`}
      >
        <Image
          src={card.imagePath}
          alt={card.name}
          fill
          sizes="140px"
          className="object-cover"
          priority
        />
      </div>
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.25em] text-arcana-muted">
          {isReversed ? '逆位置' : '正位置'}
        </p>
        <h3 className="font-serif text-2xl text-arcana-accent">{card.name}</h3>
        <p className="text-sm text-arcana-muted">{card.nameEn}</p>
        <ul className="flex flex-wrap justify-center gap-2 pt-2 sm:justify-start">
          {keywords.map((k) => (
            <li
              key={k}
              className="rounded-full border border-arcana-accent/30 bg-arcana-accent/5 px-3 py-1 text-xs text-arcana-accentSoft"
            >
              {k}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
