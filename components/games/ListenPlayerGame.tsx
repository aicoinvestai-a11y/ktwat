'use client';

import React, { useRef, useState } from 'react';
import type { ListenPlayerActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { Feedback, GameTitle } from './parts';

/**
 * مشغّل الاستماع (القرآن الكريم والتسجيلات البشرية)
 * ▶ استمع — ⏸ إيقاف مؤقت — 🔁 إعادة
 * مهم: لا تُستخدم أي قراءة آلية للنص القرآني. التشغيل يدوي فقط بضغط المستخدم.
 */
export function ListenPlayerGame({ activity }: { activity: ListenPlayerActivity }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = activity.tracks[activeIndex];

  const play = (index = activeIndex) => {
    if (index !== activeIndex) setActiveIndex(index);
    const src = activity.tracks[index]?.src;
    if (!src) return;
    audioService.stopAudio();
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    setPlaying(true);
    void audio.play().catch(() => setPlaying(false));
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const replay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      play();
    }
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />

      <div className="rounded-xl2 bg-mint-50 p-4 text-center text-child-sm text-mint-700">
        وضع هادئ 🌿 — استمع بهدوء، والتلاوة تسجيل صوتي حقيقي (لا تُقرأ آلياً).
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {activity.tracks.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => play(i)}
            className={`min-h-touch rounded-xl2 px-4 text-child-sm font-semibold shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
              i === activeIndex ? 'bg-grape-100 text-grape-700 ring-4 ring-grape-200' : 'bg-paper-card text-ink hover:bg-grape-50'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      {track && (
        <div className="space-y-4 rounded-xl2 bg-paper-card p-5 shadow-soft">
          <h4 className="text-center font-display text-child-lg font-bold text-ink">{track.title}</h4>

          {track.text && (
            <p
              className="rounded-xl2 bg-paper p-5 text-center text-child-lg leading-loose text-ink"
              dir="rtl"
              lang="ar"
            >
              {track.text}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => (playing ? pause() : play())}
              className="min-h-touch rounded-xl2 bg-sky-100 px-6 text-child-base font-bold text-sky-800 hover:bg-sky-200"
              aria-pressed={playing}
            >
              {playing ? '⏸ إيقاف مؤقت' : '▶ استمع'}
            </button>
            <button
              type="button"
              onClick={replay}
              className="min-h-touch rounded-xl2 bg-paper px-6 text-child-base font-semibold text-ink shadow-soft hover:bg-sky-50"
            >
              🔁 إعادة
            </button>
          </div>

          {track.note && <p className="text-center text-child-sm text-ink-mute">{track.note}</p>}
        </div>
      )}

      <Feedback kind="info" message="يمكنك الاستماع والتكرار بلا حد، وبلا أي تشغيل تلقائي." />
    </section>
  );
}
