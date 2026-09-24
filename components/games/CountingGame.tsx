'use client';

import React, { useState } from 'react';
import type { CountingActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { Feedback, GameTitle, VisualBox } from './parts';

/** العدّ والحساب: مجموعات مرئية + خيارات كبيرة */
export function CountingGame({ activity }: { activity: CountingActivity }) {
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongChoices, setWrongChoices] = useState<number[]>([]);
  const expr = activity.expression;
  const displayCount = expr ? (expr.op === '+' ? expr.left + expr.right : expr.left) : activity.count;
  const showDigits = activity.digitsOnly || displayCount > 12;

  const group = (n: number, keyPrefix: string, strike = false) =>
    Array.from({ length: n }).map((_, i) => (
      <span key={`${keyPrefix}-${i}`} className={`text-4xl ${strike ? 'opacity-30' : ''}`} aria-hidden>
        {activity.unit.visual.value}
      </span>
    ));

  const pick = (choice: number) => {
    if (solved) return;
    if (choice === activity.count) {
      setSolved(true);
      audioService.chime('success');
      audioService.speak(`${choice}`);
      audioService.praise();
      return;
    }
    setAttempts((a) => a + 1);
    setWrongChoices((w) => [...w, choice]);
    audioService.encourage();
  };

  const showHint = attempts >= 2;

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.prompt} />
      <div className="flex flex-col items-center gap-3 rounded-xl2 bg-paper-card p-5 shadow-soft">
        {expr && showDigits ? (
          <p className="font-display text-child-xl font-bold text-ink" dir="ltr">
            {expr.left} {expr.op} {expr.right} = ؟
          </p>
        ) : expr ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex flex-wrap gap-1 rounded-xl2 bg-sky-50 p-3">{group(expr.left, 'l')}</div>
            <span className="text-child-xl font-bold text-ink" aria-hidden>
              {expr.op === '+' ? '+' : '−'}
            </span>
            <div className="flex flex-wrap gap-1 rounded-xl2 bg-mint-50 p-3">
              {expr.op === '-' ? group(expr.right, 'r', true) : group(expr.right, 'r')}
            </div>
            <span className="text-child-xl font-bold text-ink" aria-hidden>=</span>
            <span className="text-child-xl font-bold text-ink">؟</span>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-1 rounded-xl2 bg-sky-50 p-4">{group(activity.count, 'c')}</div>
        )}
        <p className="text-child-sm text-ink-mute">
          {activity.unit.label} — اضغط 🔊 لتسمع السؤال
        </p>
        <button
          type="button"
          onClick={() => audioService.speak(activity.prompt)}
          className="min-h-touch rounded-xl2 bg-sky-100 px-5 text-child-base font-semibold text-sky-800 transition hover:bg-sky-200"
        >
          🔊 استمع
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {activity.choices.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => pick(c)}
            disabled={solved}
            className={`flex h-24 w-24 items-center justify-center rounded-xl2 border border-paper-line font-display text-child-xl font-bold shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
              solved && c === activity.count
                ? 'bg-mint-100 ring-4 ring-mint-400'
                : showHint && c === activity.count
                  ? 'bg-sun-50 ring-4 ring-sun-300'
                  : wrongChoices.includes(c)
                    ? 'bg-paper opacity-60'
                    : 'bg-paper-card hover:bg-sky-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {solved ? <Feedback kind="correct" message={`أحسنت! الجواب ${activity.count}`} /> : attempts > 0 ? <Feedback kind="retry" message="حاول مرة أخرى 💛" /> : null}
      <div className="flex justify-center gap-3">
        <VisualBox visual={activity.unit.visual} size="sm" />
        <span className="self-center text-child-sm text-ink-mute">{activity.unit.label}</span>
      </div>
    </section>
  );
}
