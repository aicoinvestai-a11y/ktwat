'use client';

import { useEffect, useRef, useState } from 'react';
import { audioService } from '@/lib/audio/service';
import { quranSrc } from '@/lib/audio/library';

export interface QuranSurahData {
  number: number;
  name: string;
  ayahs: string[];
}

/**
 * مشغّل السور — تلاوة صوتية حقيقية فقط (لا نطق آلي للقرآن).
 * بلا تشغيل تلقائي: كل تشغيل يبدأ بلمس/ضغط المستخدم.
 */
export function QuranPlayer({ surah, onClose }: { surah: QuranSurahData; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnd = () => {
      setPlaying(false);
      setFinished(true);
    };
    el.addEventListener('ended', onEnd);
    return () => el.removeEventListener('ended', onEnd);
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioService.stop();
    };
  }, []);

  const play = () => {
    const el = audioRef.current;
    if (!el) return;
    audioService.stopSpeaking();
    el.currentTime = 0;
    el.play()
      .then(() => {
        setPlaying(true);
        setFinished(false);
      })
      .catch(() => setPlaying(false));
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  return (
    <section
      aria-label={`تلاوة ${surah.name}`}
      className="space-y-5 rounded-xl3 bg-paper-card p-5 shadow-soft md:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-child-xl font-bold text-ink">{surah.name}</h2>
        <button
          type="button"
          onClick={onClose}
          className="min-h-touch rounded-xl2 bg-paper px-5 text-child-sm font-semibold text-ink-soft shadow-soft hover:bg-sky-50"
        >
          ✕ إغلاق
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={playing ? pause : play}
          className="flex min-h-touch items-center gap-2 rounded-xl2 bg-mint-100 px-6 text-child-base font-bold text-mint-700 shadow-soft transition hover:bg-mint-200"
        >
          <span aria-hidden>{playing ? '⏸' : '▶'}</span>
          {playing ? 'إيقاف مؤقت' : finished ? 'إعادة التلاوة' : 'استمع للتلاوة'}
        </button>
        <a
          href={quranSrc(surah.number)}
          download
          className="flex min-h-touch items-center gap-2 rounded-xl2 bg-paper px-6 text-child-sm font-semibold text-ink-soft shadow-soft hover:bg-sky-50"
        >
          <span aria-hidden>⤓</span> تنزيل الملف الصوتي
        </a>
      </div>

      <audio ref={audioRef} src={quranSrc(surah.number)} preload="none" />

      <div lang="ar" className="rounded-xl2 bg-sky-50 p-5 text-center leading-loose text-ink">
        {surah.ayahs.map((a, i) => (
          <span key={i}>
            {a}
            <span className="mx-1 text-mint-600" aria-hidden>
              ﴿{i + 1}﴾
            </span>{' '}
          </span>
        ))}
      </div>

      <p className="text-sm text-ink-mute">
        تلاوة حقيقية بصوت الشيخ مشاري راشد العفاسي، والنص العثماني من مصدر مراجَع. لا يوجد نطق آلي
        للقرآن في هذا الموقع. التلاوة تعليمية للاستماع والترديد مع المشرف.
      </p>
    </section>
  );
}
