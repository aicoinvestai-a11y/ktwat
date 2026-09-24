import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CATEGORIES, categoryById, domainById } from '@/data/taxonomy';
import { skillsOfCategory } from '@/data/skills';
import { SkillCard } from '@/components/skills/SkillCard';

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const category = categoryById[params.id];
  if (!category) notFound();
  const skills = skillsOfCategory(category.id);
  const domain = domainById[category.domain];

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
        / <span>{category.childTitle}</span>
      </nav>

      <header className="rounded-xl3 bg-paper-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-4xl font-bold text-ink">
          <span aria-hidden className="me-3">
            {category.icon.value}
          </span>
          {category.childTitle}
        </h1>
        <p className="mt-2 text-child-base text-ink-soft">{category.description}</p>
        <p className="mt-2 text-sm text-ink-mute">
          {skills.length} مهارة • صفحات الاستمارة: {category.sourcePages.join('، ')}
        </p>
        <p className="mt-1 text-sm text-ink-mute">اسم القسم في الاستمارة: {category.title}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="بطاقات المهارات">
        {skills.map((s) => (
          <SkillCard key={s.id} skill={s} />
        ))}
      </section>
    </div>
  );
}
