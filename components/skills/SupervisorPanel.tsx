'use client';

import { useState } from 'react';
import type { Skill } from '@/data/types';
import { categoryById, domainById } from '@/data/taxonomy';

/**
 * 👨‍👩‍👧 للمشرف — معلومات متقدمة للأهل/الأخصائي:
 * المحور، القسم، النص الأصلي، رقم البند، صفحة المصدر، واقتراح النشاط والسلامة.
 * (زر يُفتح بالضغط، ولا يظهر تلقائياً للطفل)
 */
export function SupervisorPanel({ skill }: { skill: Skill }) {
  const [open, setOpen] = useState(false);
  const domain = domainById[skill.domain];
  const category = categoryById[skill.category];

  return (
    <section className="rounded-xl2 border border-grape-200 bg-grape-50 p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-touch w-full items-center justify-between gap-3 rounded-xl2 bg-white px-4 text-child-base font-bold text-grape-700 shadow-soft focus-visible:outline focus-visible:outline-4 focus-visible:outline-grape-400"
      >
        <span>
          <span aria-hidden>👨‍👩‍👧 </span>للمشرف (الأهل أو الأخصائي)
        </span>
        <span aria-hidden>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-3 text-child-sm text-ink-soft">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl2 bg-white p-3">
              <dt className="font-semibold text-ink">المحور</dt>
              <dd>{domain?.title}</dd>
            </div>
            <div className="rounded-xl2 bg-white p-3">
              <dt className="font-semibold text-ink">القسم</dt>
              <dd>{category?.title}</dd>
            </div>
            <div className="rounded-xl2 bg-white p-3">
              <dt className="font-semibold text-ink">رقم البند في الاستمارة</dt>
              <dd>{skill.sourceItemNumber}</dd>
            </div>
            <div className="rounded-xl2 bg-white p-3">
              <dt className="font-semibold text-ink">صفحة المصدر</dt>
              <dd>{skill.sourcePage}</dd>
            </div>
          </dl>

          <div className="rounded-xl2 bg-white p-3">
            <p className="font-semibold text-ink">النص الأصلي من الاستمارة (غير معدَّل)</p>
            <p className="mt-1 leading-relaxed" dir="rtl">
              «{skill.originalText}»
            </p>
          </div>

          <div className="rounded-xl2 bg-white p-3">
            <p className="font-semibold text-ink">مستوى النشاط</p>
            <p className="mt-1">
              {skill.safetyLevel === 'digital' && 'نشاط رقمي داخل الموقع'}
              {skill.safetyLevel === 'supervised' && 'يُنفَّذ مع شخص بالغ'}
              {skill.safetyLevel === 'safety-sensitive' && 'حساس للسلامة — إشراف مباشر إلزامي'}
            </p>
          </div>

          {skill.supervisorNote && (
            <div className="rounded-xl2 bg-white p-3">
              <p className="font-semibold text-ink">اقتراح للنشاط</p>
              <p className="mt-1">{skill.supervisorNote}</p>
            </div>
          )}

          {skill.safetyNote && (
            <div className="rounded-xl2 border border-sun-300 bg-sun-50 p-3 font-semibold text-sun-700">
              {skill.safetyNote}
            </div>
          )}

          {skill.needsReview && (
            <div className="rounded-xl2 border border-peach-300 bg-peach-50 p-3 text-peach-600">
              <p className="font-semibold">ملاحظة توثيقية للمراجعة</p>
              <p className="mt-1">{skill.needsReviewNote}</p>
            </div>
          )}

          <p className="text-xs text-ink-mute">
            لا يحتوي هذا الموقع على أي تقييم أو درجات. المطلوب فقط التدرّب والاستمتاع.
          </p>
        </div>
      )}
    </section>
  );
}
