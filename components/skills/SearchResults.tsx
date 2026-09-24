'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { VisualBox } from '@/components/games/parts';

/** صف واحد في فهرس البحث (مولَّد في public/search-index.json) */
type Row = {
  id: string;
  t: string;
  o: string;
  k: string;
  c: string;
  p: number;
  i: { kind: string; value: string };
};

/** تطبيع عربي: تشكيل وتطويل وحروف متشابهة — نفس قواعد البحث في الموقع */
const normalize = (s: string) =>
  s
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();

export function SearchResults() {
  const params = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);

  // الفهرس يُحمَّل مرة واحدة عند فتح الصفحة (وليس مع بقية الموقع)
  useEffect(() => {
    let alive = true;
    fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('index'))))
      .then((d) => alive && setRows(d.rows as Row[]))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo(() => {
    if (!rows || !q) return [];
    const nq = normalize(q);
    const words = nq.split(/\s+/).filter(Boolean);
    return rows
      .map((r) => {
        const title = normalize(r.t);
        const original = normalize(r.o);
        const keywords = normalize(r.k);
        let score = 0;
        for (const w of words) {
          if (title.includes(w)) score += 4;
          if (keywords.includes(w)) score += 3;
          if (original.includes(w)) score += 2;
        }
        return { r, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 60)
      .map((x) => x.r);
  }, [rows, q]);

  return (
    <div className="space-y-8">
      {q && (
        <p aria-live="polite" className="rounded-xl2 bg-mint-50 px-4 py-3 text-center text-child-base font-semibold text-mint-700">
          {rows ? `نتائج البحث عن «${q}»: ${results.length}` : `… جارٍ البحث عن «${q}»`}
        </p>
      )}

      {failed && (
        <div className="rounded-xl2 bg-sun-50 p-6 text-child-base text-sun-700">
          تعذّر تحميل فهرس البحث. تأكّد من الاتصال — أو استعرض{' '}
          <Link href="/skills" className="underline">
            كل المهارات
          </Link>
          .
        </div>
      )}

      {q && rows && results.length === 0 && (
        <div className="rounded-xl2 bg-sun-50 p-6 text-child-base text-sun-700">
          لم نجد نتائج مطابقة. جرّب كلمة أقصر، أو استعرض{' '}
          <Link href="/skills" className="underline">
            كل المهارات
          </Link>
          .
        </div>
      )}

      <ul className="space-y-3">
        {results.map((r) => (
          <li key={r.id}>
            <Link
              href={`/skill/${r.id}`}
              className="flex flex-wrap items-center gap-4 rounded-xl2 border border-paper-line bg-paper-card p-4 shadow-soft transition hover:shadow-lift"
            >
              <VisualBox visual={r.i as never} size="sm" />
              <span className="flex-1">
                <span className="block font-display text-child-base font-bold text-ink">{r.t}</span>
                <span className="block text-sm text-ink-mute">«{r.o}»</span>
                <span className="mt-1 block text-xs text-ink-mute">
                  {r.c} • صفحة {r.p}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
