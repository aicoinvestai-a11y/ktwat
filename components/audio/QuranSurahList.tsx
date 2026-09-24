'use client';

import { useState } from 'react';
import { QuranPlayer, type QuranSurahData } from '@/components/audio/QuranPlayer';

export function QuranSurahList({ surahs }: { surahs: QuranSurahData[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {surahs.map((s) => (
          <li key={s.number}>
            <button
              type="button"
              onClick={() => setOpen(open === s.number ? null : s.number)}
              aria-expanded={open === s.number}
              className="flex w-full flex-col items-center gap-3 rounded-xl2 border border-paper-line bg-paper-card p-5 text-center shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
            >
              <span
                aria-hidden
                className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 font-display text-child-base font-bold text-sky-800"
              >
                {s.number}
              </span>
              <span className="font-display text-child-lg font-bold text-ink">{s.name}</span>
              <span className="text-sm text-ink-mute">{s.ayahs.length} آيات</span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <QuranPlayer
          key={open}
          surah={surahs.find((s) => s.number === open) as QuranSurahData}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
