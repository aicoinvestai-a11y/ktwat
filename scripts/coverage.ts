/**
 * Content Coverage Checker — خطوتي
 * يقارن بنود الاستمارة الأصلية (المصدر) بما هو مبني فعلاً في الموقع.
 * المشروع لا يُعدّ مكتملاً إذا كان missingSkills > 0.
 */
import { allSourceItems, sourceStats } from '../data/source/inventory';
import { DOMAINS } from '../data/taxonomy';
import { allSkills } from '../data/skills';
import { religiousReviewRequired } from '../data/skills/religion';

const skillsBySourceId = new Map<string, number>();
for (const s of allSkills) {
  skillsBySourceId.set(s.sourceId, (skillsBySourceId.get(s.sourceId) ?? 0) + 1);
}

const missing = allSourceItems.filter((i) => !skillsBySourceId.has(i.id));
const duplicated = allSkills.filter((s) => (skillsBySourceId.get(s.sourceId) ?? 0) > 1);
const noActivity = allSkills.filter((s) => s.activities.length === 0);

const stats = sourceStats();
const line = (label: string, value: string | number) => console.log(`${label.padEnd(34, ' ')} ${value}`);

console.log('\n════════════════════════════════════════════════════');
console.log('  تقرير التغطية — خطوتي');
console.log('  المصدر: استمارة التقييم والتدريب (22 صفحة)');
console.log('════════════════════════════════════════════════════\n');

for (const d of DOMAINS) {
  const srcCount = allSourceItems.filter((i) => i.domain === d.id).length;
  const siteCount = allSkills.filter((s) => s.domain === d.id).length;
  const miss = missing.filter((i) => i.domain === d.id).length;
  console.log(`المحور ${d.order}: ${d.title}`);
  line('  عدد البنود في المصدر:', srcCount);
  line('  عدد البنود في الموقع:', siteCount);
  line('  غير المكتمل:', miss);
  console.log('');
}

console.log('──────────────── الأقسام (17 قسماً) ────────────────');
for (const [cat, count] of Object.entries(stats.byCategory)) {
  const built = allSkills.filter((s) => s.category === cat).length;
  const flag = built === 0 ? '❌' : built < count ? '⚠️' : '✅';
  console.log(`${flag} ${cat.padEnd(22, ' ')} المصدر: ${String(count).padStart(2)}  |  الموقع: ${String(built).padStart(2)}`);
}

console.log('\n──────────────── الإجماليات ────────────────');
line('عدد المحاور:', DOMAINS.length);
line('عدد الأقسام:', stats.categories);
line('عدد البنود في المصدر:', stats.total);
line('عدد المهارات في الموقع:', allSkills.length);
line('البنود التي لها مهارة واحدة أو أكثر:', allSourceItems.length - missing.length);
line('البنود بدون محتوى (missingSkills):', missing.length);
line('مهارات بلا نشاط:', noActivity.length);
line('بنود لها أكثر من مهارة (مسموح):', duplicated.length);
line('صفحات المصدر المغطاة:', `${stats.pages.length} / 21 (ص2-22)`);
line('بنود تحتاج مراجعة (OCR):', stats.needsReview.length);
line('مهارات تحتاج مراجعة (OCR):', allSkills.filter((s) => s.needsReview).length);
line('بنود تحتاج مراجعة شرعية قبل النشر:', religiousReviewRequired.length);
line('مهارات تتطلب إشرافاً:', allSkills.filter((s) => s.supervisorRequired).length);
line('مهارات حساسة للسلامة:', allSkills.filter((s) => s.safetyLevel === 'safety-sensitive').length);

if (missing.length > 0) {
  console.log('\n❌ بنود بدون محتوى:');
  for (const m of missing) console.log(`   - ${m.id} (ص${m.sourcePage}) ${m.originalText}`);
}
if (noActivity.length > 0) {
  console.log('\n❌ مهارات بلا أنشطة:');
  for (const s of noActivity) console.log(`   - ${s.id} ${s.childFriendlyTitle}`);
}

const ok = missing.length === 0 && noActivity.length === 0;
console.log('\n' + (ok ? '✅ التغطية كاملة: كل بند في الاستمارة له نشاط في الموقع.' : '❌ المشروع غير مكتمل: missingSkills > 0'));
console.log('════════════════════════════════════════════════════\n');

process.exit(ok ? 0 : 1);
