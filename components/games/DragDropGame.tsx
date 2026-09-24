'use client';

import React, { useState } from 'react';
import type { DragDropActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { Feedback, GameTitle, VisualBox, shuffle } from './parts';

/**
 * سحب وإفلات — يعمل باللمس والفأرة ولوحة المفاتيح:
 * يمكن اختيار العنصر بالضغط ثم اختيار الهدف بالضغط (بديل كامل للسحب).
 */
export function DragDropGame({ activity }: { activity: DragDropActivity }) {
  const [items, setItems] = useState(() => shuffle(activity.items, 29));
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState<string | null>(null);
  const remaining = items.filter((i) => !placed[i.id]);
  const done = remaining.length === 0;

  const drop = (targetId: string, label: string) => {
    if (!selected) return;
    const item = items.find((i) => i.id === selected);
    if (!item) return;
    if (item.targetId === targetId) {
      setPlaced((p) => ({ ...p, [item.id]: targetId }));
      setSelected(null);
      setWrong(null);
      audioService.speak(`${item.label} — ${label}`);
      audioService.chime('success');
      if (Object.keys(placed).length + 1 === items.length) audioService.praise();
    } else {
      setWrong(targetId);
      audioService.encourage();
      setSelected(null);
    }
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />
      <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="العناصر">
        {remaining.length === 0 ? (
          <Feedback kind="correct" message="أحسنت! وضعت كل شيء في مكانه" />
        ) : (
          remaining.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => {
                setSelected(i.id);
                audioService.speak(i.label);
              }}
              draggable
              onDragStart={() => setSelected(i.id)}
              aria-pressed={selected === i.id}
              className={`flex min-h-[6rem] w-28 flex-col items-center justify-center gap-1 rounded-xl2 border border-paper-line p-2 shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
                selected === i.id ? 'bg-sky-100 ring-4 ring-sky-300' : 'bg-paper-card hover:bg-sky-50'
              }`}
            >
              <VisualBox visual={i.visual} size="md" />
              <span className="text-sm font-semibold text-ink">{i.label}</span>
            </button>
          ))
        )}
      </div>
      <div className={`grid gap-4 ${activity.targets.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {activity.targets.map((t) => {
          const placedHere = Object.entries(placed).filter(([, v]) => v === t.id);
          return (
            <div
              key={t.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => drop(t.id, t.label)}
              className={`flex min-h-[9rem] flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed p-3 transition ${
                wrong === t.id ? 'border-sun-300 bg-sun-50' : 'border-paper-line bg-paper-card'
              }`}
            >
              <VisualBox visual={t.visual} size="md" />
              <span className="text-child-sm font-bold text-ink">{t.label}</span>
              <button
                type="button"
                onClick={() => drop(t.id, t.label)}
                disabled={!selected}
                className="min-h-touch w-full rounded-xl2 bg-sky-100 text-child-sm font-semibold text-sky-800 transition hover:bg-sky-200 disabled:opacity-50"
              >
                ضع هنا
              </button>
              <div className="flex flex-wrap justify-center gap-1">
                {placedHere.map(([itemId]) => {
                  const item = items.find((i) => i.id === itemId);
                  return item ? (
                    <span key={itemId} className="text-2xl" aria-label={item.label}>
                      {item.visual.value}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          );
        })}
      </div>
      {selected ? <Feedback kind="info" message="اختر المكان المناسب للعنصر المحدد" /> : null}
      {wrong && <Feedback kind="retry" message="حاول مرة أخرى 💛" />}
      {done && <Feedback kind="correct" message="ممتاز! أكملت النشاط" />}
    </section>
  );
}
