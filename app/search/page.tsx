import Link from 'next/link';
import { searchSkills } from '@/data/skills';
import { categoryById } from '@/data/taxonomy';
import { SkillCard } from '@/components/skills/SkillCard';

export const metadata = { title: 'نتائج البحث — خطوتي' };

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  const results = searchSkills(q);

  return (
    <div className="space-y-8">
      <header className="rounded-xl3 bg-paper-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-3xl font-bold text-ink">
          {q ? `نتائج البحث عن: «${q}»` : 'ابحث عن مهارة'}
        </h1>
        <p className="mt-2 text-child-base text-ink-soft">
          {q ? `عدد النتائج: ${results.length}` : 'اكتب كلمة في مربع البحث في الأعلى — مثال: «أسنان»، «ملعقة»، «أرقام».'}
        </p>
        <p className="mt-2 text-sm text-ink-mute">
          يبحث الموقع في: النص الأصلي للاستمارة، عناوين المهارات المبسطة، والكلمات المفتاحية.
        </p>
      </header>

      {q && results.length === 0 && (
        <div className="rounded-xl2 bg-sun-50 p-6 text-child-base text-sun-700">
          لم نجد نتائج مطابقة. جرّب كلمة أقصر، أو استعرض{' '}
          <Link href="/skills" className="underline">
            كل المهارات
          </Link>
          .
        </div>
      )}

      <ul className="space-y-3">
        {results.map((s) => (
          <li key={s.id}>
            <Link
              href={`/skill/${s.id}`}
              className="flex flex-wrap items-center gap-4 rounded-xl2 border border-paper-line bg-paper-card p-4 shadow-soft transition hover:shadow-lift"
            >
              <span aria-hidden className="text-3xl">
                {s.icon.value}
              </span>
              <span className="flex-1">
                <span className="block font-display text-child-base font-bold text-ink">{s.childFriendlyTitle}</span>
                <span className="block text-sm text-ink-mute">«{s.originalText}»</span>
                <span className="mt-1 block text-xs text-ink-mute">
                  {categoryById[s.category]?.title} • صفحة {s.sourcePage}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {q && results.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-child-lg font-bold text-ink">بطاقات سريعة</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, 6).map((s) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
