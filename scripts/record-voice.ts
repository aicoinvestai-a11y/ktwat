/**
 * مُولّد ملفات الصوت دفعةً واحدة — خطوتي 🎧
 *
 * الغرض: إنتاج ملفات `public/audio/voice/<المعرّف>.mp3` لكل جملة في القائمة بأمر واحد،
 * بلا انتظار ولا عمل يدوي. يقرأ القائمة من `data/voice-manifest.json` ويكتب الملفات
 * بالأسماء الصحيحة تلقائياً، ثم يكفي أن تشغّل `npm run voice-manifest` ليربطها الموقع.
 *
 * الاستخدام:
 *   npm run voice-record -- --dry-run              # كم جملة متبقية؟ (بلا اتصال بأي خدمة)
 *   npm run voice-record -- --only=board           # بطاقات اللوحة فقط
 *   npm run voice-record -- --only=phrases,board   # الثابتة + اللوحة
 *   npm run voice-record -- --force                # إعادة توليد ما هو موجود (يحذف ويستبدل)
 *
 * مزوّد الصوت: يُختار من متغيّر البيئة، واحد فقط مطلوب:
 *   ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID     (جودة عالية، يدعم العربية)
 *   OPENAI_API_KEY   + OPENAI_TTS_MODEL (اختياري) (صوت عربي واضح، أبسط إعداداً)
 *   TTS_ENDPOINT     (أي خدمة متوافقة: POST بجسم {text, voice} وتُرجع bytes أو JSON فيه {url/base64})
 *
 * ⚠️ قواعد المشروع المطبَّقة هنا آلياً:
 *   • لا يُولَّد صوت لأي نص قرآني إطلاقاً (فحص مطابقة مع نصوص السور المحفوظة) — السور تُقرأ بتلاوة حقيقية فقط.
 *   • لا يُلمس أي ملف موجود إلا بـ--force، فلا يضيع تسجيل بشري سبق وضعه.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..');
const VOICE_DIR = join(ROOT, 'public/audio/voice');
const MANIFEST = join(ROOT, 'data/voice-manifest.json');
const SURAHS = join(ROOT, 'data/quran/surahs.json');

type Kind = 'phrase' | 'activity' | 'skill' | 'board';
interface Entry {
  id: string;
  kind: Kind;
  text: string;
  uses: number;
  when: string;
  file: string | null;
}

/** تطبيع للمقارنة: إزالة التشكيل وعلامات الوقف وضغط المسافات */
const normalize = (s: string) =>
  s
    .replace(/[\u0617-\u061A\u064B-\u0652\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/[^\u0621-\u064A\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function quranLines(): Set<string> {
  const set = new Set<string>();
  if (!existsSync(SURAHS)) return set;
  const data = JSON.parse(readFileSync(SURAHS, 'utf8')) as {
    surahs?: Record<string, { ayahs?: string[] }>;
  };
  for (const s of Object.values(data.surahs ?? {})) for (const a of s.ayahs ?? []) set.add(normalize(a));
  return set;
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? (onlyArg.split('=')[1].split(',') as Kind[]) : null;

const kindLabel: Record<Kind, string> = {
  phrase: 'عبارات ثابتة',
  board: 'بطاقات اللوحة',
  activity: 'جمل الأنشطة',
  skill: 'جمل المهارات',
};

const provider = (): 'elevenlabs' | 'openai' | 'custom' | null => {
  if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID) return 'elevenlabs';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.TTS_ENDPOINT) return 'custom';
  return null;
};

async function synthesize(text: string): Promise<Uint8Array> {
  const p = provider();
  if (p === 'elevenlabs') {
    const id = process.env.ELEVENLABS_VOICE_ID as string;
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY as string, 'content-type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
        voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
      }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  if (p === 'openai') {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
        voice: process.env.OPENAI_TTS_VOICE || 'alloy',
        input: text,
        response_format: 'mp3',
        speed: Number(process.env.TTS_SPEED || 0.85),
        instructions: 'اقرأ بصوت هادئ ودود وبطيء قليلاً، بلا مبالغة ولا صراخ، لطفل عربي صغير.',
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  if (p === 'custom') {
    const res = await fetch(process.env.TTS_ENDPOINT as string, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.TTS_TOKEN ? { authorization: `Bearer ${process.env.TTS_TOKEN}` } : {}),
      },
      body: JSON.stringify({ text, voice: process.env.TTS_VOICE || 'default' }),
    });
    if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const type = res.headers.get('content-type') || '';
    if (type.includes('application/json')) {
      const j = (await res.json()) as { url?: string; base64?: string; audio?: string };
      if (j.base64 || j.audio) return new Uint8Array(Buffer.from((j.base64 || j.audio) as string, 'base64'));
      if (j.url) {
        const r2 = await fetch(j.url);
        if (!r2.ok) throw new Error(`تنزيل الصوت فشل ${r2.status}`);
        return new Uint8Array(await r2.arrayBuffer());
      }
      throw new Error('ردّ JSON بلا url/base64/audio');
    }
    return new Uint8Array(await res.arrayBuffer());
  }
  throw new Error('لا مزوّد صوت محدَّد');
}

async function main() {
  if (!existsSync(MANIFEST)) throw new Error('data/voice-manifest.json مفقود — شغّل: npm run voice-manifest');
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { entries: Entry[] };
  const ayah = quranLines();

  const pending = manifest.entries
    .filter((e) => (only ? only.includes(e.kind) : true))
    .filter((e) => (force ? true : !e.file || !existsSync(join(VOICE_DIR, `${e.id}.mp3`))));

  // حارس القرآن: لا يُولَّد صوت لأي نص قرآني
  const blocked = pending.filter((e) => ayah.has(normalize(e.text)));
  const work = pending.filter((e) => !ayah.has(normalize(e.text)));

  const counts = new Map<Kind, number>();
  for (const e of work) counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1);

  console.log(`المتبقي للتوليد: ${work.length} جملة`);
  for (const [k, n] of counts) console.log(`  • ${kindLabel[k]}: ${n}`);
  if (blocked.length) {
    console.log(`\n⛔ محجوب (نص قرآني — لا يُولَّد صوتياً): ${blocked.length}`);
    for (const b of blocked.slice(0, 5)) console.log(`   ${b.id}  ${b.text.slice(0, 40)}…`);
  }
  if (dryRun || work.length === 0) {
    console.log('\n(--dry-run) لم يُتصل بأي خدمة ولم يُكتب أي ملف.');
    return;
  }

  if (!provider()) {
    console.error(
      '\n✗ لا يوجد مزوّد صوت. عيّن أحد المتغيّرات ثم أعد المحاولة:\n' +
        '   ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID\n' +
        '   OPENAI_API_KEY\n' +
        '   TTS_ENDPOINT',
    );
    process.exit(1);
  }

  mkdirSync(VOICE_DIR, { recursive: true });
  let done = 0;
  const failed: { id: string; why: string }[] = [];
  for (const e of work) {
    const file = join(VOICE_DIR, `${e.id}.mp3`);
    try {
      if (force && existsSync(file)) unlinkSync(file);
      const buf = await synthesize(e.text);
      if (buf.length < 1000) throw new Error(`ملف صغير جداً (${buf.length} بايت)`);
      writeFileSync(file, buf);
      done += 1;
      const bar = `[${done}/${work.length}]`;
      console.log(`${bar} ✓ ${e.id}  ${e.text.slice(0, 44)}`);
      await new Promise((r) => setTimeout(r, Number(process.env.TTS_DELAY_MS || 250)));
    } catch (err) {
      failed.push({ id: e.id, why: (err as Error).message });
      console.log(`✗ ${e.id}  ${(err as Error).message.slice(0, 120)}`);
    }
  }

  console.log(`\n✓ تم توليد ${done} ملفاً في public/audio/voice`);
  if (failed.length) console.log(`✗ فشل ${failed.length} (أعد التشغيل — يتخطّى ما نجح تلقائياً)`);
  console.log('\nالخطوة التالية: npm run voice-manifest   (يربط الملفات بالتجربة)');
}

main().catch((e) => {
  console.error('✗', (e as Error).message);
  process.exit(1);
});
