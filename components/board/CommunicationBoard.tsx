'use client';

import { useMemo, useState } from 'react';
import { BOARD_GROUPS, type BoardCard } from '@/data/board';
import { VisualBox } from '@/components/games/parts';
import { audioService } from '@/lib/audio/service';

const RING: Record<string, string> = {
  sky: 'bg-sky-50 border-sky-200',
  mint: 'bg-mint-50 border-mint-200',
  sun: 'bg-sun-50 border-sun-200',
  grape: 'bg-grape-50 border-grape-200',
  peach: 'bg-peach-50 border-peach-200',
};

/**
 * لوحة التواصل بالصور — تعليمية للتدريب على التعبير عن الاحتياجات.
 * ليست بديلاً عن أدوات التواصل المعزّز والبديل (AAC) السريرية.
 * كل بطاقة تُنطق عند الضغط (بلا تشغيل تلقائي)، والطباعة متاحة للاستخدام الورقي.
 */
export function CommunicationBoard() {
  const [active, setActive] = useState<string>(BOARD_GROUPS[0].id);
  const [shown, setShown] = useState<BoardCard | null>(null);

  const group = useMemo(() => BOARD_GROUPS.find((g) => g.id === active) ?? BOARD_GROUPS[0], [active]);

  const speak = (card: BoardCard) => {
    setShown(card);
    audioService.speak(card.say);
  };

  return (
    <div className="space-y-6">
      {/* اختيار المجموعة */}
      <nav aria-label="مجموعات اللوحة" className="flex flex-wrap gap-2">
        {BOARD_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActive(g.id)}
            aria-current={active === g.id ? 'true' : undefined}
            className={`min-h-touch rounded-xl2 px-4 text-child-sm font-bold shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
              active === g.id ? 'bg-sky-100 text-sky-800 ring-4 ring-sky-200' : 'bg-paper-card text-ink hover:bg-sky-50'
            }`}
          >
            {g.title}
          </button>
        ))}
      </nav>

      <section aria-live="polite" aria-label="البطاقة المختارة" className="rounded-xl2 bg-paper-card p-5 text-center shadow-soft">
        {shown ? (
          <p className="text-child-lg font-bold text-ink">«{shown.say}»</p>
        ) : (
          <p className="text-child-base text-ink-soft">
            اضغط أي بطاقة لتسمع العبارة. يمكنك التكرار بلا حد — وبلا صوت تلقائي.
          </p>
        )}
      </section>

      {/* بطاقات المجموعة */}
      <section aria-label={group.title} className="space-y-4">
        <p className="text-child-sm font-semibold text-ink-soft">
          {group.hint} — {group.cards.length} بطاقة
        </p>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {group.cards.map((card) => (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => speak(card)}
                className={`flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl2 border p-4 text-center shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${RING[group.color]}`}
              >
                <VisualBox visual={card.icon} size="md" mode="art" />
                <span className="text-child-base font-bold text-ink">{card.label}</span>
                <span className="text-sm font-semibold text-ink-mute">🔊 اسمع</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* كل البطاقات للطباعة */}
      <details className="rounded-xl2 bg-paper-card p-5 shadow-soft print:shadow-none">
        <summary className="cursor-pointer text-child-base font-bold text-ink">
          🖨️ كل البطاقات في صفحة واحدة (للطباعة والقص)
        </summary>
        <div className="mt-4 space-y-6">
          {BOARD_GROUPS.map((g) => (
            <div key={g.id}>
              <h2 className="font-display text-child-base font-bold text-ink">{g.title}</h2>
              <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {g.cards.map((card) => (
                  <li
                    key={card.id}
                    className="flex flex-col items-center gap-1 rounded-xl2 border border-paper-line p-3 text-center"
                  >
                    <VisualBox visual={card.icon} size="sm" mode="art" />
                    <span className="text-child-sm font-semibold text-ink">{card.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-5 min-h-touch rounded-xl2 bg-sky-100 px-6 text-child-base font-bold text-sky-800 shadow-soft print:hidden"
        >
          🖨️ اطبع البطاقات
        </button>
      </details>
    </div>
  );
}
