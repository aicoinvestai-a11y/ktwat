'use client';

import React, { useState } from 'react';
import type { StoryActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { AudioButton, Feedback, GameTitle, VisualBox } from './parts';

/** قصة مصوّرة/اجتماعية: مشهد ← سؤال ← خيارات ← مشهد توضيحي */
export function StoryGame({ activity }: { activity: StoryActivity }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [chosen, setChosen] = useState<{ label: string; correct: boolean; feedback: string } | null>(null);
  const scene = activity.scenes[sceneIndex];
  const isLast = sceneIndex === activity.scenes.length - 1;

  const choose = (option: { label: string; correct: boolean; feedback: string }) => {
    setChosen(option);
    if (option.correct) {
      audioService.chime('success');
      audioService.praise();
    } else {
      audioService.encourage();
    }
  };

  const next = () => {
    setChosen(null);
    if (!isLast) setSceneIndex((i) => i + 1);
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />
      <div className="flex flex-col items-center gap-4 rounded-xl2 bg-paper-card p-6 shadow-soft">
        <VisualBox visual={scene.visual} size="lg" />
        <p className="text-center text-child-base font-semibold text-ink">{scene.text}</p>
        <AudioButton text={scene.audio ?? scene.text} label="نص المشهد" />
      </div>

      {scene.question && !chosen && (
        <div className="space-y-3">
          <p className="text-center text-child-base font-bold text-ink">{scene.question}</p>
          <div className="flex justify-center">
            <AudioButton text={scene.question} label="السؤال" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {scene.options?.map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => choose(o)}
                className="flex min-h-[7rem] flex-col items-center justify-center gap-2 rounded-xl2 border border-paper-line bg-paper-card p-3 shadow-soft transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
              >
                <VisualBox visual={o.visual} size="md" />
                <span className="text-child-sm font-semibold text-ink">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {chosen && (
        <div className="space-y-4">
          <Feedback kind={chosen.correct ? 'correct' : 'retry'} message={chosen.feedback} />
          <div className="flex justify-center gap-3">
            {!chosen.correct && (
              <button
                type="button"
                onClick={() => setChosen(null)}
                className="min-h-touch rounded-xl2 bg-sun-100 px-5 text-child-base font-semibold text-sun-700 hover:bg-sun-200"
              >
                🔁 حاول مرة أخرى
              </button>
            )}
            {chosen.correct && !isLast && (
              <button
                type="button"
                onClick={next}
                className="min-h-touch rounded-xl2 bg-mint-100 px-6 text-child-base font-bold text-mint-700 hover:bg-mint-200"
              >
                ➡️ المشهد التالي
              </button>
            )}
            {chosen.correct && isLast && (
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSceneIndex(0);
                    setChosen(null);
                  }}
                  className="min-h-touch rounded-xl2 bg-sky-100 px-5 text-child-base font-semibold text-sky-800 hover:bg-sky-200"
                >
                  🔁 مرة أخرى
                </button>
                <a
                  href="#more"
                  className="min-h-touch rounded-xl2 bg-grape-100 px-5 text-child-base font-semibold text-grape-700 hover:bg-grape-200"
                >
                  ➡️ مهارة جديدة
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
