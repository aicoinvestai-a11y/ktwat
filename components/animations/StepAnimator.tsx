'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnimationDef } from '@/data/animations';
import { SCENES } from './scenes';
import { audioService } from '@/lib/audio/service';
import { usePrefs } from '@/lib/prefs';

/**
 * مشغّل الحركة التوضيحية 🎬
 *
 * قواعد ثابتة:
 *  • لا تشغيل تلقائي إطلاقاً — الطفل أو مرافقه يبدأ بـ▶.
 *  • لا اعتماد على الصورة: لكل خطوة جملة مكتوبة تُقرأ وتُسمع (زر 🔊).
 *  • الوضع الهادئ 🌿 (أو «تقليل الحركة» في الجهاز): تتوقف الحركة التلقائية، ويبقى التنقّل بالزر.
 *  • بلا وميض ولا انتقالات سريعة، والانتقال بين الخطوات هادئ.
 */
export function StepAnimator({ animation, className = '' }: { animation: AnimationDef; className?: string }) {
  const steps = animation.steps;
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [withVoice, setWithVoice] = useState(false);
  const timer = useRef<number | null>(null);
  const { audio } = usePrefs();
  const quiet = audio.quiet;

  const current = steps[step - 1];
  const Scene = SCENES[animation.key];

  /** مدة الخطوة: تكفي لقراءة الجملة بهدوء */
  const duration = useCallback(
    (text: string) => Math.min(7000, Math.max(2800, text.length * 95)),
    [],
  );

  const stop = useCallback(() => {
    setPlaying(false);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  // تقدّم تلقائي هادئ: خطوة واحدة كل مرة، ويتوقف عند آخر خطوة
  useEffect(() => {
    if (!playing || quiet) return;
    if (step >= steps.length) {
      setPlaying(false);
      audioService.chime('soft');
      return;
    }
    timer.current = window.setTimeout(() => setStep((s) => Math.min(steps.length, s + 1)), duration(current.caption));
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, step, quiet, steps.length, current.caption, duration]);

  // الوضع الهادئ يوقف الحركة فوراً
  useEffect(() => {
    if (quiet) stop();
  }, [quiet, stop]);

  // نطق الخطوة عند الانتقال إن اختار المستخدم ذلك صراحةً
  useEffect(() => {
    if (playing && withVoice && !quiet) audioService.speak(current.audio ?? current.caption);
  }, [step, playing, withVoice, quiet, current.audio, current.caption]);

  const go = (n: number) => {
    stop();
    setStep(Math.max(1, Math.min(steps.length, n)));
  };

  return (
    <section
      className={`rounded-xl2 bg-paper-card p-4 shadow-soft md:p-5 ${className}`}
      aria-label={`حركة توضيحية: ${animation.title}`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>🎬 </span>
          {animation.title}
        </h2>
        <p className="text-sm text-ink-mute">{animation.hint}</p>
      </header>

      {/* مساحة المشهد */}
      <div className="mt-3 overflow-hidden rounded-xl2 bg-sky-50">
        <svg
          viewBox="0 0 360 240"
          role="img"
          aria-label={`${animation.title} — الخطوة ${step} من ${steps.length}`}
          className="mx-auto block h-auto w-full max-w-xl"
        >
          <rect width="360" height="240" rx="18" fill="#f1f8fd" />
          <g key={step} className="kw-frame">
            <Scene step={step} />
          </g>
        </svg>
      </div>

      {/* الجملة الحالية: تُقرأ ويُعلنها قارئ الشاشة عند تغيّر الخطوة */}
      <p
        aria-live="polite"
        className="mt-3 rounded-xl2 bg-mint-50 px-4 py-3 text-center text-child-base font-semibold text-mint-700"
      >
        <span aria-hidden className="me-2">{step}.</span>
        {current.caption}
      </p>

      {/* نقاط التقدّم */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="خطوات الحركة">
        {steps.map((s, i) => (
          <button
            key={s.caption}
            type="button"
            onClick={() => go(i + 1)}
            aria-label={`الخطوة ${i + 1}: ${s.caption}`}
            aria-current={step === i + 1 ? 'step' : undefined}
            className={`h-4 w-8 rounded-full transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
              step === i + 1 ? 'bg-mint-500' : 'bg-paper-line hover:bg-mint-200'
            }`}
          />
        ))}
      </div>

      {/* أزرار التحكم */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {!playing ? (
          <button
            type="button"
            onClick={() => {
              if (step >= steps.length) setStep(1);
              setPlaying(true);
            }}
            disabled={quiet}
            className="flex min-h-touch items-center gap-2 rounded-xl2 bg-mint-500 px-5 text-child-base font-bold text-white shadow-lift transition hover:bg-mint-600 disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-mint-300"
          >
            <span aria-hidden>▶</span> شغّل الحركة
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="flex min-h-touch items-center gap-2 rounded-xl2 bg-sun-100 px-5 text-child-base font-bold text-sun-700 shadow-soft transition hover:bg-sun-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sun-300"
          >
            <span aria-hidden>⏸</span> إيقاف مؤقت
          </button>
        )}

        <button
          type="button"
          onClick={() => go(step - 1)}
          disabled={step === 1}
          className="flex min-h-touch items-center gap-2 rounded-xl2 bg-paper px-4 text-child-sm font-semibold text-ink shadow-soft transition hover:bg-sky-50 disabled:opacity-40 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
        >
          <span aria-hidden>⏮</span> الخطوة السابقة
        </button>

        <button
          type="button"
          onClick={() => go(step + 1)}
          disabled={step === steps.length}
          className="flex min-h-touch items-center gap-2 rounded-xl2 bg-paper px-4 text-child-sm font-semibold text-ink shadow-soft transition hover:bg-sky-50 disabled:opacity-40 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
        >
          الخطوة التالية <span aria-hidden>⏭</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stop();
            setStep(1);
          }}
          className="flex min-h-touch items-center gap-2 rounded-xl2 bg-paper px-4 text-child-sm font-semibold text-ink shadow-soft transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
        >
          <span aria-hidden>🔁</span> من البداية
        </button>

        <button
          type="button"
          onClick={() => audioService.speak(current.audio ?? current.caption)}
          className="flex min-h-touch items-center gap-2 rounded-xl2 bg-sky-100 px-4 text-child-sm font-bold text-sky-800 shadow-soft transition hover:bg-sky-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
        >
          <span aria-hidden>🔊</span> اسمع الخطوة
        </button>

        <label className="flex min-h-touch cursor-pointer items-center gap-2 rounded-xl2 bg-paper px-4 text-child-sm font-semibold text-ink shadow-soft">
          <input
            type="checkbox"
            checked={withVoice}
            onChange={(e) => setWithVoice(e.target.checked)}
            className="h-5 w-5 accent-mint-500"
          />
          نطق تلقائي مع الخطوات
        </label>
      </div>

      {quiet && (
        <p className="mt-3 rounded-xl2 bg-mint-50 px-4 py-2 text-center text-sm font-semibold text-mint-700">
          🌿 الوضع الهادئ مفعّل: الحركة لا تتقدّم وحدها — استخدم «الخطوة التالية» أو اضغط الخطوات أعلاه.
        </p>
      )}

      {animation.note && (
        <p className="mt-3 rounded-xl2 bg-sun-50 px-4 py-3 text-child-sm font-semibold text-sun-700">
          <span aria-hidden>⚠️ </span>
          {animation.note}
        </p>
      )}
    </section>
  );
}
