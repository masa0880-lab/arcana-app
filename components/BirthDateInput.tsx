'use client';

import type { BirthDate } from '@/types/divination';

interface Props {
  value: Partial<BirthDate>;
  onChange: (v: Partial<BirthDate>) => void;
  disabled?: boolean;
}

const currentYear = new Date().getFullYear();

export function BirthDateInput({ value, onChange, disabled }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label htmlFor="bdate-year" className="mb-1 block text-xs text-arcana-muted">
          年
        </label>
        <input
          id="bdate-year"
          type="number"
          inputMode="numeric"
          min={1900}
          max={currentYear}
          value={value.year ?? ''}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...value, year: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="1990"
          className="w-full rounded-lg border border-white/10 bg-arcana-surface/60 px-3 py-2 text-arcana-text outline-none placeholder:text-arcana-muted/60 focus:border-arcana-accent/60 disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor="bdate-month" className="mb-1 block text-xs text-arcana-muted">
          月
        </label>
        <input
          id="bdate-month"
          type="number"
          inputMode="numeric"
          min={1}
          max={12}
          value={value.month ?? ''}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...value, month: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="5"
          className="w-full rounded-lg border border-white/10 bg-arcana-surface/60 px-3 py-2 text-arcana-text outline-none placeholder:text-arcana-muted/60 focus:border-arcana-accent/60 disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor="bdate-day" className="mb-1 block text-xs text-arcana-muted">
          日
        </label>
        <input
          id="bdate-day"
          type="number"
          inputMode="numeric"
          min={1}
          max={31}
          value={value.day ?? ''}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...value, day: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="15"
          className="w-full rounded-lg border border-white/10 bg-arcana-surface/60 px-3 py-2 text-arcana-text outline-none placeholder:text-arcana-muted/60 focus:border-arcana-accent/60 disabled:opacity-50"
        />
      </div>
    </div>
  );
}

export function isCompleteBirthDate(v: Partial<BirthDate>): v is BirthDate {
  return (
    typeof v.year === 'number' &&
    typeof v.month === 'number' &&
    typeof v.day === 'number' &&
    Number.isFinite(v.year) &&
    Number.isFinite(v.month) &&
    Number.isFinite(v.day)
  );
}
