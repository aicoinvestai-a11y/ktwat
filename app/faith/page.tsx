import Link from 'next/link';
import { skillsOfCategory } from '@/data/skills';
import { SkillCard } from '@/components/skills/SkillCard';

export const metadata = { title: 'ديني الجميل — خطوتي' };

export default function FaithPage() {
  const skills = skillsOfCategory('islamic');

  return (
    <div className="space-y-8">
      <header className="rounded-xl3 bg-paper-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-4xl font-bold text-ink">
          <span aria-hidden className="me-3">
            🕌
          </span>
          ديني الجميل
        </h1>
        <p className="mt-3 max-w-3xl text-child-base text-ink-soft">
          دروس هادئة للأطفال: من ربّي؟ من نبيّي؟ أركان الإسلام والإيمان، الوضوء والصلاة، والاستماع إلى سور قصيرة.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/quran"
            className="inline-flex min-h-touch items-center gap-2 rounded-xl2 bg-sky-100 px-6 text-child-base font-bold text-sky-800 shadow-soft"
          >
            <span aria-hidden>📖</span> الاستماع للقرآن الكريم
          </Link>
        </div>
      </header>

      <aside className="rounded-xl2 border border-grape-200 bg-grape-50 p-5 text-child-sm text-grape-700" role="note">
        <p className="font-bold">ملاحظة للأهل والأخصائي</p>
        <p className="mt-2">
          المحتوى الديني يُقدَّم باحترام وهدوء، ويُراجَع نصاً وصوتاً من مصدر موثوق قبل النشر الموسّع. في درس «من نبيّي؟»
          تُنطق الصلاة على النبي ﷺ كاملة في التسجيل، ولا تُختصر. لا تُستخدم قراءة آلية للقرآن، والتلاوات تسجيلات حقيقية.
        </p>
      </aside>

      <section className="space-y-4" aria-labelledby="faith-skills-title">
        <h2 id="faith-skills-title" className="font-display text-child-lg font-bold text-ink">
          الدروس ({skills.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
