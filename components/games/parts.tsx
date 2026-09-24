'use client';

/**
 * عناصر مشتركة لكل الألعاب — خطوتي
 * قواعد ثابتة:
 *  - الإجابة الصحيحة: ⭐ + ✨ + كلمة تشجيع هادئة (بلا موسيقى عالية ولا Confetti).
 *  - الإجابة غير الصحيحة: «حاول مرة أخرى» + تلميح بصري هادئ بعد محاولتين. لا ❌ ولا أحمر قوي ولا جرس خطأ.
 *  - كل عنصر له زر 🔊 ويمكن إعادة الصوت بلا حد، ولا يوجد تشغيل تلقائي.
 */
import React from 'react';
import { audioService } from '@/lib/audio/service';
import { getEnvSound } from '@/lib/audio/library';
import type { Visual } from '@/data/types';
import { PICTOGRAMS } from '@/components/illustrations/Pictograms';
import { REAL_PHOTOS } from '@/data/photos';

export function VisualBox({
  visual,
  size = 'md',
  mode = 'auto',
}: {
  visual: Visual;
  size?: 'sm' | 'md' | 'lg';
  /** auto: صورة حقيقية ← رسم ← رمز.  art: رسم دائماً (للأماكن التي نحتاج فيها رموزاً موحّدة مثل لوحة التواصل) */
  mode?: 'auto' | 'art';
}) {
  const sizes = { sm: 'text-4xl', md: 'text-6xl', lg: 'text-7xl md:text-8xl' };
  const pixels = { sm: 40, md: 64, lg: 96 };
  if (visual.kind === 'image') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={visual.value} alt="" className="h-24 w-24 object-contain" />;
  }
  if (visual.kind === 'letter') {
    return (
      <span className={`font-display font-bold text-sky-700 ${sizes[size]}`} aria-hidden>
        {visual.value}
      </span>
    );
  }
  // ١) صورة حقيقية إن وُجدت لهذا العنصر (للمرحلة الواقعية «جرّب مع المشرف»)
  const photo = mode === 'auto' ? REAL_PHOTOS[visual.value] : undefined;
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo.src}
        alt=""
        loading="lazy"
        decoding="async"
        width={pixels[size]}
        height={pixels[size]}
        className="inline-block rounded-xl2 bg-white object-contain align-middle"
        style={{ width: pixels[size], height: pixels[size] }}
      />
    );
  }

  // ٢) رسمة أصلية (SVG) إن كانت متوفرة لهذا العنصر — وإلا فالعنصر النائب الموثّق
  const art = PICTOGRAMS[visual.value];
  if (art) {
    return (
      <span
        className="inline-block align-middle"
        style={{ width: pixels[size], height: pixels[size] }}
        aria-hidden
      >
        {art}
      </span>
    );
  }
  return (
    <span className={sizes[size]} aria-hidden>
      {visual.value}
    </span>
  );
}

export function AudioButton({
  text,
  soundKey,
  src,
  label,
  className = '',
}: {
  text?: string;
  soundKey?: string;
  src?: string;
  label?: string;
  className?: string;
}) {
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (src) audioService.playUrl(src);
    else if (soundKey) audioService.playEnv(soundKey);
    else if (text) audioService.speak(text);
  };
  const aria = label ?? (soundKey ? getEnvSound(soundKey)?.label : text) ?? 'استمع';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`استمع: ${aria}`}
      className={`inline-flex min-h-touch min-w-touch items-center justify-center rounded-2xl bg-sky-100 px-3 text-2xl text-sky-800 shadow-soft transition hover:bg-sky-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${className}`}
    >
      <span aria-hidden>🔊</span>
    </button>
  );
}

export function ChoiceCard({
  visual,
  label,
  onSelect,
  state = 'idle',
  soundKey,
  audioText,
  disabled,
}: {
  visual: Visual;
  label: string;
  onSelect: () => void;
  state?: 'idle' | 'correct' | 'hint' | 'dim';
  soundKey?: string;
  audioText?: string;
  disabled?: boolean;
}) {
  const ring =
    state === 'correct'
      ? 'ring-4 ring-mint-400 bg-mint-50'
      : state === 'hint'
        ? 'ring-4 ring-sun-300 bg-sun-50 animate-pop'
        : state === 'dim'
          ? 'opacity-60'
          : 'bg-paper-card hover:bg-sky-50';
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        aria-label={label}
        className={`flex min-h-[9rem] w-full flex-col items-center justify-center gap-2 rounded-xl2 border border-paper-line p-4 shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${ring}`}
      >
        <VisualBox visual={visual} size="lg" />
        <span className="text-child-base font-semibold text-ink">{label}</span>
      </button>
      <AudioButton text={audioText ?? label} soundKey={soundKey} label={label} className="min-h-touch" />
    </div>
  );
}

export function Feedback({ kind, message }: { kind: 'correct' | 'retry' | 'info'; message: string }) {
  if (kind === 'correct') {
    return (
      <div role="status" className="flex items-center justify-center gap-3 rounded-xl2 bg-mint-50 px-4 py-3 text-child-base font-semibold text-mint-700">
        <span aria-hidden className="text-3xl animate-sparkle">✨</span>
        <span aria-hidden className="text-3xl">⭐</span>
        <span>{message}</span>
      </div>
    );
  }
  if (kind === 'retry') {
    return (
      <div role="status" className="flex items-center justify-center gap-3 rounded-xl2 bg-sun-50 px-4 py-3 text-child-base font-semibold text-sun-700">
        <span aria-hidden>💛</span>
        <span>{message}</span>
      </div>
    );
  }
  return (
    <div role="status" className="rounded-xl2 bg-sky-50 px-4 py-3 text-child-base text-ink-soft">
      {message}
    </div>
  );
}

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-3 w-3 rounded-full ${i < current ? 'bg-mint-400' : 'bg-paper-line'}`}
        />
      ))}
    </div>
  );
}

export function GameTitle({ title, instruction }: { title: string; instruction: string }) {
  return (
    <header className="space-y-1 text-center">
      <h2 className="font-display text-child-lg font-bold text-ink">{title}</h2>
      <p className="text-child-sm text-ink-soft">{instruction}</p>
    </header>
  );
}

export function shuffle<T>(arr: T[], seed = 0): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
