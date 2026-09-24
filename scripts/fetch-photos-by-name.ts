/**
 * جلب صور حقيقية بأسماء ملفات محدّدة — خطوتي
 * يُشغَّل: `npx tsx scripts/fetch-photos-by-name.ts`
 * ------------------------------------------------------------------
 * يُستخدم لتكملة الجالب `fetch-photos.ts` عندما يكون البحث العام غير دقيق:
 * نُسمّي مرشّحين بترتيب الأفضلية، والأداة تتحقق من:
 *   1) أن الملف موجود على Wikimedia Commons.
 *   2) أن ترخيصه ضمن: CC0 / Public domain / CC BY / CC BY-SA (بلا NC/ND).
 *   3) ألا يكون الوصف أو العنوان عن أشخاص أو شعارات أو كحول.
 * ثم تنزّل نسخة بعرض 900px وتوثّق المصدر والترخيص في data/image-licenses.json.
 */
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public/images/real');
const LICENSE_FILE = join(ROOT, 'data/image-licenses.json');
const UA = 'KhatwatiBot/1.0 (educational Arabic children project; contact: local)';

/** كل مفتاح: مرشّحون بأسماء ملفات حقيقية على Commons بترتيب الأفضلية */
const PLAN: { key: string; slug: string; alt: string; files: string[] }[] = [
  {
    key: '🧽',
    slug: 'sponge',
    alt: 'إسفنجة تنظيف حقيقية',
    files: ['Pink Sponge isolated on White Background.jpg', 'Cleaning sponge.jpg', 'Plastic cleaning sponges.jpg'],
  },
  {
    key: '🥛',
    slug: 'milk',
    alt: 'كوب حليب حقيقي',
    files: ['Glass of milk.jpg', 'Glass milk bottle cardboard cap and opener.jpg', 'Bowl milk glass.jpg'],
  },
  {
    key: '🧺',
    slug: 'basket',
    alt: 'سلة حقيقية',
    files: ['Wicker basket.jpg', 'Basket made of wicker.jpg', 'Eggs in basket 2020 G1.jpg', 'Beetroots in a basket.jpg'],
  },
  {
    key: '🚰',
    slug: 'tap',
    alt: 'صنبور ماء حقيقي',
    files: ['Modern faucet.jpg', 'Kitchen tap.jpg', 'Chrome faucet.jpg', 'Tap water.jpg'],
  },
  {
    key: '🪚',
    slug: 'saw',
    alt: 'منشار يدوي حقيقي',
    files: ['Hand saw.jpg', 'Tenon saw.jpg', 'Panel saw.jpg', 'Wood saw.jpg'],
  },
  {
    key: '🎨',
    slug: 'paints',
    alt: 'ألوان رسم حقيقية',
    files: ['Watercolor paints.jpg', 'Watercolor palette.jpg', 'Paint box.jpg', 'Gouache.jpg'],
  },
  {
    key: '🥄',
    slug: 'spoon',
    alt: 'ملعقة طعام حقيقية',
    files: ['Teaspoon.jpg', 'Dessert spoon.jpg', 'Stainless steel spoon.jpg', 'Spoon.jpg'],
  },
  {
    key: '🍯',
    slug: 'honey',
    alt: 'عسل حقيقي في شمع العسل',
    files: ['Honeycomb.jpg', 'Honey comb.jpg', 'Honey in jar with honey dipper.jpg', 'Honey jar (411317929).jpg'],
  },
  {
    key: '🥢',
    slug: 'chopsticks',
    alt: 'عيدان طعام حقيقية',
    files: ['Chopsticks.jpg', 'Wooden chopsticks.jpg', 'Disposable chopsticks.jpg', 'Ippon chopsticks.jpg'],
  },
];

const OK_LICENSE = /^(cc0|public domain|cc by(?!-nc)|cc by-sa|pd\b|no restrictions)/i;
const BAD = /(person|people|man\b|woman|child|girl|boy|portrait|crowd|nude|alcohol|beer|wine|whisky|vodka|sake|cigarette|tobacco|museum|logo|coat of arms)/i;

const sleepMs = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clean = (h?: string) => (h ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

async function fetchRetry(url: string, tries = 5): Promise<Response> {
  let wait = 5000;
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status !== 429 && res.status !== 503) return res;
    console.log(`    … ${res.status}: انتظار ${Math.round(wait / 1000)}ث`);
    await sleepMs(wait);
    wait = Math.min(wait * 2, 60000);
  }
  return fetch(url, { headers: { 'User-Agent': UA } });
}

async function infoFor(title: string) {
  const url =
    'https://commons.wikimedia.org/w/api.php?' +
    new URLSearchParams({
      format: 'json',
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiurlwidth: '900',
      titles: `File:${title}`,
    });
  const res = await fetchRetry(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = (await res.json()) as any;
  const page: any = Object.values(j.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined) throw new Error('الملف غير موجود');
  const ii = page.imageinfo?.[0];
  if (!ii?.thumburl) throw new Error('لا نسخة مصغّرة');
  const meta = ii.extmetadata ?? {};
  const license = clean(meta.LicenseShortName?.value);
  const desc = clean(meta.ImageDescription?.value);
  if (!OK_LICENSE.test(license)) throw new Error(`ترخيص غير مقبول: ${license || 'غير معروف'}`);
  if (BAD.test(page.title) || BAD.test(desc)) throw new Error('العنوان/الوصف يستبعد هذا الملف (أشخاص/رموز/كحول)');
  return {
    title: String(page.title).replace(/^File:/, ''),
    thumburl: ii.thumburl as string,
    credit: clean(meta.Artist?.value) || 'Wikimedia Commons',
    license,
    licenseUrl: clean(meta.LicenseUrl?.value),
    descriptionUrl: (ii.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`) as string,
  };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const parsed = existsSync(LICENSE_FILE) ? JSON.parse(readFileSync(LICENSE_FILE, 'utf8')) : {};
  const items: Record<string, any> = parsed.items ?? {};

  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? new Set(onlyArg.replace('--only=', '').split(',').filter(Boolean)) : null;
  const plan = only ? PLAN.filter((w) => only.has(w.key)) : PLAN;
  console.log('عناصر هذه الجولة:', plan.length);
  for (const want of plan) {
    let ok = false;
    for (const title of want.files) {
      try {
        await sleepMs(5000);
        const info = await infoFor(title);
        const res = await fetchRetry(info.thumburl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 3000) throw new Error('ملف صغير جداً');
        writeFileSync(join(OUT_DIR, `${want.slug}.jpg`), new Uint8Array(buf));
        items[want.key] = {
          slug: want.slug,
          emoji: want.key,
          src: `/images/real/${want.slug}.jpg`,
          alt: want.alt,
          commonsTitle: info.title,
          credit: info.credit,
          license: info.license,
          licenseUrl: info.licenseUrl,
          sourceUrl: info.descriptionUrl,
          bytes: buf.length,
          retrieved: new Date().toISOString().slice(0, 10),
        };
        console.log(`✓ ${want.key} ${want.slug} ← ${info.title} [${info.license}] ${Math.round(buf.length / 1024)}KB`);
        ok = true;
        break;
      } catch (e) {
        console.log(`  ✗ ${title}: ${(e as Error).message}`);
      }
    }
    if (!ok) console.log(`‼️ لم يُعثر على صورة مقبولة لـ${want.key} (${want.slug})`);
  }

  writeFileSync(
    LICENSE_FILE,
    JSON.stringify(
      {
        note: parsed.note ?? 'صور حقيقية من Wikimedia Commons بتراخيص حرّة (CC0/PD/CC BY/CC BY-SA فقط). لا صور لأشخاص.',
        retrieved: new Date().toISOString().slice(0, 10),
        items: Object.fromEntries(Object.entries(items).sort(([a], [b]) => a.localeCompare(b, 'ar'))),
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
  console.log(`\n✓ مجموع الصور الموثّقة: ${Object.keys(items).length}`);
}

main();
