/**
 * ورقة مراجعة الصور الحقيقية — خطوتي
 * ------------------------------------------------
 * يُشغَّل: `npx tsx scripts/photos-review.tsx`
 * يحتاج `sharp` (أداة تطوير فقط، تُثبَّت يدوياً: `npm i --no-save sharp`).
 * المخرجات:
 *   docs/photos-review.png    ورقة صور مرقّمة للمراجعة البصرية (ترتيبها = ترقيم ملف النسب).
 *   docs/photos-credits.md    جدول النسب والتراخيص بالأرقام نفسها.
 * الهدف: أن يبقى قرار «هل الصورة مناسبة لطفل؟» قراراً بشرياً موثّقاً، لا آلياً فقط.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import type { OverlayOptions } from 'sharp';
import { allPhotos } from '../data/photos';

const ROOT = join(__dirname, '..');
const COLS = 6;
const CELL = 200;

async function main() {
  const photos = allPhotos.filter((p) => existsSync(join(ROOT, 'public', p.src)));
  if (!photos.length) throw new Error('لا توجد صور — شغّل scripts/fetch-photos.ts أولاً');

  const composites: OverlayOptions[] = [];
  for (let i = 0; i < photos.length; i++) {
    const img = await sharp(join(ROOT, 'public', photos[i].src))
      .resize(CELL - 12, CELL - 12, { fit: 'contain', background: '#ffffff' })
      .toBuffer();
    composites.push({ input: img, left: (i % COLS) * CELL + 6, top: Math.floor(i / COLS) * CELL + 6 });
  }
  const rows = Math.ceil(photos.length / COLS);
  mkdirSync(join(ROOT, 'docs'), { recursive: true });
  await sharp({ create: { width: COLS * CELL, height: rows * CELL, channels: 3, background: '#e9e9e4' } })
    .composite(composites)
    .png()
    .toFile(join(ROOT, 'docs/photos-review.png'));

  const lines: string[] = [];
  lines.push('# جدول الصور الحقيقية — النسب والتراخيص');
  lines.push('');
  lines.push('> ترقيم هذا الجدول يطابق ترقيم ورقة المراجعة البصرية `docs/photos-review.png` (من اليسار إلى اليمين، سطراً سطراً).');
  lines.push('> الشرط: كل صورة بترخيص CC0 / ملكية عامة / CC BY / CC BY-SA، وبلا أشخاص. يُفرض آلياً في `npm run verify`.');
  lines.push('');
  lines.push('| # | العنصر | ما تصوّره | المؤلف | الترخيص | المصدر | مناسب لطفل؟ (مراجعة بشرية) |');
  lines.push('| ---: | :---: | --- | --- | --- | --- | --- |');
  photos.forEach((p, i) => {
    lines.push(
      `| ${i + 1} | ${p.key} | ${p.alt} | ${p.credit} | [${p.license}](${p.licenseUrl || p.sourceUrl}) | [${p.title}](${p.sourceUrl}) | ☐ نعم / ☐ تُستبدل |`,
    );
  });
  lines.push('');
  lines.push(`المجموع: **${photos.length}** صورة.`);
  lines.push('');
  lines.push('ملاحظة: أي صورة يُقرَّر استبدالها تُحذف من `data/image-licenses.json` ومن `public/images/real` ثم يُعاد العرض بـ`npx tsx scripts/photos-review.tsx`.');
  lines.push('');

  writeFileSync(join(ROOT, 'docs/photos-credits.md'), lines.join('\n'), 'utf8');
  console.log(`✓ docs/photos-review.png (${photos.length} صورة) و docs/photos-credits.md`);
}

main();
