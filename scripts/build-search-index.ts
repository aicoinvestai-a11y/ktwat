/**
 * فهرس البحث — خطوتي
 *
 * يولّد `public/search-index.json`: فهرس خفيف فيه ما يكفي للبحث والعرض فقط، حتى تُحمَّل
 * صفحة البحث عند الطلب بدل تحميل كل بيانات المهارات إلى المتصفح.
 * الحقول مختصرة لتقليل الحجم: t عنوان مبسّط، o نص أصلي، k كلمات مفتاحية،
 * c قسم، p صفحة المصدر، i رمز المهارة (نوع/قيمة).
 *
 * الاستخدام: npm run search-index
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { allSkills } from '../data/skills';
import { categoryById } from '../data/taxonomy';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..');

const rows = allSkills.map((s) => ({
  id: s.id,
  t: s.childFriendlyTitle,
  o: s.originalText,
  k: s.keywords.join(' '),
  c: categoryById[s.category]?.title ?? '',
  p: s.sourcePage,
  i: s.icon,
}));

const out = { generatedFor: 'خطوتي', count: rows.length, rows };
const file = join(ROOT, 'public', 'search-index.json');
writeFileSync(file, JSON.stringify(out), 'utf8');
const kb = (JSON.stringify(out).length / 1024).toFixed(0);
console.log(`✓ فهرس البحث: ${rows.length} مهارة (${kb} ك.ب) → public/search-index.json`);
