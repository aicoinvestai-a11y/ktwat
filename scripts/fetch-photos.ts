/**
 * جالب الصور الحقيقية — خطوتي 🖼️
 * ------------------------------------------------------------------
 * يُشغَّل يدوياً عند الحاجة: `npx tsx scripts/fetch-photos.ts`
 * يجلب صوراً حقيقية **بتراخيص حرّة موثّقة** من Wikimedia Commons للأشياء
 * التي يحتاج الطفل رؤيتها كما هي في الواقع (مرحلة «جرّب مع المشرف»).
 *
 * القواعد المطبَّقة داخل الأداة:
 *  - يعتمد فقط التراخيص: CC0، Public Domain، CC BY، CC BY-SA (بلا NC/ND ولا Fair use).
 *  - يستبعد أي ملف يحتمل احتواءه أشخاصاً أو شعارات أو مخططات (لخصوصية الأطفال ونظافة العرض).
 *  - لا يُعيد التنزيل إن كان الملف موجوداً (إعادة التشغيل آمنة).
 *  - ينتظر بين الطلبات احتراماً لسياسة الخدمة، ويسجّل مصدر كل صورة وترخيصها.
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public/images/real');
const LICENSE_FILE = join(ROOT, 'data/image-licenses.json');
const UA = 'KhatwatiBot/1.0 (educational Arabic children project; contact: local)';

/** العناصر المطلوبة: المفتاح = الرمز في بيانات الموقع، والاسم = ما نبحث عنه بالإنكليزية */
const WANTED: { key: string; slug: string; query: string; alt: string; prefer?: string[] }[] = [
  { key: '🪥', slug: 'toothbrush', query: 'toothbrush', alt: 'فرشاة أسنان حقيقية', prefer: ['Colgate', 'Toothbrush', 'toothbrushes'] },
  { key: '🧼', slug: 'soap', query: 'soap bar', alt: 'قطعة صابون حقيقية', prefer: ['Soap'] },
  { key: '🧽', slug: 'sponge', query: 'cleaning sponge yellow dish', alt: 'إسفنجة تنظيف حقيقية', prefer: ['Sponge', 'sponge', 'Scrub'] },
  { key: '🥄', slug: 'spoon', query: 'stainless steel tablespoon', alt: 'ملعقة طعام حقيقية', prefer: ['Tablespoon', 'Spoon', 'spoon'] },
  { key: '🥛', slug: 'milk', query: 'milk glass pour white', alt: 'كوب حليب حقيقي', prefer: ['Milk', 'milk'] },
  { key: '🥪', slug: 'sandwich', query: 'sandwich on plate', alt: 'شطيرة حقيقية', prefer: ['Sandwich', 'sandwich'] },
  { key: '👟', slug: 'shoes', query: 'sneakers shoes pair', alt: 'حذاء رياضي حقيقي', prefer: ['Sneakers', 'sneaker', 'Shoe'] },
  { key: '🧺', slug: 'basket', query: 'wicker basket empty white background', alt: 'سلة حقيقية', prefer: ['Wicker basket', 'Basket', 'basket'] },
  { key: '🧹', slug: 'broom', query: 'broom sweeping', alt: 'مكنسة حقيقية', prefer: ['Broom', 'broom'] },
  { key: '🪣', slug: 'bucket', query: 'bucket plastic', alt: 'دلو حقيقي', prefer: ['Bucket', 'bucket'] },
  { key: '🧻', slug: 'tissue', query: 'toilet paper roll', alt: 'لفّة مناديل ورقية حقيقية', prefer: ['Toilet paper', 'toilet paper'] },
  { key: '🚪', slug: 'door', query: 'wooden door house', alt: 'باب خشبي حقيقي', prefer: ['Door', 'door'] },
  { key: '🛒', slug: 'cart', query: 'shopping cart supermarket', alt: 'عربة تسوق حقيقية', prefer: ['Shopping cart', 'shopping cart'] },
  { key: '💧', slug: 'water-glass', query: 'glass of water drinking', alt: 'كوب ماء حقيقي', prefer: ['Glass of water', 'water glass'] },
  { key: '🚰', slug: 'tap', query: 'kitchen sink faucet chrome', alt: 'صنبور ماء حقيقي', prefer: ['Faucet', 'Tap', 'faucet'] },
  { key: '🍯', slug: 'honey', query: 'honey glass jar product', alt: 'جرة عسل حقيقية', prefer: ['Honey jar', 'honey', 'Honey'] },
  { key: '🪜', slug: 'ladder', query: 'step ladder aluminium', alt: 'سلّم حقيقي', prefer: ['Ladder', 'ladder', 'Step'] },
  { key: '📏', slug: 'ruler', query: 'plastic ruler centimetre scale', alt: 'مسطرة قياس حقيقية', prefer: ['Ruler', 'ruler', 'Rulers'] },
  { key: '⚽', slug: 'ball', query: 'soccer ball white background', alt: 'كرة قدم حقيقية', prefer: ['Soccer ball', 'Football (ball)', 'ball'] },
  { key: '✂️', slug: 'scissors', query: 'scissors school', alt: 'مقص حقيقي', prefer: ['Scissors', 'scissors'] },
  { key: '🪚', slug: 'saw', query: 'hand saw carpenter tool photo', alt: 'منشار يدوي حقيقي', prefer: ['Hand saw', 'Saw', 'saw'] },
  { key: '🔨', slug: 'hammer', query: 'hammer tool', alt: 'مطرقة حقيقية', prefer: ['Hammer', 'hammer'] },
  { key: '🩹', slug: 'bandage', query: 'adhesive bandage plaster', alt: 'لاصق جروح حقيقي', prefer: ['Band-aid', 'Bandage', 'bandage'] },
  { key: '🧱', slug: 'bricks', query: 'brick wall bricks', alt: 'طوب بناء حقيقي', prefer: ['Brick', 'bricks'] },
  { key: '🖱️', slug: 'computer-mouse', query: 'computer mouse device', alt: 'فأرة حاسوب حقيقية', prefer: ['Computer mouse', 'mouse'] },
  { key: '🪵', slug: 'wood', query: 'firewood logs', alt: 'حطب حقيقي', prefer: ['Firewood', 'wood'] },
  { key: '📿', slug: 'prayer-beads', query: 'misbaha prayer beads', alt: 'مسبحة حقيقية', prefer: ['Misbaha', 'prayer beads', 'Tesbih'] },
  { key: '🎨', slug: 'paints', query: 'watercolor paints palette box', alt: 'ألوان رسم حقيقية', prefer: ['Watercolor', 'Paint', 'paint'] },
  { key: '🧃', slug: 'juice', query: 'orange juice glass breakfast', alt: 'كوب عصير حقيقي', prefer: ['Orange juice', 'Juice', 'juice'] },
  { key: '🥢', slug: 'chopsticks', query: 'chopsticks pair wooden', alt: 'عيدان طعام حقيقية', prefer: ['Chopsticks', 'chopsticks'] },
];

const OK_LICENSE = /^(cc0|public domain|cc by(?!-nc)|cc by-sa|pd\b|no restrictions)/i;
const BAD_FILE = /(map|logo|diagram|chart|flag|coat of arms|signature|poster|person|people|man|woman|child|boy|girl|hand|portrait|crowd|nude|blood|gun|weapon|museum|engraving|drawing|lithograph|painting|1902|1900|1899|1880)/i;
const BAD_DESC = /(people|person|child|children|man|woman|girl|boy|сhildren|family|soldiers|workers|museum|engraving|drawing|lithograph|painting|illustration|coat of arms|logo|alcohol|beer|wine|sake|whisky|vodka|cigarette|tobacco)/i;

type Info = {
  title: string;
  url: string;
  credit: string;
  license: string;
  licenseUrl: string;
  descriptionUrl: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const sleepMs = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** طلب مع إعادة محاولة عند 429 (احتراماً لحدّ المعدّل) */
async function fetchRetry(url: string, tries = 5): Promise<Response> {
  let wait = 4000;
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status !== 429 && res.status !== 503) return res;
    console.log(`    … ${res.status}: انتظار ${Math.round(wait / 1000)}ث`);
    await sleepMs(wait);
    wait = Math.min(wait * 2, 45000);
  }
  return fetch(url, { headers: { 'User-Agent': UA } });
}

async function api(params: Record<string, string>) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', ...params });
  const res = await fetchRetry(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as any;
}

function clean(html: string | undefined) {
  return (html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** يبحث عن مرشّحين بترخيص مقبول ويعيد معلوماتهم */
async function findCandidates(query: string): Promise<Info[]> {
  const search = await api({
    action: 'query',
    list: 'search',
    srsearch: `filetype:bitmap ${query}`,
    srnamespace: '6',
    srlimit: '12',
  });
  const titles: string[] = (search.query?.search ?? []).map((r: any) => r.title).filter((t: string) => !BAD_FILE.test(t));
  if (!titles.length) return [];
  const info = await api({
    action: 'query',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '900',
    titles: titles.slice(0, 12).join('|'),
  });
  const pages = Object.values(info.query?.pages ?? {}) as any[];
  const out: Info[] = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    const meta = ii?.extmetadata ?? {};
    const license = clean(meta.LicenseShortName?.value);
    if (!ii?.thumburl || !OK_LICENSE.test(license)) continue;
    if (BAD_FILE.test(p.title)) continue;
    if (BAD_DESC.test(clean(meta.ImageDescription?.value) + ' ' + clean(meta.Categories?.value))) continue;
    out.push({
      title: p.title.replace(/^File:/, ''),
      url: ii.thumburl,
      credit: clean(meta.Artist?.value) || 'Wikimedia Commons',
      license,
      licenseUrl: clean(meta.LicenseUrl?.value),
      descriptionUrl: ii.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
    });
  }
  return out;
}

async function download(url: string, file: string) {
  const res = await fetchRetry(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error('ملف صغير جداً');
  writeFileSync(file, new Uint8Array(buf));
  return buf.length;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(join(ROOT, 'data'), { recursive: true });
  const parsed = existsSync(LICENSE_FILE) ? JSON.parse(readFileSyncSafe(LICENSE_FILE)) : {};
  const existing: Record<string, any> = parsed.items ?? {};
  const results: Record<string, any> = { ...existing };
  const failed: string[] = [];

  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? new Set(onlyArg.replace('--only=', '').split(',').filter(Boolean)) : null;
  const list = only ? WANTED.filter((w) => only.has(w.key)) : WANTED;
  console.log('عدد العناصر المطلوبة في هذه الجولة:', list.length);
  for (const want of list) {
    const file = join(OUT_DIR, `${want.slug}.jpg`);
    if (!only && existsSync(file) && results[want.key]) {
      console.log(`= ${want.key} ${want.slug}: موجود مسبقاً`);
      continue;
    }
    try {
      const candidates = await findCandidates(want.query);
      if (!candidates.length) throw new Error('لا مرشّح بترخيص مقبول');
      const ranked = [
        ...candidates.filter((c) => (want.prefer ?? []).some((p) => c.title.includes(p))),
        ...candidates.filter((c) => !(want.prefer ?? []).some((p) => c.title.includes(p))),
      ];
      let done = false;
      for (const cand of ranked.slice(0, 4)) {
        try {
          const size = await download(cand.url, file);
          results[want.key] = {
            slug: want.slug,
            emoji: want.key,
            src: `/images/real/${want.slug}.jpg`,
            alt: want.alt,
            commonsTitle: cand.title,
            credit: cand.credit,
            license: cand.license,
            licenseUrl: cand.licenseUrl,
            sourceUrl: cand.descriptionUrl,
            bytes: size,
            retrieved: new Date().toISOString().slice(0, 10),
          };
          console.log(`✓ ${want.key} ${want.slug} ← ${cand.title} [${cand.license}] ${Math.round(size / 1024)}KB`);
          done = true;
          break;
        } catch (e) {
          console.log(`  … فشل تنزيل ${cand.title}: ${(e as Error).message}`);
        }
      }
      if (!done) throw new Error('فشل تنزيل كل المرشّحين');
    } catch (e) {
      failed.push(`${want.key} (${want.query}): ${(e as Error).message}`);
      console.log(`✗ ${want.key} ${want.slug}: ${(e as Error).message}`);
    }
    await sleep(2500);
  }

  writeFileSync(
    LICENSE_FILE,
    JSON.stringify(
      {
        note: 'صور حقيقية من Wikimedia Commons بتراخيص حرّة (CC0/PD/CC BY/CC BY-SA فقط). تُستخدم كمرجع واقعي في مرحلة «جرّب مع المشرف». لا صور لأشخاص.',
        retrieved: new Date().toISOString().slice(0, 10),
        items: Object.fromEntries(Object.entries(results).sort(([a], [b]) => a.localeCompare(b, 'ar'))),
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
  console.log(`\n✓ عدد الصور الموثّقة: ${Object.keys(results).length}/${WANTED.length}`);
  if (failed.length) {
    console.log('فشل:');
    for (const f of failed) console.log('  - ' + f);
  }
}

function readFileSyncSafe(p: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('node:fs').readFileSync(p, 'utf8');
}

main();
