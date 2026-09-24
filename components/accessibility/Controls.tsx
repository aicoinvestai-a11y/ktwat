'use client';

import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '@/config/site.config';
import { audioService } from '@/lib/audio/service';
import { usePrefs } from '@/lib/prefs';

/** 🌿 الوضع الهادئ — متاح دائماً */
export function QuietToggle() {
  const { audio, toggleQuiet } = usePrefs();
  return (
    <button
      type="button"
      onClick={toggleQuiet}
      aria-pressed={audio.quiet}
      className={`flex min-h-touch items-center gap-2 rounded-xl2 px-4 text-child-sm font-bold shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-mint-400 ${
        audio.quiet ? 'bg-mint-100 text-mint-700' : 'bg-paper-card text-ink hover:bg-mint-50'
      }`}
    >
      <span aria-hidden>🌿</span>
      الوضع الهادئ {audio.quiet ? '(مفعّل)' : ''}
    </button>
  );
}

/** 🔊 إعدادات الصوت + سرعة النطق */
export function AudioSettings() {
  const { audio, setAudio } = usePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const toggle = (key: 'soundOn' | 'effectsOn') => {
    setAudio({ [key]: !audio[key] } as Partial<typeof audio>);
    if (key === 'soundOn' && !audio.soundOn) setTimeout(() => audioService.say('sound-ok'), 60);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex min-h-touch items-center gap-2 rounded-xl2 bg-paper-card px-4 text-child-sm font-bold text-ink shadow-soft transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
      >
        <span aria-hidden>{audio.soundOn ? '🔊' : '🔇'}</span>
        الصوت
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="إعدادات الصوت"
          className="absolute end-0 z-40 mt-2 w-72 space-y-3 rounded-xl2 border border-paper-line bg-white p-4 text-child-sm shadow-lift"
        >
          <label className="flex items-center justify-between gap-3">
            <span className="font-semibold text-ink">الصوت</span>
            <button
              type="button"
              onClick={() => toggle('soundOn')}
              aria-pressed={audio.soundOn}
              className={`min-h-touch rounded-xl2 px-4 font-bold ${audio.soundOn ? 'bg-mint-100 text-mint-700' : 'bg-paper text-ink-soft'}`}
            >
              {audio.soundOn ? 'تشغيل' : 'إيقاف'}
            </button>
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="font-semibold text-ink">المؤثرات</span>
            <button
              type="button"
              onClick={() => toggle('effectsOn')}
              aria-pressed={audio.effectsOn}
              className={`min-h-touch rounded-xl2 px-4 font-bold ${audio.effectsOn ? 'bg-mint-100 text-mint-700' : 'bg-paper text-ink-soft'}`}
            >
              {audio.effectsOn ? 'تشغيل' : 'إيقاف'}
            </button>
          </label>

          <fieldset className="space-y-2">
            <legend className="font-semibold text-ink">سرعة النطق</legend>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAudio({ rate: siteConfig.audio.slowRate })}
                aria-pressed={audio.rate <= siteConfig.audio.slowRate + 0.01}
                className={`min-h-touch flex-1 rounded-xl2 px-3 font-semibold ${audio.rate <= siteConfig.audio.slowRate + 0.01 ? 'bg-sky-100 text-sky-800' : 'bg-paper text-ink-soft'}`}
              >
                بطيء
              </button>
              <button
                type="button"
                onClick={() => setAudio({ rate: siteConfig.audio.defaultRate })}
                aria-pressed={audio.rate > siteConfig.audio.slowRate + 0.01}
                className={`min-h-touch flex-1 rounded-xl2 px-3 font-semibold ${audio.rate > siteConfig.audio.slowRate + 0.01 ? 'bg-sky-100 text-sky-800' : 'bg-paper text-ink-soft'}`}
              >
                عادي
              </button>
            </div>
          </fieldset>

          <button
            type="button"
            onClick={() => audioService.say('sound-rate')}
            className="min-h-touch w-full rounded-xl2 bg-sky-50 px-3 font-semibold text-sky-800"
          >
            🔊 تجربة الصوت
          </button>

          <p className="text-xs text-ink-mute">
            الجمل المسجّلة: {audioService.voiceStatus().recorded} من {audioService.voiceStatus().total} — وما لم يُسجَّل
            بعد ينطقه محرّك جهازك.
          </p>
          <p className="text-xs text-ink-mute">تُحفظ الإعدادات على جهازك وحده. لا تُرسل لأي جهة.</p>
        </div>
      )}
    </div>
  );
}

/** 🌿 استراحة — وقت هادئ بلا صوت، ومؤقّت اختياري */
export function BreakButton() {
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (open) audioService.stop();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-touch items-center gap-2 rounded-xl2 bg-mint-50 px-4 text-child-sm font-bold text-mint-700 shadow-soft transition hover:bg-mint-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-mint-400"
      >
        <span aria-hidden>🌿</span> استراحة
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="وقت هادئ"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-mint-50/95 p-6 text-center"
        >
          <p className="font-display text-child-xl font-bold text-mint-700">وقت هادئ 🌿</p>
          <p className="max-w-md text-child-base text-ink-soft">
            خذ نفساً عميقاً، وانظر إلى الأشجار، ولا يوجد أي صوت الآن.
          </p>

          {secondsLeft === null ? (
            <div className="flex flex-wrap justify-center gap-3">
              {siteConfig.breakDurations.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSecondsLeft(m * 60)}
                  className="min-h-touch rounded-xl2 bg-white px-6 text-child-base font-bold text-mint-700 shadow-soft"
                >
                  {m} دقيقة
                </button>
              ))}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-touch rounded-xl2 bg-white px-6 text-child-base font-semibold text-ink shadow-soft"
              >
                بدون مؤقّت — أعود عندما أريد
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-display text-child-xl font-bold text-ink" aria-live="polite">
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSecondsLeft(null)}
                  className="min-h-touch rounded-xl2 bg-white px-5 text-child-base font-semibold text-ink shadow-soft"
                >
                  تغيير المدة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSecondsLeft(null);
                    setOpen(false);
                  }}
                  className="min-h-touch rounded-xl2 bg-white px-5 text-child-base font-bold text-mint-700 shadow-soft"
                >
                  رجعت… والآن نكمل 🌱
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setSecondsLeft(null);
              setOpen(false);
            }}
            className="min-h-touch rounded-xl2 bg-white px-6 text-child-sm font-semibold text-ink-soft shadow-soft"
          >
            إغلاق
          </button>
        </div>
      )}
    </>
  );
}
