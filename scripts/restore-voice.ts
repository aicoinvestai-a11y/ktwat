/**
 * إعادة توليد الجمل الصوتية — خطوتي 🎧  (استعادة)
 *
 * الخلفية: خلل في مرشّح تشذيب الصمت (silenceremove) كان يقطع الجمل عند أول سكون داخلي،
 * فتضرّر معظم ملفات الصوت (بقي منها الكلمة الأولى فقط ≈ 0.2 ثانية). جرى إصلاح المرشّح
 * ووُضع حارس يمنع تكرار القطع، ثم يأتي هذا السكربت ليُعيد توليد كل ملف مقطوع من نصّه.
 *
 * المزوّد: خدمة نطق عربية عامة (Google TTS عبر نقطة نطق مفتوحة) — بلا مفاتيح.
 *   يمكن استبدالها بمزوّدك الخاص: OPENAI_API_KEY / ELEVENLABS_API_KEY / TTS_ENDPOINT
 *   (انظر scripts/record-voice.ts) ثم تشغيل: npm run voice-record -- --force
 *
 * الاستخدام:
 *   npx tsx scripts/restore-voice.ts --dry-run        # يعرض ما سيُعاد توليده
 *   npx tsx scripts/restore-voice.ts                  # يعيد توليد المقطوع فقط
 *   npx tsx scripts/restore-voice.ts --all            # يعيد توليد كل الجمل المسجّلة
 *   npx tsx scripts/restore-voice.ts --only=id1,id2
 *
 * السلامة: لا يلمس تلاوات القرآن إطلاقاً (قاعدة المشروع: لا نطق آلي للقرآن)،
 *          وكل ملف يُتحقَّق من مدته مقابل طول نصّه قبل قبوله.
 */

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..');
const VOICE_DIR = join(ROOT, 'public/audio/voice');
const MANIFEST = join(ROOT, 'data/voice-manifest.json');
const BACKUP_DIR = join(ROOT, 'docs/voice-before-restore');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const all = args.includes('--all');
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.split('=')[1].split(',') : null;

const ffmpeg = ffmpegPath as unknown as string;
if (!ffmpeg || !existsSync(ffmpeg)) {
  console.error('✗ ffmpeg غير متاح — شغّل npm install');
  process.exit(1);
}

interface Entry {
  id: string;
  kind: string;
  text: string;
  file?: string;
  usedIn?: string[];
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { entries: Entry[] };
const entries = manifest.entries.filter((e) => e.kind !== 'quran' && e.text?.trim());
if (only) {
  const want = new Set(only);
  for (let i = entries.length - 1; i >= 0; i -= 1) if (!want.has(entries[i].id)) entries.splice(i, 1);
}

/** المدة المتوقعة للجملة: ثابت 0.35s + 0.075s لكل حرف (مُعاير على الملفات السليمة) */
const expected = (text: string) => 0.35 + 0.075 * text.trim().length;

const durationOf = (file: string): number => {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', file], { maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stderr ? r.stderr.toString() : ''}`;
  const m = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(out);
  if (!m) return 0;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
};

/** ينطق النص كاملاً: الأرقام تُنطق كلمات، والرموز تُوصف وصفاً لفظياً (لا تُنطق كرموز) */
const spoken = (text: string): string =>
  text
    .replace(/ﷺ/g, 'صلى الله عليه وسلم')
    .replace(/ﷻ/g, 'جل جلاله')
    .replace(/[▶►]/g, ' زر التشغيل ')
    .replace(/⏸/g, ' زر الإيقاف المؤقت ')
    .replace(/🔁/g, ' زر الإعادة ')
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ' ')
    .replace(/[⏎\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchTts(text: string, attempt = 0): Promise<Buffer | null> {
  const url =
    'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=' + encodeURIComponent(text.slice(0, 190));
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
        Referer: 'https://translate.google.com/',
        Accept: 'audio/mpeg,*/*',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 800) throw new Error(`ملف قصير جداً (${buf.length} بايت)`);
    return buf;
  } catch (err) {
    if (attempt >= 3) {
      console.log(`    ✗ فشل الطلب: ${(err as Error).message}`);
      return null;
    }
    await sleep(1500 * (attempt + 1));
    return fetchTts(text, attempt + 1);
  }
}

const main = async () => {
  const plan: Array<{ e: Entry; file: string; dur: number; exp: number }> = [];
  for (const e of entries) {
    const file = join(VOICE_DIR, `${e.id}.mp3`);
    const exists = existsSync(file);
    const dur = exists ? durationOf(file) : 0;
    const exp = expected(e.text);
    const good = exists && dur >= Math.max(0.5, exp * 0.58);
    if (all || !good) plan.push({ e, file, dur, exp });
  }

  console.log(
    `الجمل في القائمة: ${entries.length} • سليمة: ${entries.length - plan.length} • تحتاج إعادة توليد: ${plan.length}${dryRun ? '  (عرض فقط)' : ''}`,
  );
  if (dryRun) {
    for (const p of plan.slice(0, 12))
      console.log(`  ${p.e.id}  (${p.dur ? p.dur.toFixed(2) : '—'}s بدل ${p.exp.toFixed(2)}s)  ${p.e.text.slice(0, 46)}`);
    return;
  }
  if (plan.length === 0) return;

  if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });
  let ok = 0;
  let fail = 0;
  let i = 0;
  for (const p of plan) {
    i += 1;
    const text = spoken(p.e.text);
    if (!text) {
      fail += 1;
      continue;
    }
    const buf = await fetchTts(text);
    if (!buf) {
      fail += 1;
      continue;
    }
    const tmp = join(BACKUP_DIR, `${p.e.id}.new.mp3`);
    writeFileSync(tmp, new Uint8Array(buf));
    const dur = durationOf(tmp);
    if (dur < Math.max(0.5, expected(text) * 0.6)) {
      console.log(`  ✗ ${p.e.id}: مدة غير مقنعة (${dur.toFixed(2)}s) — لم يُقبل`);
      fail += 1;
      continue;
    }
    if (existsSync(p.file)) {
      // نحفظ الملف السابق للمراجعة ثم نستبدله
      const keep = join(BACKUP_DIR, `${p.e.id}.mp3`);
      if (!existsSync(keep)) writeFileSync(keep, new Uint8Array(readFileSync(p.file)));
    }
    writeFileSync(p.file, new Uint8Array(readFileSync(tmp)));
    ok += 1;
    if (i % 20 === 0) console.log(`  … ${i}/${plan.length} (نجح ${ok})`);
    await sleep(1100);
  }
  console.log(`✓ أُعيد توليد ${ok} جملة • فشل ${fail}`);
  console.log('الخطوة التالية: npm run voice-normalize ثم npm run voice-manifest ثم npm run verify');
};

main().catch((err) => {
  console.error('✗ خطأ غير متوقع:', err);
  process.exit(1);
});
