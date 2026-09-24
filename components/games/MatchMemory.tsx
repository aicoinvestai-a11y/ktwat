'use client';

import React, { useState } from 'react';
import type { MatchingActivity, MemoryActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { Feedback, GameTitle, VisualBox, shuffle } from './parts';

/** المطابقة: اضغط عنصراً من اليمين ثم نظيره من اليسار */
export function MatchingGame({ activity }: { activity: MatchingActivity }) {
  const [rightOrder] = useState(() => shuffle(activity.pairs.map((p) => p.right), 13));
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const done = matched.length === activity.pairs.length;

  const selectLeft = (id: string, label: string) => {
    setSelected(id);
    setWrong(null);
    audioService.speak(label);
  };

  const selectRight = (id: string, label: string) => {
    if (!selected) {
      audioService.speak(label);
      return;
    }
    const pair = activity.pairs.find((p) => p.left.id === selected);
    if (pair && pair.right.id === id) {
      const next = [...matched, selected];
      setMatched(next);
      setSelected(null);
      audioService.chime('success');
      if (next.length === activity.pairs.length) audioService.praise();
    } else {
      setWrong(id);
      audioService.encourage();
      setSelected(null);
    }
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          {activity.pairs.map((p) => {
            const isMatched = matched.includes(p.left.id);
            return (
              <button
                key={p.left.id}
                type="button"
                onClick={() => !isMatched && selectLeft(p.left.id, p.left.label)}
                disabled={isMatched}
                className={`flex w-full items-center justify-center gap-2 rounded-xl2 border border-paper-line p-3 text-child-sm font-semibold shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
                  isMatched ? 'bg-mint-50 opacity-70' : selected === p.left.id ? 'bg-sky-100 ring-4 ring-sky-300' : 'bg-paper-card hover:bg-sky-50'
                }`}
              >
                <VisualBox visual={p.left.visual} size="sm" />
                <span>{p.left.label}</span>
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {rightOrder.map((r) => {
            const isMatched = activity.pairs.some((p) => p.right.id === r.id && matched.includes(p.left.id));
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => !isMatched && selectRight(r.id, r.label)}
                disabled={isMatched}
                className={`flex w-full items-center justify-center gap-2 rounded-xl2 border border-paper-line p-3 text-child-sm font-semibold shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
                  isMatched ? 'bg-mint-50 opacity-70' : wrong === r.id ? 'bg-sun-50 ring-4 ring-sun-200' : 'bg-paper-card hover:bg-mint-50'
                }`}
              >
                <VisualBox visual={r.visual} size="sm" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {done ? <Feedback kind="correct" message="أحسنت! طابقت كل العناصر" /> : selected ? <Feedback kind="info" message="اختر الآن ما يناسبه من الجهة الأخرى" /> : null}
      {wrong && <Feedback kind="retry" message="حاول مرة أخرى 💛" />}
    </section>
  );
}

/** لعبة الذاكرة: بطاقات مقلوبة */
export function MemoryGame({ activity }: { activity: MemoryActivity }) {
  const [cards] = useState(() => {
    const base = activity.items.slice(0, 6);
    const doubled = [...base, ...base].map((item, i) => ({ ...item, cardId: `${item.id}-${i}` }));
    return shuffle(doubled, 17);
  });
  const [open, setOpen] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const finished = done.length === cards.length / 2;

  const flip = (cardId: string, itemId: string, label: string) => {
    if (open.includes(cardId) || done.includes(itemId) || open.length === 2) return;
    const nextOpen = [...open, cardId];
    setOpen(nextOpen);
    audioService.speak(label);
    if (nextOpen.length === 2) {
      const [a, b] = nextOpen;
      const aItem = cards.find((c) => c.cardId === a);
      const bItem = cards.find((c) => c.cardId === b);
      if (aItem && bItem && aItem.id === bItem.id) {
        setDone((d) => [...d, aItem.id]);
        setOpen([]);
        audioService.chime('success');
      } else {
        setTimeout(() => {
          setOpen([]);
          audioService.encourage();
        }, 900);
      }
    }
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {cards.map((c) => {
          const isOpen = open.includes(c.cardId) || done.includes(c.id);
          return (
            <button
              key={c.cardId}
              type="button"
              onClick={() => flip(c.cardId, c.id, c.label)}
              aria-label={isOpen ? c.label : 'بطاقة مقلوبة'}
              className={`flex min-h-[6.5rem] flex-col items-center justify-center gap-1 rounded-xl2 border border-paper-line text-4xl shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
                isOpen ? 'bg-mint-50' : 'bg-sky-100 hover:bg-sky-200'
              }`}
            >
              {isOpen ? (
                <>
                  <VisualBox visual={c.visual} size="md" />
                  <span className="text-sm font-semibold text-ink">{c.label}</span>
                </>
              ) : (
                <span aria-hidden>❔</span>
              )}
            </button>
          );
        })}
      </div>
      {finished ? <Feedback kind="correct" message="رائع! وجدت كل الأزواج" /> : <Feedback kind="info" message="اقلب بطاقتين وابحث عن المتشابهتين" />}
    </section>
  );
}
