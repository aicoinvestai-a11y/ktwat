'use client';

import React, { useState } from 'react';
import type { AudioChoiceActivity, ExploreActivity, PictureChoiceActivity, TrueFalseActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { AudioButton, ChoiceCard, Feedback, GameTitle, VisualBox, shuffle } from './parts';

/** استكشاف: كل عنصر قابل للضغط — تكبير بسيط + صوت */
export function ExploreGame({ activity }: { activity: ExploreActivity }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = activity.items.find((i) => i.id === activeId);

  const press = (id: string, audio: string) => {
    setActiveId(id);
    audioService.speak(audio);
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {activity.items.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => press(item.id, item.audio)}
              aria-label={`${item.label} — اضغط لتسمع الاسم`}
              className={`flex w-full flex-col items-center gap-2 rounded-xl2 border border-paper-line bg-paper-card p-4 shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
                activeId === item.id ? 'scale-[1.04] ring-4 ring-sky-300' : 'hover:bg-sky-50'
              }`}
            >
              <VisualBox visual={item.visual} size="lg" />
              <span className="text-child-base font-semibold text-ink">{item.label}</span>
            </button>
            <AudioButton text={item.audio} label={item.label} />
          </div>
        ))}
      </div>
      {active && (
        <Feedback kind="info" message={`${active.label} 🔊 — يمكنك تكرار الاستماع بلا حد`} />
      )}
      {activity.hint && <p className="text-center text-child-sm text-ink-mute">{activity.hint}</p>}
    </section>
  );
}

/** اختيار الصورة: عند الخطأ «حاول مرة أخرى» ثم تلميح بصري هادئ */
export function PictureChoiceGame({ activity }: { activity: PictureChoiceActivity }) {
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [options] = useState(() => shuffle(activity.options, 7));

  const onSelect = (id: string) => {
    if (solved) return;
    if (id === activity.answerId) {
      setSolved(true);
      audioService.chime('success');
      audioService.praise();
      return;
    }
    setAttempts((a) => a + 1);
    setWrongIds((w) => [...w, id]);
    audioService.encourage();
  };

  const showHint = attempts >= 2;

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.prompt} />
      <div className="flex justify-center">
        <AudioButton text={activity.prompt} label="السؤال" className="text-3xl" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {options.map((o) => (
          <ChoiceCard
            key={o.id}
            visual={o.visual}
            label={o.label}
            onSelect={() => onSelect(o.id)}
            state={solved && o.id === activity.answerId ? 'correct' : showHint && o.id === activity.answerId ? 'hint' : wrongIds.includes(o.id) ? 'dim' : 'idle'}
            disabled={solved}
          />
        ))}
      </div>
      {solved ? (
        <Feedback kind="correct" message={`أحسنت، هذا ${activity.options.find((o) => o.id === activity.answerId)?.label}`} />
      ) : attempts > 0 ? (
        <Feedback kind="retry" message="حاول مرة أخرى 💛" />
      ) : null}
    </section>
  );
}

/** اختيار بالصوت: صوت حقيقي من المكتبة ثم سؤال «ماذا سمعت؟» */
export function AudioChoiceGame({ activity }: { activity: AudioChoiceActivity }) {
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [options] = useState(() => shuffle(activity.options, 11));

  const onSelect = (id: string) => {
    if (solved) return;
    if (id === activity.answerId) {
      setSolved(true);
      audioService.chime('success');
      audioService.praise();
      return;
    }
    setAttempts((a) => a + 1);
    setWrongIds((w) => [...w, id]);
    audioService.encourage();
  };

  const showHint = attempts >= 2;

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.prompt} />
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => audioService.playEnv(activity.soundKey)}
          className="flex min-h-[4.5rem] items-center gap-3 rounded-xl2 bg-grape-100 px-6 text-child-base font-bold text-grape-700 shadow-soft transition hover:bg-grape-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-grape-400"
          aria-label={`استمع إلى ${activity.soundLabel}`}
        >
          <span aria-hidden className="text-3xl">🔊</span>
          <span>استمع مرة أخرى</span>
        </button>
        <p className="text-child-sm text-ink-mute">اضغط ثم اختر الإجابة — يمكنك الاستماع بلا حد</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {options.map((o) => (
          <ChoiceCard
            key={o.id}
            visual={o.visual}
            label={o.label}
            onSelect={() => onSelect(o.id)}
            state={solved && o.id === activity.answerId ? 'correct' : showHint && o.id === activity.answerId ? 'hint' : wrongIds.includes(o.id) ? 'dim' : 'idle'}
            disabled={solved}
          />
        ))}
      </div>
      {solved ? <Feedback kind="correct" message={`أحسنت، سمعنا ${activity.soundLabel}`} /> : attempts > 0 ? <Feedback kind="retry" message="حاول مرة أخرى 💛" /> : null}
    </section>
  );
}

/** صح أم خطأ — بلا جرس خطأ ولا علامات حمراء */
export function TrueFalseGame({ activity }: { activity: TrueFalseActivity }) {
  const [answer, setAnswer] = useState<boolean | null>(null);
  const correct = answer !== null && answer === activity.isTrue;

  const pick = (v: boolean) => {
    setAnswer(v);
    if (v === activity.isTrue) {
      audioService.chime('success');
      audioService.praise();
    } else {
      audioService.encourage();
    }
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />
      <div className="flex flex-col items-center gap-4 rounded-xl2 bg-paper-card p-5 shadow-soft">
        {activity.visual && <VisualBox visual={activity.visual} size="lg" />}
        <p className="text-center text-child-base font-semibold text-ink">{activity.statement}</p>
        <AudioButton text={activity.statement} label="الجملة" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => pick(true)}
          className={`min-h-[5rem] rounded-xl2 border border-paper-line text-child-lg font-bold shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${answer === true ? 'bg-mint-100 ring-4 ring-mint-300' : 'bg-paper-card hover:bg-mint-50'}`}
        >
          <span aria-hidden>👍 </span>صحيح
        </button>
        <button
          type="button"
          onClick={() => pick(false)}
          className={`min-h-[5rem] rounded-xl2 border border-paper-line text-child-lg font-bold shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${answer === false ? 'bg-sun-100 ring-4 ring-sun-300' : 'bg-paper-card hover:bg-sun-50'}`}
        >
          <span aria-hidden>✋ </span>غير صحيح
        </button>
      </div>
      {answer !== null &&
        (correct ? (
          <Feedback kind="correct" message="أحسنت! " />
        ) : (
          <Feedback kind="retry" message="حاول مرة أخرى 💛" />
        ))}
      {answer !== null && <Feedback kind="info" message={activity.explain} />}
    </section>
  );
}
