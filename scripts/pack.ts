/**
 * تجهيز نسخة قابلة للنقل — خطوتي 📦
 *
 * الغرض: توليد ملف واحد (tar.gz) يحتوي المشروع كاملاً بلا node_modules ولا .next،
 *         فيُنقل إلى أي حاسوب ويُشغَّل عليه بأمرين.
 *
 * الاستخدام:
 *   npm run pack              # يكتب khatwati-portable.tar.gz في جذر المشروع
 *   npm run pack -- <مسار>    # يكتب الملف في مسار آخر (مثل /tmp إن كانت المساحة ضيقة)
 *
 * ملاحظة حجم: مجلد الأصوات (public/audio ≈ 53MB) يُضمَّن كما هو لأنه جزء من المنتج؛
 *               إن أردت نسخة أصغر: npm run pack -- /tmp --no-audio
 */
import { spawnSync } from 'node:child_process';
import { existsSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2).filter((a) => a !== '--');
const noAudio = args.includes('--no-audio');
const outArg = args.find((a) => !a.startsWith('--'));
const out = outArg ? join(outArg, 'khatwati-portable.tar.gz') : join(ROOT, 'khatwati-portable.tar.gz');

// ملف تعليمات يوضع داخل الحزمة
const readme = `# تشغيل موقع «خطوتي» على حاسوبك 🌱

## المتطلبات
- Node.js إصدار 20 أو أحدث (تنزيل: nodejs.org)

## التشغيل (أمران فقط)
\`\`\`bash
npm ci        # تثبيت المكتبات (يحتاج إنترنت مرة واحدة)
npm run build && npm run start
\`\`\`
ثم افتح المتصفح على: http://localhost:3000

## للتطوير
\`\`\`bash
npm run dev
\`\`\`

## فحوص ما قبل النشر
\`\`\`bash
npm run verify     # التغطية + الصوت + التراخيص + سلامة الأنشطة
npm run coverage   # تقرير التغطية لكل محور
npm run build      # بناء الإنتاج
\`\`\`

## ملاحظات
- الموقع كامل بلا أي خدمة خارجية: كل المحتوى والأصوات والصور داخل المشروع.
- إن نقصت ملفات صوتية أو أردت إعادة توليدها: \`npm run voice-restore\` (يحتاج إنترنت).
- تلاوات القرآن ملفات حقيقية داخل المشروع ولا تُولَّد آلياً إطلاقاً.
- التفاصيل: README.md و docs/.
`;
writeFileSync(join(ROOT, 'تشغيل-محلي.md'), readme, 'utf8');

const excludes = ['--exclude=./node_modules', '--exclude=./.next', '--exclude=./khatwati-portable.tar.gz', '--exclude=./.git'];
if (noAudio) excludes.push('--exclude=./public/audio/voice');

const r = spawnSync('tar', ['czf', out, ...excludes, '.'], { cwd: ROOT, maxBuffer: 1024 * 1024 * 1024 });
if (r.status !== 0) {
  console.error('✗ فشل إنشاء الحزمة:', (r.stderr ?? '').toString().slice(0, 300));
  process.exit(1);
}
const mb = (statSync(out).size / 1024 / 1024).toFixed(1);
console.log(`✓ الحزمة جاهزة: ${out} (${mb} م.ب)`);
console.log('  انقلها إلى أي حاسوب، ثم: npm ci && npm run build && npm run start');
if (noAudio) console.log('  (بلا ملفات الأصوات — أعِد توليدها بـnpm run voice-restore)');
