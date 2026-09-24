import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import { DOMAINS, categoriesOfDomain } from '@/data/taxonomy';
import { allSkills, skillsOfDomain } from '@/data/skills';
import { HeroScene, WorldScene } from '@/components/illustrations/Illustrations';
import { SkillCard } from '@/components/skills/SkillCard';

export default function HomePage() {
  const featured = ['sc-food-002', 'sc-hyg-005', 'cg-sen-022', 'sc-saf-001']
    .map((id) => allSkills.find((s) => s.id === id))
    .filter(Boolean) as typeof allSkills;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="rounded-xl3 bg-gradient-to-b from-sky-50 to-paper-card p-6 shadow-soft md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-5 text-center md:text-start">
            <p className="inline-flex items-center gap-2 rounded-xl2 bg-white px-4 py-2 text-child-sm font-semibold text-mint-700 shadow-soft">
              <span aria-hidden>🌱</span> {siteConfig.slogan}
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-ink md:text-5xl">
              {siteConfig.heroTitle}
            </h1>
            <p className="text-child-base text-ink-soft">{siteConfig.heroSubtitle}</p>
            <p className="text-child-sm font-semibold text-grape-700">{siteConfig.heroQuestion}</p>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                href="/start"
                className="flex min-h-touch items-center gap-2 rounded-xl2 bg-mint-500 px-7 text-child-lg font-bold text-white shadow-lift transition hover:bg-mint-600 focus-visible:outline focus-visible:outline-4 focus-visible:outline-mint-300"
              >
                <span aria-hidden>▶</span> {siteConfig.startButton}
              </Link>
              <Link
                href="/skills"
                className="flex min-h-touch items-center gap-2 rounded-xl2 bg-white px-6 text-child-base font-semibold text-ink shadow-soft transition hover:bg-sky-50"
              >
                <span aria-hidden>🔎</span> كل المهارات
              </Link>
            </div>
            <p className="text-sm text-ink-mute">
              بلا تسجيل، بلا اسم، بلا بيانات. للتدرّب مع الأسرة أو الأخصائي 💛
            </p>
          </div>
          <HeroScene className="w-full" />
        </div>
      </section>

      {/* المحاور الأربعة */}
      <section className="space-y-5" aria-labelledby="worlds-title">
        <h2 id="worlds-title" className="text-center font-display text-child-xl font-bold text-ink">
          اختر عالمك 🌍
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {DOMAINS.map((d) => {
            const count = skillsOfDomain(d.id).length;
            return (
              <Link
                key={d.id}
                href={`/world/${d.id}`}
                className="group flex flex-col gap-4 rounded-xl2 border border-paper-line bg-paper-card p-5 shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
              >
                <div className="flex items-center gap-4">
                  <WorldScene id={d.id} className="w-28 shrink-0" />
                  <div>
                    <h3 className="font-display text-child-lg font-bold text-ink">
                      <span aria-hidden className="me-2">
                        {d.icon.value}
                      </span>
                      {d.title}
                    </h3>
                    <p className="text-child-sm text-ink-soft">
                      {d.tagline} — <strong>{count}</strong> نشاطاً
                    </p>
                    <p className="mt-1 text-sm text-ink-mute">
                      {categoriesOfDomain(d.id)
                        .map((c) => c.childTitle)
                        .join(' • ')}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* بطاقات مهارات مقترحة */}
      <section className="space-y-5" aria-labelledby="featured-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="featured-title" className="font-display text-child-lg font-bold text-ink">
            هيا نجرّب الآن 🌟
          </h2>
          <Link href="/skills" className="text-child-sm font-semibold text-sky-700 underline">
            كل المهارات ←
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      </section>

      {/* للمشرف */}
      <section className="rounded-xl3 bg-grape-50 p-6 md:p-8" aria-labelledby="supervisor-title">
        <h2 id="supervisor-title" className="font-display text-child-lg font-bold text-grape-700">
          <span aria-hidden>👨‍👩‍👧 </span>للأهل والأخصائي
        </h2>
        <Link
          href="/guide"
          className="mt-4 flex min-h-touch items-center gap-3 rounded-xl2 bg-white p-4 text-child-sm font-semibold text-grape-700 shadow-soft transition hover:bg-grape-50"
        >
          <span aria-hidden className="text-2xl">📘</span>
          دليل الاستخدام للأسرة والأخصائي: خطوات الجلسة، وأزرار الرحلة، وقواعد السلامة — ابدأ من هنا
        </Link>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl2 bg-white p-5 shadow-soft">
            <p className="font-bold text-ink">استعراض كل بنود الاستمارة</p>
            <p className="mt-1 text-child-sm text-ink-soft">
              {allSkills.length} بنداً تعليمياً موزعة على 4 محاور و17 قسماً، مع النص الأصلي لكل بند ورقم الصفحة.
            </p>
            <Link href="/skills" className="mt-3 inline-block font-semibold text-sky-700 underline">
              فتح كل المهارات
            </Link>
          </div>
          <div className="rounded-xl2 bg-white p-5 shadow-soft">
            <p className="font-bold text-ink">نشاط واقعي بإشراف</p>
            <p className="mt-1 text-child-sm text-ink-soft">
              الأنشطة الحركية واليدوية وأدوات السلامة مُصنَّفة بوضوح: أي نشاط يحتاج إشرافاً مباشراً يظهر معه تنبيه ⚠️.
            </p>
          </div>
          <div className="rounded-xl2 bg-white p-5 shadow-soft">
            <p className="font-bold text-ink">لوحة التواصل بالصور</p>
            <p className="mt-1 text-child-sm text-ink-soft">
              52 بطاقة كبيرة للنطق والتعبير عن الاحتياجات والمشاعر، قابلة للطباعة والقص. لوحة تعليمية لا تُغني عن أدوات
              التواصل المعزّز السريرية.
            </p>
            <Link href="/board" className="mt-3 inline-block font-semibold text-sky-700 underline">
              🗣️ فتح اللوحة
            </Link>
          </div>
          <div className="rounded-xl2 bg-white p-5 shadow-soft">
            <p className="font-bold text-ink">مهاراتي</p>
            <p className="mt-1 text-child-sm text-ink-soft">
              اختيار المهارات للعمل عليها، وتخزينها على جهازك فقط، بلا تقييم ولا درجات.
            </p>
            <Link href="/my-skills" className="mt-3 inline-block font-semibold text-sky-700 underline">
              ⭐ مهاراتي
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
