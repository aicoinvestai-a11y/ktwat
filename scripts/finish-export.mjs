/**
 * لمسات ما بعد التصدير الساكن — خطوتي
 *
 * 1) تعويض المسار الفرعي (GitHub Pages: /ktwat):
 *    Next.js يضيف basePath إلى روابط الصفحات وملفات _next تلقائياً، لكن مسارات الوسائط
 *    المكتوبة في الشيفرة (/audio/…، /images/…، /fonts/…، /icons/…، /sw.js، /manifest.webmanifest،
 *    /search-index.json) تبقى مطلقة — فنُضيف إليها البادئة في ناتج البناء فقط (لا نلمس الشيفرة).
 *    بلا هذا التعديل يظهر الموقع بلا تنسيق ولا صوت على GitHub Pages.
 * 2) .nojekyll : يمنع Jekyll من تجاهل مجلد _next.
 * 3) 404.html  : صفحة الخطأ التي تخدمها الاستضافات الثابتة.
 * 4) تحقّق نهائي من سلامة الناتج (صفحات، أصوات، خطوط، وجود البادئة).
 *
 * الاستخدام: npm run export:pages   (يضبط NEXT_PUBLIC_BASE_PATH=/ktwat)
 */
import { existsSync, writeFileSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

if (!existsSync(OUT)) {
  console.error('✗ لا يوجد مجلد out/ — فشل التصدير');
  process.exit(1);
}

/** تعويض البادئة في ملف نصي واحد */
function patchFile(file, replacements) {
  const before = readFileSync(file, 'utf8');
  let after = before;
  for (const [from, to] of replacements) {
    after = after.split(from).join(to);
  }
  if (after !== before) writeFileSync(file, after, 'utf8');
}

const TEXT_EXT = new Set(['.html', '.js', '.json', '.webmanifest', '.css', '.txt', '.mjs']);
const walk = (dir, cb) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, cb);
    else cb(p);
  }
};

if (BASE) {
  // مسارات الوسائط العامة: "/audio/ → "/ktwat/audio/ … مع مراعاة الحالتين " و '
  const prefixes = ['/audio/', '/images/', '/fonts/', '/icons/', '/search-index.json', '/sw.js', '/manifest.webmanifest'];
  const replacements = [];
  for (const pre of prefixes) {
    for (const quote of ['"', "'", '`']) {
      replacements.push([`${quote}${pre}`, `${quote}${BASE}${pre}`]);
    }
  }
  // داخل ملف العامل (sw.js): القائمة الأساسية وصفحات مخزّنة بمسار جذري
  const swReplacements = [
    ["'/guide'", `'${BASE}/guide'`],
    ["'/offline'", `'${BASE}/offline'`],
    ["'/',", `'${BASE}/',`],
  ];

  // ملف التطبيق (manifest): نضبط مسار البداية ونطاقه بتحرير JSON مباشرة (أدق من الاستبدال النصي)
  for (const name of ['manifest.webmanifest', 'manifest.json']) {
    const mf = join(OUT, name);
    if (!existsSync(mf)) continue;
    try {
      const data = JSON.parse(readFileSync(mf, 'utf8'));
      data.start_url = `${BASE}/`;
      data.scope = `${BASE}/`;
      if (data.id) data.id = `${BASE}/`;
      writeFileSync(mf, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✓ ${name}: start_url وscope صارا ${BASE}/`);
    } catch {
      console.error(`✗ تعذّر تحرير ${name}`);
    }
  }

  let patched = 0;
  walk(OUT, (file) => {
    const ext = file.slice(file.lastIndexOf('.'));
    if (!TEXT_EXT.has(ext)) return;
    const isSw = file.endsWith('sw.js');
    patchFile(file, isSw ? [...replacements, ...swReplacements] : replacements);
    patched++;
  });
  console.log(`✓ عُوّضت البادئة "${BASE}" في ${patched} ملفاً نصياً`);
  console.log('  (روابط الصفحات وملفات _next يضيفها Next.js تلقائياً عبر basePath)');
}

writeFileSync(join(OUT, '.nojekyll'), '');
const notFound = join(OUT, '404.html');
if (!existsSync(notFound)) {
  writeFileSync(
    notFound,
    `<!doctype html><meta charset="utf-8"><title>لم نجد هذه الصفحة</title><p>الصفحة غير موجودة — <a href="${BASE || ''}/">العودة إلى الرئيسية</a></p>`,
  );
}

const count = (dir, filter = () => true) => (existsSync(dir) ? readdirSync(dir).filter(filter).length : 0);
const htmlPages = [];
walk(OUT, (p) => {
  if (p.endsWith('.html')) htmlPages.push(p);
});
const voice = count(join(OUT, 'audio', 'voice'), (f) => f.endsWith('.mp3'));
const quran = count(join(OUT, 'audio', 'quran'), (f) => f.endsWith('.mp3'));
const fonts = count(join(OUT, 'fonts'), (f) => f.endsWith('.ttf'));
let total = 0;
walk(OUT, (p) => (total += statSync(p).size));

console.log('✓ .nojekyll و 404.html جاهزان');
console.log(`  صفحات HTML: ${htmlPages.length} • أصوات: ${voice} • تلاوات: ${quran} • خطوط: ${fonts}`);
console.log(`  حجم out/: ${(total / 1024 / 1024).toFixed(1)} م.ب`);
if (voice < 800) {
  console.error('✗ عدد الأصوات أقل من المتوقع — تحقق من public/audio');
  process.exit(1);
}
if (BASE && !readFileSync(join(OUT, 'index.html'), 'utf8').includes(`${BASE}/_next/`)) {
  console.error(`✗ البادئة ${BASE} غير مطبَّقة على ملفات _next في index.html`);
  process.exit(1);
}
