/**
 * ورقة المراجعة البشرية — خطوتي
 * يُشغَّل: `npm run review-sheet` → docs/review-sheet.md
 *
 * الهدف: تجهيز كل ما يحتاج تحقّقاً بشرياً في مكان واحد، بلا تعديل أي محتوى:
 *   أ) بنود الاستمارة التي وُسمت needsReview بسبب غموض OCR أو التباس طباعي.
 *   ب) بنود المحتوى الديني (24 بنداً) التي تحتاج مراجعة مصدر موثوق قبل النشر الموسّع،
 *      وتشمل: النصوص القرآنية المستخدمة، وأسماء السور وتلاواتها.
 * الورقة لا تُعدّل شيئاً: هي قائمة فحص للشخص المراجع، والنتيجة تُدوَّن في ملفات البيانات.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { allSkills } from '../data/skills';
import surahData from '../data/quran/surahs.json';
import { allPhotos, PHOTO_NOTE, PHOTO_RETRIEVED } from '../data/photos';
import { categoryById, domainById } from '../data/taxonomy';
import { QURAN_SURAHS } from '../lib/audio/library';

const ROOT = join(__dirname, '..');

const surahs = (surahData as { source: string; surahs: Record<string, { ayahs: string[] }> }).surahs;
const surahDataSource = (surahData as { source: string }).source;
const ayahCount = (n: number) => surahs[String(n)]?.ayahs.length ?? 0;

const needsReview = allSkills.filter((s) => s.needsReview);
const religion = allSkills.filter((s) => s.category === 'islamic');

const activityTypes = (s: (typeof allSkills)[number]) =>
  [...new Set(s.activities.map((a) => a.type))].join('، ');

const surahsUsed = new Set<string>();
for (const s of religion) {
  for (const a of s.activities) {
    if (a.type === 'listen-player' || a.type === 'story') {
      const raw = JSON.stringify(a);
      for (const surah of QURAN_SURAHS) if (raw.includes(surah.name)) surahsUsed.add(surah.name);
    }
  }
}

const lines: string[] = [];
lines.push('# ورقة المراجعة البشرية — خطوتي');
lines.push('');
lines.push('> هذه الورقة **قائمة فحص** جاهزة للشخص المراجع (أخصائي/معلّم/مراجع موثوق). لا تُعدّل هذه الورقة أي محتوى.');
lines.push('> بعد التحقّق، تُدوَّن النتيجة في حقول المهارة داخل ملفات `data/skills/*.ts` ثم يُشغَّل `npm run verify`.');
lines.push('');
lines.push(
  `<!-- counts: needsReview=${needsReview.length} religion=${religion.length} surahs=${QURAN_SURAHS.length} photos=${allPhotos.length} -->`,
);
lines.push('');
lines.push('## كيف نراجع؟ (قواعد ثابتة في هذا المشروع)');
lines.push('');
lines.push('1. **النص الأصلي مقدّس**: `originalText` يُطابق الاستمارة حرفياً ولا يُعدّل أبداً. أي تعديل للصياغة يكون في `childFriendlyInstruction` فقط.');
lines.push('2. **لا اختلاق**: إذا كان النص غير واضح، يبقى البند بوسم `needsReview` ويُذكر سبب الغموض — ولا يُحذف ولا يُخمَّن.');
lines.push('3. **الدقة قبل السرعة** في كل ما يتصل بالمحتوى الديني: لا إضافة نص، ولا حذف، ولا تشكيل من الذاكرة.');
lines.push('4. لا تقييم ولا درجات ولا تشخيص: المراجعة تخصّ **صحة النص** و**سلامة النشاط** فقط.');
lines.push('');
lines.push('### سجلّ المراجعة');
lines.push('');
lines.push('| رقم المراجعة | التاريخ | المراجع (الاسم/الجهة) | الملف / البند | النتيجة | ملاحظات |');
lines.push('| ---: | --- | --- | --- | --- | --- |');
for (let i = 1; i <= 6; i++) lines.push(`| ${i} |  |  |  | مقبول / يحتاج تصحيح / غامض |  |`);
lines.push('');

/* ——— أ) بنود needsReview ——— */
lines.push('## أ) بنود تحتاج مراجعة النص (غموض OCR أو طباعة)');
lines.push('');
lines.push(`العدد: **${needsReview.length}** بنداً. كل بند يبقى ظاهراً في الموقع ولم يُحذف.`);
lines.push('');
for (const s of needsReview) {
  const cat = categoryById[s.category];
  lines.push(`### ${s.id} — ${s.childFriendlyTitle}`);
  lines.push('');
  lines.push(`- **الموضع**: ${domainById[s.domain]?.title} › ${cat?.title} — صفحة المصدر **${s.sourcePage}** / بند **${s.sourceItemNumber}**`);
  lines.push(`- **النص الأصلي كما هو**: «${s.originalText}»`);
  lines.push(`- **سبب الوسم**: ${s.needsReviewNote ?? '—'}`);
  lines.push(`- **المعروض حالياً للطفل**: ${s.childFriendlyInstruction}`);
  lines.push(`- **أنواع الأنشطة**: ${activityTypes(s)}`);
  lines.push('');
  lines.push('فحص المراجع:');
  lines.push('');
  lines.push('- [ ] راجعت النص في صورة الاستمارة (صفحة ' + s.sourcePage + ') وتأكّدت من مطابقتها حرفياً.');
  lines.push('- [ ] تأكّدت أن التبسيط للأطفال لا يغيّر المعنى المقصود.');
  lines.push('- [ ] إن صحّ البند: أُزيل `needsReview` (أو تُرك مع ملاحظة توثيقية إن كان الغموض في الطباعة نفسها).');
  lines.push('- [ ] إن بقي غامضاً: تُحدَّث `needsReviewNote` بوصف أدق دون اختراع نص.');
  lines.push('');
}

/* ——— ب) المحتوى الديني ——— */
lines.push('## ب) بنود المحتوى الديني (مراجعة مصدر موثوق)');
lines.push('');
lines.push(`العدد: **${religion.length}** بنداً — وسم ` + '`reviewStatus: needs-human-review`' + ' قائم حتى تُعتمد.');
lines.push('');
lines.push('### السور المستخدمة في الموقع');
lines.push('');
lines.push(`النص العثماني منقول من: ${surahDataSource}. التلاوة: مشاري العفاسي (ملفات MP3 محلية).`);
lines.push('');
lines.push('| # | السورة | عدد الآيات | التلاوة | حالة المراجعة |');
lines.push('| ---: | --- | --- | --- | --- |');
for (const surah of QURAN_SURAHS) {
  lines.push(
    `| ${surah.number} | ${surah.name} | ${ayahCount(surah.number)} | مشاري العفاسي (MP3 محلي) | ☐ تُراجع الآيات آيةً آية |`,
  );
}
lines.push('');
lines.push('فحص المراجع للقرآن:');
lines.push('');
lines.push('- [ ] النص العثماني مطابق للمصحف المعتمد (رسم الكلمات والتشكيل).');
lines.push('- [ ] التلاوة المسموعة مطابقة للنص المعروض في نفس السورة (بلا سورة أخرى أو ترتيب مختلف).');
lines.push('- [ ] لم يُستخدم أي تحويل نص إلى كلام (TTS) للقرآن في أي مكان بالموقع.');
lines.push('- [ ] عدد الآيات المعروض يطابق المصدر، ولا يوجد توالي آيات خاطئ.');
lines.push('');

lines.push('### البنود');
lines.push('');
for (const s of religion) {
  const cat = categoryById[s.category];
  lines.push(`#### ${s.id} — ${s.childFriendlyTitle}`);
  lines.push('');
  lines.push(`- **الموضع**: صفحة المصدر **${s.sourcePage}** / بند **${s.sourceItemNumber}** — القسم: ${cat?.title}`);
  lines.push(`- **النص الأصلي كما هو**: «${s.originalText}»`);
  lines.push(`- **المعروض للطفل**: ${s.childFriendlyInstruction}`);
  lines.push(`- **نص الاستماع داخل النشاط**: ${s.audioText}`);
  lines.push(`- **أنواع الأنشطة**: ${activityTypes(s)}`);
  lines.push('');
  lines.push('فحص المراجع:');
  lines.push('');
  lines.push('- [ ] النص الديني المذكور (آية/دعاء/حديث/تشهّد) مطابق لمصدر موثوق بلا زيادة أو نقص.');
  lines.push('- [ ] التشكيل وضبط الكلمات صحيح، ولا يوجد خطأ إملائي.');
  lines.push('- [ ] إن كان البند عن الصلاة: تُنطق الصلاة كاملة (مثال: «من نبيك؟» ← «محمّد ﷺ» مع الصلاة كاملة) دون اختصار مُخِل.');
  lines.push('- [ ] المحتوى تعليمي بلا فتوى ولا حكم شرعي ولا تقييم لسلوك الطفل.');
  lines.push('');
  if (s.needsReview) lines.push('> ملاحظة: هذا البند موسوم أيضاً `needsReview` — يُراجع في القسمين.');
  lines.push('');
}

/* ——— د) الصور الحقيقية ——— */
lines.push('## د) الصور الحقيقية (نقطة تحقّق بشرية)');
lines.push('');
lines.push(`العدد: **${allPhotos.length}** صورة — ${PHOTO_NOTE} جُلبت بتاريخ ${PHOTO_RETRIEVED}.`);
lines.push('');
lines.push('الواجهات التي تظهر فيها الصور: مرحلة «جرّب مع المشرف» داخل صفحة المهارة، وبطاقة النشاط المطبوعة، وصفحة «عن الموقع».');
lines.push('ورقة المراجعة البصرية: `docs/photos-review.png` — وجدول النسب بالأرقام نفسها: `docs/photos-credits.md` (يُولَّدان بـ`npx tsx scripts/photos-review.tsx`).');
lines.push('');
lines.push('يفحص المراجع كل صورة في الورقة البصرية ويؤشّر في `docs/photos-credits.md`:');
lines.push('');
lines.push('- [ ] الصورة واضحة ومفهومة لطفل من دون شرح طويل.');
lines.push('- [ ] لا يوجد فيها أشخاص ولا وجوه ولا شعارات تجارية ولا شيء مخيف.');
lines.push('- [ ] الصورة تطابق الشيء المراد تعليمه فعلاً (لا لبس مع شيء آخر).');
lines.push('- [ ] النسبة والترخيص في `docs/photos-credits.md` صحيحة ومقبولة (CC0/PD/CC BY/CC BY-SA).');
lines.push('- [ ] الصور التي عليها شك: تُحذف صفوفها من `data/image-licenses.json` وملفاتها من `public/images/real`، ثم يُعاد التوليد.');
lines.push('');

lines.push('## ج) ملخص أرقام للمراجعة');
lines.push('');
lines.push('| البند | العدد |');
lines.push('| --- | ---: |');
lines.push(`| بنود ` + '`needsReview`' + ` | ${needsReview.length} |`);
lines.push(`| بنود المحتوى الديني | ${religion.length} |`);
lines.push(`| سور الموقع (نص + تلاوة) | ${QURAN_SURAHS.length} |`);
lines.push(`| سور مذكورة في أنشطة دينية (مرشّحة للتحقّق) | ${surahsUsed.size} |`);
lines.push(`| صور حقيقية تحتاج تأشيراً بصرياً | ${allPhotos.length} |`);
lines.push('');
lines.push('> بعد إتمام المراجعة: عدّل ملفات `data/skills/*.ts` فقط، ثم شغّل `npm run verify` و`npm run coverage`، ثم `npm run review-sheet` لتحديث هذه الورقة.');
lines.push('');

mkdirSync(join(ROOT, 'docs'), { recursive: true });
writeFileSync(join(ROOT, 'docs/review-sheet.md'), lines.join('\n'), 'utf8');
console.log(
  `✓ تم توليد ورقة المراجعة: docs/review-sheet.md — needsReview=${needsReview.length}، ديني=${religion.length}، سور=${QURAN_SURAHS.length}`,
);

/* ——— ورقة مراجعة قابلة للطباعة (HTML مستقل، بلا موارد خارجية) ——— */
/** صور صفحات المصدر (تُولَّد من ملف الاستمارة) — تُضمَّن داخل الورقة ليراجعها المراجع بلا بحث */
const pageImage = (n: number): string | null => {
  const f = join(ROOT, `docs/review-pages/page-${String(n).padStart(2, '0')}.jpg`);
  if (!existsSync(f)) return null;
  return `data:image/jpeg;base64,${readFileSync(f).toString('base64')}`;
};
const reviewPages = [...new Set([...needsReview, ...religion].map((s) => s.sourcePage))].sort((a, b) => a - b);

const esc = (v: string) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const itemHtml = (s: (typeof allSkills)[number], printed: boolean) => {
  const cat = categoryById[s.category];
  return `
  <section class="item">
    <h3>${esc(s.id)} — ${esc(s.childFriendlyTitle)} <span class="tag">صفحة ${s.sourcePage} / بند ${s.sourceItemNumber}</span></h3>
    <p class="meta">${esc(domainById[s.domain]?.title ?? '')} › ${esc(cat?.title ?? '')} — أنواع الأنشطة: ${esc(activityTypes(s))}</p>
    <p class="quote">النص الأصلي كما ورد في الاستمارة: «${esc(s.originalText)}»</p>
    ${printed ? `<p class="note"><b>سبب المراجعة:</b> ${esc(s.needsReviewNote ?? '—')}</p>` : ''}
    <p class="note"><b>المعروض حالياً للطفل:</b> ${esc(s.childFriendlyInstruction)}</p>
    <ul class="checks">
      <li>☐ راجعت النص في صورة الاستمارة (صفحة ${s.sourcePage}) وهو مطابق حرفياً — انظر «ملحق صور صفحات المصدر» في آخر الورقة.</li>
      <li>☐ التبسيط للأطفال لا يغيّر المعنى المقصود.</li>
      <li>☐ النشاط آمن ومناسب، وتنبيه الإشراف صحيح.</li>
      <li>☐ النتيجة: <span class="fill">مقبول / يحتاج تصحيح / غامض</span></li>
    </ul>
    <p class="note lines">ملاحظات المراجع: ______________________________________________________________________</p>
  </section>`;
};

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>ورقة المراجعة البشرية — خطوتي</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { --ink:#123047; --soft:#4a6178; --line:#d8e2ea; --sky:#0b6ea8; }
  * { box-sizing: border-box; }
  body { margin:0 auto; max-width: 900px; padding: 24px; background:#fff;
         color: var(--ink); font-family: 'Tajawal','Segoe UI',Tahoma,'Noto Kufi Arabic',sans-serif; line-height:1.9; font-size:16px; }
  h1 { font-size: 1.7rem; margin:0 0 4px; }
  h2 { font-size: 1.25rem; margin: 28px 0 10px; padding-bottom:6px; border-bottom:2px solid var(--line); }
  h3 { font-size: 1.05rem; margin: 18px 0 6px; }
  .lead { color: var(--soft); margin:0 0 8px; }
  .tag { font-size:.78rem; color: var(--soft); font-weight:400; }
  .item { border:1px solid var(--line); border-radius:14px; padding:12px 14px; margin:10px 0; break-inside: avoid; }
  .meta { color: var(--soft); font-size:.85rem; margin:2px 0 8px; }
  .quote { background:#f4f9fd; border-inline-start:4px solid var(--sky); padding:8px 10px; margin:6px 0; border-radius:8px; }
  .note { font-size:.92rem; margin:6px 0; }
  .checks { list-style:none; padding:0; margin:8px 0 4px; font-size:.95rem; }
  .checks li { margin:4px 0; }
  .fill { color: var(--soft); }
  .lines { color: var(--soft); }
  table { width:100%; border-collapse: collapse; margin:8px 0; font-size:.92rem; }
  th, td { border:1px solid var(--line); padding:6px 8px; text-align:right; }
  th { background:#f4f9fd; }
  .rules li { margin:4px 0; }
  .foot { margin-top:24px; color: var(--soft); font-size:.85rem; }
  .ayat { margin:6px 0; padding-inline-start:20px; }
  .ayat li { margin:6px 0; font-size:.95rem; }
  .ayah { font-family: 'Traditional Arabic','Scheherazade New',serif; font-size:1.12rem; }
  .chk { color: var(--soft); font-size:.8rem; white-space:nowrap; }
  figure.page { margin:10px 0; text-align:center; break-inside: avoid; }
  figure.page img { width:100%; max-width:640px; border:1px solid var(--line); border-radius:10px; }
  figure.page figcaption { color: var(--soft); font-size:.8rem; margin-top:4px; }
  @media print {
    body { max-width:none; padding:0 10mm; font-size:13.5px; }
    .item { break-inside: avoid; page-break-inside: avoid; }
    h2 { break-after: avoid; }
  }
</style>
</head>
<body>
  <h1>ورقة المراجعة البشرية — خطوتي 🌱</h1>
  <p class="lead">قائمة فحص للشخص المراجع (أخصائي/معلّم/مراجع موثوق). لا تُعدّل هذه الورقة أي محتوى — بعد التأشير تُدوَّن النتيجة في ملفات المهارات ثم يُشغَّل <b>npm run verify</b>.</p>
  <p class="lead">عدد البنود: ${needsReview.length} بنداً نصياً + ${religion.length} بنداً دينياً • ${QURAN_SURAHS.length} سورة • ${allPhotos.length} صورة حقيقية.</p>

  <h2>قواعد المراجعة</h2>
  <ul class="rules">
    <li>النص الأصلي مقدّس: يُطابق الاستمارة حرفياً ولا يُعدّل — أي تبسيط يكون في نصّ الطفل فقط.</li>
    <li>لا اختلاق: الغامض يبقى موسوماً مع توضيح السبب، ولا يُحذف ولا يُخمَّن.</li>
    <li>الدقة قبل السرعة في المحتوى الديني: لا إضافة ولا حذف ولا تشكيل من الذاكرة.</li>
    <li>لا تقييم للطفل: المراجعة تخصّ صحة النص وسلامة النشاط فقط.</li>
  </ul>

  <h2>أ) بنود تحتاج مراجعة النص (${needsReview.length})</h2>
  ${needsReview.map((s) => itemHtml(s, true)).join('\n')}

  <h2>ب) بنود المحتوى الديني (${religion.length})</h2>
  <h3>السور المستخدمة في الموقع</h3>
  <p class="meta">النص العثماني من: ${esc(surahDataSource)} • التلاوة: تسجيلات كاملة لقارئ معروف (ملفات داخلية، بلا أي نطق آلي).</p>
  <table>
    <thead><tr><th>#</th><th>السورة</th><th>عدد الآيات</th><th>تُراجع آيةً آية</th></tr></thead>
    <tbody>
      ${QURAN_SURAHS.map((s) => `<tr><td>${s.number}</td><td>${esc(s.name)}</td><td>${ayahCount(s.number)}</td><td>☐</td></tr>`).join('\n')}
    </tbody>
  </table>
  <ul class="checks">
    <li>☐ النص العثماني مطابق للمصحف المعتمد (رسم الكلمات والتشكيل).</li>
    <li>☐ التلاوة المسموعة مطابقة للنص المعروض في نفس السورة.</li>
    <li>☐ لا يوجد أي نطق آلي (TTS) للقرآن في أي مكان بالموقع.</li>
    <li>☐ عدد الآيات المعروض يطابق المصدر وترتيبها صحيح.</li>
  </ul>
  <h3>النص الكامل للسور المستخدمة (مراجعة آيةً آية)</h3>
  ${QURAN_SURAHS.map((su) => {
    const ayat = surahs[String(su.number)]?.ayahs ?? [];
    return `<section class="item surah"><h3>${esc(su.name)} <span class="tag">${ayat.length} آية</span></h3>
    <ol class="ayat">${ayat.map((a) => `<li><span class="ayah">${esc(a)}</span> <span class="chk">☐ مطابقة</span></li>`).join('')}</ol></section>`;
  }).join('\n')}
  ${religion.map((s) => itemHtml(s, false)).join('\n')}

  <h2>ج) الصور الحقيقية (${allPhotos.length} صورة)</h2>
  <div class="item">
    <ul class="checks">
      <li>☐ كل صورة مناسبة ثقافياً ومرئياً لطفل، ولا تُظهر أشخاصاً.</li>
      <li>☐ الصورة تعبّر فعلاً عن المهارة الموضوعة لها.</li>
      <li>☐ الاعتماد والرخصة صحيحان في ورقة الاعتمادات (شرط الرخصة).</li>
      <li>☐ الصورة غير المقبولة تُحذف من ملفات البيانات والصور ثم يُعاد التوليد.</li>
    </ul>
  </div>

  <h2>د) سجلّ المراجعة</h2>
  <table>
    <thead><tr><th>#</th><th>التاريخ</th><th>المراجع (الاسم/الجهة)</th><th>النطاق</th><th>النتيجة</th><th>ملاحظات</th></tr></thead>
    <tbody>
      ${[1, 2, 3, 4, 5, 6].map((i) => `<tr><td>${i}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>مقبول / يحتاج تصحيح / غامض</td><td>&nbsp;</td></tr>`).join('\n')}
    </tbody>
  </table>

  <h2>هـ) ملحق: صور صفحات المصدر (${reviewPages.length} صفحة)</h2>
  <p class="meta">مقتطفة من ملف الاستمارة المطبوع للمقارنة الحرفية — تُطبع مع الورقة ويفضَّل مقابلتها بالأصل عند التوقيع.</p>
  ${reviewPages
    .map((n) => {
      const img = pageImage(n);
      if (!img) return `<p class="meta">صفحة ${n}: لم تُولَّد صورتها بعد (شغّل npm run review-pages).</p>`;
      return `<figure class="page"><img src="${img}" alt="صفحة ${n} من الاستمارة"><figcaption>صفحة ${n} من الاستمارة</figcaption></figure>`;
    })
    .join('\n')}

  <p class="foot">بعد إتمام المراجعة: عدّل ملفات <b>data/skills/*.ts</b> فقط، ثم شغّل <b>npm run verify</b> و<b>npm run coverage</b> و<b>npm run review-sheet</b>.</p>
</body>
</html>
`;
writeFileSync(join(ROOT, 'docs/review-sheet.html'), html, 'utf8');
console.log(`✓ ورقة مراجعة قابلة للطباعة: docs/review-sheet.html`);
