import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DOMAINS, categoriesOfDomain, domainById } from '@/data/taxonomy';
import { skillsOfCategory } from '@/data/skills';
import { VisualBox } from '@/components/games/parts';

export function generateStaticParams() {
  return DOMAINS.map((d) => ({ domain: d.id }));
}

export default function WorldPage({ params }: { params: { domain: string } }) {
  const domain = domainById[params.domain as keyof typeof domainById];
  if (!domain) notFound();
  const cats = categoriesOfDomain(domain.id);

  return (
    <div className="space-y-8">
      <nav aria-label="مسار التنقل" className="text-child-sm text-ink-mute">
        <Link href="/" className="underline">
          الرئيسية
        </Link>{' '}
        / <span>{domain.title}</span>
      </nav>

      <header className="rounded-xl3 bg-paper-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-4xl font-bold text-ink">
          <span aria-hidden className="me-3">
            {domain.icon.value}
          </span>
          {domain.childTitle}
        </h1>
        <p className="mt-2 text-child-base font-semibold text-ink-soft">{domain.tagline}</p>
        <p className="mt-3 max-w-3xl text-child-sm text-ink-mute">{domain.description}</p>

        {domain.id === 'self-care' && (
          <Link
            href="/map"
            className="mt-5 inline-flex min-h-touch items-center gap-2 rounded-xl2 bg-mint-100 px-6 text-child-base font-bold text-mint-700 shadow-soft transition hover:bg-mint-200"
          >
            <span aria-hidden>🗺️</span> افتح خريطة البيت والمدينة
          </Link>
        )}
        {domain.id === 'cognitive' && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/quran" className="inline-flex min-h-touch items-center gap-2 rounded-xl2 bg-sky-100 px-6 text-child-base font-bold text-sky-800 shadow-soft">
              <span aria-hidden>📖</span> القرآن الكريم
            </Link>
            <Link href="/faith" className="inline-flex min-h-touch items-center gap-2 rounded-xl2 bg-grape-100 px-6 text-child-base font-bold text-grape-700 shadow-soft">
              <span aria-hidden>🕌</span> ديني الجميل
            </Link>
          </div>
        )}
      </header>

      <section className="space-y-5" aria-labelledby="cats-title">
        <h2 id="cats-title" className="font-display text-child-lg font-bold text-ink">
          أقسام هذا العالم
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => {
            const count = skillsOfCategory(c.id).length;
            return (
              <Link
                key={c.id}
                href={`/category/${c.id}`}
                className="flex items-center gap-4 rounded-xl2 border border-paper-line bg-paper-card p-5 shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
              >
                <VisualBox visual={c.icon} size="md" />
                <div>
                  <h3 className="font-display text-child-base font-bold text-ink">{c.childTitle}</h3>
                  <p className="text-sm text-ink-mute">{count} مهارة</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
