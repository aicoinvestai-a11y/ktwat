'use client';

import React, { useState } from 'react';
import type { BuildSentenceActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { Feedback, GameTitle, shuffle } from './parts';

/** بناء الجملة: اضغط الكلمات بالترتيب */
export function BuildSentenceGame({ activity }: { activity: BuildSentenceActivity }) {
  const [words] = useState(() => shuffle([...activity.answer, ...(activity.distractors ?? [])], 37));
  const [built, setBuilt] = useState<number[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const target = activity.answer[built.length];
  const done = built.length === activity.answer.length;

  const press = (word: string, index: number) => {
    if (done || built.includes(index)) return;
    if (word === target) {
      const next = [...built, index];
      setBuilt(next);
      audioService.speak(word);
      if (next.length === activity.answer.length) {
        audioService.chime('success');
        audioService.speak(activity.resultAudio ?? activity.answer.join(' '));
      }
    } else {
      setWrongCount((w) => w + 1);
      audioService.encourage();
    }
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />
      <div className="flex min-h-[5rem] flex-wrap items-center justify-center gap-2 rounded-xl2 border border-dashed border-paper-line bg-paper-card p-4">
        {built.length === 0 ? (
          <span className="text-child-sm text-ink-mute">اضغط الكلمات بالترتيب لتكوين الجملة</span>
        ) : (
          built.map((i) => (
            <span key={i} className="rounded-xl2 bg-mint-100 px-4 py-2 text-child-base font-bold text-mint-700">
              {words[i]}
            </span>
          ))
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {words.map((w, i) => (
          <button
            key={`${w}-${i}`}
            type="button"
            onClick={() => press(w, i)}
            disabled={built.includes(i) || done}
            className={`min-h-touch rounded-xl2 border border-paper-line px-5 text-child-base font-semibold shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
              built.includes(i) ? 'bg-paper opacity-50' : 'bg-paper-card hover:bg-sky-50'
            }`}
          >
            {w}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => audioService.speak(activity.answer.join(' '))}
          className="min-h-touch rounded-xl2 bg-sky-100 px-5 text-child-base font-semibold text-sky-800 hover:bg-sky-200"
        >
          🔊 استمع إلى الجملة كاملة
        </button>
      </div>
      {done ? <Feedback kind="correct" message={`أحسنت! الجملة: ${activity.answer.join(' ')}`} /> : wrongCount > 0 ? <Feedback kind="retry" message="حاول مرة أخرى 💛" /> : null}
    </section>
  );
}
