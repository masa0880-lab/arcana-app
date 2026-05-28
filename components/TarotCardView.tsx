'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Card, Orientation } from '@/types/tarot';

type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, { w: number; h: number; img: string }> = {
  sm: { w: 70, h: 120, img: '70px' },
  md: { w: 110, h: 188, img: '110px' },
  lg: { w: 160, h: 274, img: '160px' },
};

interface Props {
  card: Card;
  orientation: Orientation;
  revealed: boolean;
  size?: Size;
}

export function TarotCardView({ card, orientation, revealed, size = 'md' }: Props) {
  const { w, h, img } = sizes[size];
  const isReversed = orientation === 'reversed';

  return (
    <div
      className="relative"
      style={{ width: w, height: h, perspective: 1000 }}
      aria-label={`${card.name}（${isReversed ? '逆位置' : '正位置'}）`}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: revealed ? 0 : 180 }}
        initial={{ rotateY: 180 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* 表面 */}
        <div
          className={`absolute inset-0 overflow-hidden rounded-lg border border-arcana-accent/30 shadow-[0_0_25px_-10px_rgba(200,169,106,0.5)] ${
            isReversed ? 'rotate-180' : ''
          }`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <Image
            src={card.imagePath}
            alt={card.name}
            fill
            sizes={img}
            className="object-cover"
          />
        </div>
        {/* 裏面 */}
        <div
          className="absolute inset-0 rounded-lg border border-arcana-accent/40 bg-arcana-surface"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundImage:
              'radial-gradient(circle at center, rgba(200,169,106,0.15) 0%, transparent 60%)',
          }}
        >
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-3xl text-arcana-accent/80">✦</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
