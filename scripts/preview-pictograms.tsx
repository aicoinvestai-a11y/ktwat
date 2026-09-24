/**
 * معاينة مكتبة الرسوم الأصلية (Pictograms)
 * يُشغَّل: `npx tsx scripts/preview-pictograms.tsx` → docs/pictograms-preview.html
 * الصفحة مستقلة تماماً (كل الأنماط مضمّنة، بلا أي مورد خارجي).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { PICTOGRAMS } from '../components/illustrations/Pictograms';

const ROOT = join(__dirname, '..');
const entries = Object.entries(PICTOGRAMS);

const cells = entries
  .map(
    ([key, art]) => `
    <figure class="cell">
      <div class="art">${renderToStaticMarkup(art as React.ReactElement)}</div>
      <figcaption>${key}</figcaption>
    </figure>`,
  )
  .join('');

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>مكتبة الرسوم الأصلية — خطوتي</title>
</head>
<body style="margin:0;background:#fbfaf7;color:#26313d;font-family:system-ui,'Segoe UI',Tahoma,sans-serif">
  <header style="background:#fff;border-bottom:1px solid #e8e4db;padding:24px 20px">
    <h1 style="margin:0 0 6px;font-size:28px">مكتبة الرسوم الأصلية 🌱</h1>
    <p style="margin:0;color:#4c5b6b;font-size:17px;line-height:1.9">
      ${entries.length} رسمة SVG مسطّحة صُمّمت داخل الموقع، وتُعرض تلقائياً في كل مكان بدل العنصر النائب.
      تُستخدم في الخيارات والبطاقات ومشاهد القصص ولوحة التواصل.
    </p>
  </header>
  <main style="padding:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:14px;max-width:1100px;margin:0 auto">
    ${cells}
  </main>
  <footer style="padding:24px 20px;color:#6f7f90;font-size:15px">
    سياسة الرسوم: لإضافة رسمة جديدة، أضفها في <code>components/illustrations/Pictograms.tsx</code> بمفتاح هو قيمة العنصر الحالية،
    فتُستبدل تلقائياً في كل الموقع بلا تعديل أي ملف بيانات. ولتحديث النِسَب شغّل <code>npm run report</code>.
  </footer>
  <style>
    .cell{margin:0;background:#fff;border:1px solid #e8e4db;border-radius:28px;padding:14px;display:flex;flex-direction:column;align-items:center;gap:8px;box-shadow:0 6px 20px -8px rgba(38,49,61,.18)}
    .art{width:72px;height:72px}
    figcaption{font-size:15px;color:#4c5b6b}
  </style>
</body>
</html>`;

mkdirSync(join(ROOT, 'docs'), { recursive: true });
writeFileSync(join(ROOT, 'docs/pictograms-preview.html'), html, 'utf8');
console.log(`✓ تم توليد المعاينة: docs/pictograms-preview.html (${entries.length} رسمة)`);
