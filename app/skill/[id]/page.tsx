import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allSkills, skillById, skillsOfCategory } from '@/data/skills';
import { categoryById, domainById } from '@/data/taxonomy';
import { SkillView } from '@/components/skills/SkillView';

export function generateStaticParams() {
  return allSkills.map((s) => ({ id: s.id }));
}

export default function SkillPage({ params }: { params: { id: string } }) {
  const skill = skillById[params.id];
  if (!skill) notFound();
  const domain = domainById[skill.domain];
  const category = categoryById[skill.category];
  const siblings = skillsOfCategory(skill.category).filter((s) => s.id !== skill.id).slice(0, 4);

  return (
    <div className="space-y-8">
      <nav aria-label="مسار التنقل" className="text-child-sm text-ink-mute">
        <Link href="/" className="underline">
          الرئيسية
        </Link>{' '}
        /{' '}
        <Link href={`/world/${domain.id}`} className="underline">
          {domain.childTitle}
        </Link>{' '}
        /{' '}
        <Link href={`/category/${category.id}`} className="underline">
          {category.childTitle}
        </Link>{' '}
        / <span>{skill.childFriendlyTitle}</span>
      </nav>

      <SkillView skill={skill} />

      <section className="rounded-xl2 bg-paper-card p-4 shadow-soft">
        <h2 className="font-display text-child-base font-bold text-ink">
          <span aria-hidden>🖨️ </span>
          نستخدمها بعيداً عن الشاشة؟
        </h2>
        <p className="mt-1 text-child-sm text-ink-soft">
          اطبع بطاقة النشاط وضعها معك: الخطوات، الأدوات، تنبيه السلامة، ومربعات «تدربنا ✓» للتأشير بالقلم.
        </p>
        <Link
          href={`/card/${skill.id}`}
          className="mt-3 inline-flex min-h-touch items-center rounded-xl2 bg-sky-100 px-5 text-child-sm font-bold text-sky-800 hover:bg-sky-200"
        >
          بطاقة النشاط للطباعة
        </Link>
      </section>

      {siblings.length > 0 && (
        <section className="space-y-4" aria-labelledby="siblings-title">
          <h2 id="siblings-title" className="font-display text-child-lg font-bold text-ink">
            مهارات أخرى في {category.childTitle}
          </h2>
          <div className="flex flex-wrap gap-3">
            {siblings.map((s) => (
              <Link
                key={s.id}
                href={`/skill/${s.id}`}
                className="flex min-h-touch items-center gap-2 rounded-xl2 bg-paper-card px-5 text-child-sm font-semibold text-ink shadow-soft transition hover:bg-sky-50"
              >
                <span aria-hidden>{s.icon.value}</span>
                {s.childFriendlyTitle}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
