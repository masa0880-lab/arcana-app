'use client';

import { getCardById } from '@/data/deck';
import type { DrawnCard, Spread } from '@/types/tarot';
import { TarotCardView } from './TarotCardView';

interface Props {
  spread: Spread;
  drawnCards: DrawnCard[];
  /** 0..cardCount: ここまでのカードが「開かれた」状態として描画される */
  revealedCount: number;
}

export function SpreadLayout({ spread, drawnCards, revealedCount }: Props) {
  if (spread.id === 'single') {
    return <SingleLayout spread={spread} drawnCards={drawnCards} revealedCount={revealedCount} />;
  }
  if (spread.id === 'three-card') {
    return <RowLayout spread={spread} drawnCards={drawnCards} revealedCount={revealedCount} />;
  }
  return <GridLayout spread={spread} drawnCards={drawnCards} revealedCount={revealedCount} />;
}

function SingleLayout({ spread, drawnCards, revealedCount }: Props) {
  const dc = drawnCards[0];
  const card = dc ? getCardById(dc.cardId) : undefined;
  if (!dc || !card) return null;
  const revealed = revealedCount > 0;
  return (
    <div className="flex flex-col items-center gap-3">
      <TarotCardView card={card} orientation={dc.orientation} revealed={revealed} size="lg" />
      {revealed && (
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-arcana-muted">
            {spread.positions[0].label}
          </p>
          <p className="font-serif text-lg text-arcana-accent">{card.name}</p>
          <p className="text-xs text-arcana-muted">
            {dc.orientation === 'upright' ? '正位置' : '逆位置'}
          </p>
        </div>
      )}
    </div>
  );
}

function RowLayout({ spread, drawnCards, revealedCount }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {drawnCards.map((dc, i) => {
        const card = getCardById(dc.cardId);
        if (!card) return null;
        const revealed = revealedCount > i;
        return (
          <div key={i} className="flex flex-col items-center gap-2">
            <TarotCardView card={card} orientation={dc.orientation} revealed={revealed} size="md" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-arcana-muted">
              {spread.positions[i]?.label}
            </p>
            {revealed && (
              <p className="text-center font-serif text-sm text-arcana-accent">{card.name}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GridLayout({ spread, drawnCards, revealedCount }: Props) {
  // ケルト十字（10枚）: モバイル優先で 2×5 グリッドにフォールバック。
  // 本格的な十字レイアウトはM6で。
  return (
    <div className="grid grid-cols-3 justify-items-center gap-3 sm:grid-cols-5">
      {drawnCards.map((dc, i) => {
        const card = getCardById(dc.cardId);
        if (!card) return null;
        const revealed = revealedCount > i;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <TarotCardView card={card} orientation={dc.orientation} revealed={revealed} size="sm" />
            <p className="text-[9px] leading-tight text-arcana-muted text-center">
              {i + 1}. {spread.positions[i]?.label}
            </p>
            {revealed && (
              <p className="text-center text-[10px] font-serif text-arcana-accent leading-tight">
                {card.name}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
