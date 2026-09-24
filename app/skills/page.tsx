import { allSkills } from '@/data/skills';
import { SkillsExplorer, type SkillListItem } from '@/components/skills/SkillsExplorer';

export const metadata = { title: 'كل المهارات — خطوتي' };

export default function SkillsPage() {
  const items: SkillListItem[] = allSkills.map((s) => ({
    id: s.id,
    title: s.childFriendlyTitle,
    icon: s.icon.value,
    domain: s.domain,
    category: s.category,
    modes: s.trainingMode,
    supervisorRequired: s.supervisorRequired,
    safetyLevel: s.safetyLevel,
    sourcePage: s.sourcePage,
    originalText: s.originalText,
  }));

  return (
    <div className="space-y-8">
      <header className="rounded-xl3 bg-paper-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-4xl font-bold text-ink">
          <span aria-hidden className="me-3">
            🗂️
          </span>
          كل المهارات
        </h1>
        <p className="mt-3 max-w-3xl text-child-base text-ink-soft">
          كل بنود «استمارة التقييم والتدريب لمنتفعي المراكز النهارية الدامجة» ({allSkills.length} بنداً) مع النص الأصلي كما هو،
          وأرقام الصفحات — مرتبة للأهل والأخصائي، مع بحث وفلاتر.
        </p>
      </header>

      <SkillsExplorer skills={items} />
    </div>
  );
}
