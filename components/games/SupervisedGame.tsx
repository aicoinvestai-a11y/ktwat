'use client';

import React, { useState } from 'react';
import type { SupervisedActivity, Visual } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { Feedback, GameTitle } from './parts';
import { REAL_PHOTOS, photoCreditText, photoCreditFull } from '@/data/photos';

/**
 * نشاط واقعي مع المشرف — بلا تقييم وبلا درجات.
 * يعرض: الأدوات، الخطوات، تنبيه السلامة، وشاهد متحرك بسيط (يحترم الوضع الهادئ).
 */
export function SupervisedGame({ activity, visual }: { activity: SupervisedActivity; visual?: Visual }) {
  const [checked, setChecked] = useState<number[]>([]);
  const photo = visual && visual.kind === 'emoji' ? REAL_PHOTOS[visual.value] : undefined;

  const toggle = (i: number) => {
    setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));
    audioService.chime('soft');
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />

      <div role="note" className="rounded-xl2 border border-sun-200 bg-sun-50 p-4 text-child-sm font-semibold text-sun-700">
        ⚠️ {activity.safetyNote ?? 'يتم هذا النشاط بإشراف مباشر من شخص بالغ، ولا يُجرَّب وحده.'}
      </div>

      {photo && (
        <figure className="flex flex-col items-center gap-2 rounded-xl2 bg-paper-card p-4 shadow-soft sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            className="h-40 w-40 shrink-0 rounded-xl2 bg-white object-contain"
          />
          <figcaption className="space-y-1 text-child-sm text-ink-soft">
            <p className="font-display text-child-base font-bold text-ink">
              <span aria-hidden>👀 </span>
              كيف تبدو في الواقع؟
            </p>
            <p>{photo.alt} — شاهدها مع الشخص الذي يساعدك، وقارنها بالشيء الحقيقي أمامك.</p>
            <p className="text-xs text-ink-mute">{photoCreditText(photo)}</p>
            <details className="text-xs text-ink-mute">
              <summary className="cursor-pointer">تفاصيل المصدر والاعتماد</summary>
              <p className="mt-1">{photoCreditFull(photo)}</p>
            </details>
          </figcaption>
        </figure>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl2 bg-paper-card p-5 shadow-soft">
          <h4 className="mb-2 font-display text-child-base font-bold text-ink">🎒 الأدوات</h4>
          <ul className="space-y-1 text-child-sm text-ink-soft">
            {activity.tools.map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl2 bg-paper-card p-5 shadow-soft">
          <h4 className="mb-2 font-display text-child-base font-bold text-ink">👨‍👩‍👧 خطوات النشاط</h4>
          <ul className="space-y-2">
            {activity.steps.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={checked.includes(i)}
                  className={`flex w-full items-center gap-3 rounded-xl2 px-3 py-2 text-right text-child-sm transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
                    checked.includes(i) ? 'bg-mint-50 text-mint-700 font-semibold' : 'bg-paper hover:bg-sky-50'
                  }`}
                >
                  <span aria-hidden className="text-xl">
                    {checked.includes(i) ? '✓' : '⬜'}
                  </span>
                  <span>{s}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl2 bg-grape-50 p-5">
        <div className="text-5xl animate-floaty" aria-hidden>
          👨‍👩‍👧 ✨
        </div>
        <p className="text-center text-child-base font-semibold text-grape-700">
          جرب هذا النشاط مع الشخص الذي يساعدك
        </p>
        {activity.adultNote && <p className="text-center text-child-sm text-ink-soft">{activity.adultNote}</p>}
        <button
          type="button"
          onClick={() => audioService.speak('جرّب هذا النشاط مع الشخص الذي يساعدك')}
          className="min-h-touch rounded-xl2 bg-white px-5 text-child-base font-semibold text-grape-700 shadow-soft"
        >
          🔊 استمع للتعليمة
        </button>
      </div>

      {checked.length === activity.steps.length && <Feedback kind="correct" message="تدربنا على هذا النشاط ✓" />}
    </section>
  );
}
