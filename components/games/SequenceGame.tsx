'use client';

import React, { useState } from 'react';
import type { SequenceActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { AudioButton, Feedback, GameTitle, ProgressDots, VisualBox, shuffle } from './parts';

/** ترتيب الخطوات: اضغط بالترتيب الصحيح */
export function SequenceGame({ activity }: { activity: SequenceActivity }) {
  const [order] = useState(() => shuffle(activity.steps, 31));
  const [picked, setPicked] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const expected = activity.steps[picked.length];
  const done = picked.length === activity.steps.length;

  const press = (id: string, label: string) => {
    if (done || picked.includes(id)) return;
    if (expected && id === expected.id) {
      setPicked((p) => [...p, id]);
      setWrong(null);
      audioService.speak(label);
      audioService.chime('success');
      if (picked.length + 1 === activity.steps.length) audioService.praise();
    } else {
      setWrong(id);
      audioService.encourage();
    }
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />
      <div className="flex items-center justify-center gap-3">
        <AudioButton text={activity.audio ?? activity.instruction} label="التعليمة" />
        <ProgressDots total={activity.steps.length} current={picked.length} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {order.map((step) => {
          const index = picked.indexOf(step.id);
          const isPicked = index >= 0;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => press(step.id, step.label)}
              disabled={isPicked || done}
              className={`relative flex min-h-[8rem] flex-col items-center justify-center gap-2 rounded-xl2 border border-paper-line p-3 shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
                isPicked ? 'bg-mint-50' : wrong === step.id ? 'bg-sun-50 ring-4 ring-sun-200' : 'bg-paper-card hover:bg-sky-50'
              }`}
            >
              {isPicked && (
                <span className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-mint-400 text-lg font-bold text-white">
                  {index + 1}
                </span>
              )}
              <VisualBox visual={step.visual} size="md" />
              <span className="text-child-sm font-semibold text-ink">{step.label}</span>
            </button>
          );
        })}
      </div>
      {done ? (
        <Feedback kind="correct" message="أحسنت! رتّبت الخطوات بالترتيب الصحيح" />
      ) : (
        <Feedback kind="info" message={expected ? `التالي: اضغط على الخطوة التي تأتي الآن` : 'ابدأ من الخطوة الأولى'} />
      )}
      {wrong && <Feedback kind="retry" message="حاول مرة أخرى 💛" />}
    </section>
  );
}
