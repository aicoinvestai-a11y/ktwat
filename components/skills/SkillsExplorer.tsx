'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { modeLabel } from '@/data/mode-labels';
import { CATEGORIES, DOMAINS, categoryById } from '@/data/taxonomy';

export interface SkillListItem {
  id: string;
  title: string;
  icon: string;
  domain: string;
  category: string;
  modes: string[];
  supervisorRequired: boolean;
  safetyLevel: string;
  sourcePage: number;
  originalText: string;
}

/** فلاتر وبحث قوي باللغة العربية — للأهل والأخصائي */
export function SkillsExplorer({ skills }: { skills: SkillListItem[] }) {
  const [q, setQ] = useState('');
  const [domain, setDomain] = useState('all');
  const [category, setCategory] = useState('all');
  const [mode, setMode] = useState('all');
  const [supervision, setSupervision] = useState('all');

  const modes = useMemo(() => {
    const set = new Set<string>();
    skills.forEach((s) => s.modes.forEach((m) => set.add(m)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar'));
  }, [skills]);

  const normalize = (s: string) =>
    s
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .toLowerCase();

  const results = useMemo(() => {
    const nq = normalize(q.trim());
    return skills.filter((s) => {
      if (domain !== 'all' && s.domain !== domain) return false;
      if (category !== 'all' && s.category !== category) return false;
      if (mode !== 'all' && !s.modes.includes(mode)) return false;
      if (supervision === 'supervised' && !s.supervisorRequired) return false;
      if (supervision === 'digital' && s.supervisorRequired) return false;
      if (!nq) return true;
      const haystack = normalize(`${s.title} ${s.originalText} ${categoryById[s.category]?.title ?? ''}`);
      return nq.split(/\s+/).every((w) => haystack.includes(w));
    });
  }, [skills, q, domain, category, mode, supervision]);

  const domainCats = domain === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.domain === domain);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-xl2 bg-paper-card p-5 shadow-soft md:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-child-sm">
          <span className="font-semibold text-ink">بحث</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن مهارة… (مثال: أسنان، ملعقة)"
            className="min-h-touch rounded-xl2 border border-paper-line px-4"
          />
        </label>

        <label className="flex flex-col gap-1 text-child-sm">
          <span className="font-semibold text-ink">المحور</span>
          <select
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setCategory('all');
            }}
            className="min-h-touch rounded-xl2 border border-paper-line px-4"
          >
            <option value="all">كل المحاور</option>
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-child-sm">
          <span className="font-semibold text-ink">القسم</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="min-h-touch rounded-xl2 border border-paper-line px-4">
            <option value="all">كل الأقسام</option>
            {domainCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-child-sm">
          <span className="font-semibold text-ink">نوع النشاط</span>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="min-h-touch rounded-xl2 border border-paper-line px-4">
            <option value="all">كل الأنواع</option>
            {modes.map((m) => (
              <option key={m} value={m}>
                {modeLabel(m)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-child-sm md:col-span-2">
          <span className="font-semibold text-ink">الإشراف</span>
          <select value={supervision} onChange={(e) => setSupervision(e.target.value)} className="min-h-touch rounded-xl2 border border-paper-line px-4">
            <option value="all">الكل</option>
            <option value="digital">رقمي فقط</option>
            <option value="supervised">يحتاج شخصاً بالغاً</option>
          </select>
        </label>
      </div>

      <p role="status" className="text-child-sm text-ink-soft">
        عدد النتائج: <strong>{results.length}</strong>
      </p>

      <ul className="space-y-3">
        {results.map((s) => (
          <li key={s.id}>
            <Link
              href={`/skill/${s.id}`}
              className="flex flex-wrap items-center gap-4 rounded-xl2 border border-paper-line bg-paper-card p-4 shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
            >
              <span aria-hidden className="text-3xl">
                {s.icon}
              </span>
              <span className="flex-1">
                <span className="block font-display text-child-base font-bold text-ink">{s.title}</span>
                <span className="block text-sm text-ink-mute" dir="rtl">
                  «{s.originalText}»
                </span>
                <span className="mt-1 block text-xs text-ink-mute">
                  {categoryById[s.category]?.title} • صفحة {s.sourcePage} •{' '}
                  {s.safetyLevel === 'safety-sensitive' ? '⚠️ حساس للسلامة' : s.supervisorRequired ? '👨‍👩‍👧 بإشراف' : 'رقمي'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {results.length === 0 && (
        <p className="rounded-xl2 bg-sun-50 p-5 text-center text-child-base text-sun-700">
          لم نجد نتائج. جرّب كلمة أقصر مثل «ماء» أو «حرف».
        </p>
      )}
    </div>
  );
}
