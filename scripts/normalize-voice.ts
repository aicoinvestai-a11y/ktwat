/**
 * معايرة صوت الجمل المسجّلة — خطوتي 🎧
 *
 * المشكلة: الجمل المولَّدة تُنتَج بمستويات متفاوتة جداً (من −34 إلى −14 dBFS)،
 * فبعض الكلمات القصيرة تُسمع هادئة جداً ويضطرّ المستخدم لرفع مستوى الجهاز إلى أقصى حد.
 *
 * الحل: قياس **مستوى الكلام الفعلي** لكل ملف ثم توحيده.
 *   • القياس الصحيح ليس متوسط الملف (الصمت بين الكلمات يخفضه زوراً)،
 *     بل مستوى نوافذ الكلام النشطة: نوافذ 20ms، تؤخذ الشريحة 90% من النوافذ فوق عتبة الصمت.
 *   • الهدف الافتراضي: −15 dBFS لمستوى الكلام (وهو وسيط المكتبة الحقيقي، فيبقى الجيد كما هو
 *     حتى لا يحتاج الجهاز إلى أقصى مستوى)، مع حدّ ذروة −1.5 dBFS فلا يحدث أي تشويش.
 *   • الصمت الزائد في البداية والنهاية يُقلَّص أيضاً (يُحسّن الاستجابة).
 *
 * الاستخدام:
 *   npm run voice-normalize -- --dry-run          # قياس فقط بلا تعديل
 *   npm run voice-normalize                       # معايرة كل الملفات
 *   npm run voice-normalize -- --only=28d43b3a,05a477f3
 *   npm run voice-normalize -- --level=-14        # مستوى كلام آخر
 *
 * المخرجات: تعديل الملفات في مكانها + تقرير data/voice-loudness.json يقرأه npm run verify
 *           (فيمنع أي ملف منخفض المستوى من الدخول مستقبلاً).
 */

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync, statSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import ffmpegPath from 'ffmpeg-static';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyArg = args.find((a) => a.startsWith('--only='));
const levelArg = args.find((a) => a.startsWith('--level='));
const dirArg = args.find((a) => a.startsWith('--dir='));
const reportArg = args.find((a) => a.startsWith('--report='));
const noteArg = args.find((a) => a.startsWith('--note='));
const peakArg = args.find((a) => a.startsWith('--peak='));
const only = onlyArg ? onlyArg.split('=')[1].split(',') : null;

/** المجلد المستهدف: أصوات الجمل افتراضاً، ويمكن معايرة أي مجلد صوتي (بيئة/تلاوات/…) */
const TARGET_DIR = join(ROOT, dirArg ? dirArg.split('=')[1] : 'public/audio/voice');
const VOICE_DIR = TARGET_DIR;
const REPORT = join(ROOT, reportArg ? reportArg.split('=')[1] : 'data/voice-loudness.json');
/** تقليص الصمت والضغط: للكلام فقط؛ أصوات البيئة والتلاوات تُعاير بالكسب وحده */
const NO_TRIM = args.includes('--no-trim');
const NO_COMPRESS = args.includes('--no-compress');
/** ضبط القنوات: أحادي للكلام، وتبقى القنوات كما هي لغير الكلام */
const keepChannels = args.includes('--keep-channels');

/** الجَهارة المسموعة المستهدفة (LUFS) وحدّ الذروة (dBTP)
 *  المرجع: تطبيقات الأطفال التفاعلية تعمل بين −16 و −14 LUFS.
 *  الملاحظة المهمّة: قياس dBFS وحده مضلّل — الكلام المتقطّع بفراغات بين الكلمات
 *  يعطي متوسطاً منخفضاً حتى لو بدا الصوت طبيعياً. المقياس الصحيح هو الجَهارة المدرجة. */
const TARGET_LUFS = levelArg ? Number(levelArg.split('=')[1]) : -15;
const PEAK_CEILING = peakArg ? Number(peakArg.split('=')[1]) : -1.5;
/** حدود التعديل: لا نُخفض كثيراً ولا نرفع فوق حدّ معقول */
const MIN_GAIN = -10;
const MAX_GAIN = 26;
/** عتبة الصمت: ما دونها لا يُعدّ كلاماً */
const SILENCE_DB = -48;
/** تقليص الصمت الزائد (ثوانٍ) */
const TRIM = 'silenceremove=start_periods=1:start_silence=0.05:start_threshold=-55dB,areverse,silenceremove=start_periods=1:start_silence=0.08:start_threshold=-55dB,areverse';
/** ضغط خفيف: يرفع وضوح الكلام ويمنع الذروات الحادّة من إجبارنا على مستوى أهدأ */
const COMPRESS = 'acompressor=threshold=-18dB:ratio=3:attack=5:release=120:makeup=2';

const ffmpeg = ffmpegPath as unknown as string;
if (!ffmpeg || !existsSync(ffmpeg)) {
  console.error('✗ ffmpeg غير متاح — شغّل npm install (ffmpeg-static مذكور في devDependencies).');
  process.exit(1);
}

const spawn = (argv: string[]) =>
  spawnSync(ffmpeg, ['-hide_banner', '-nostats', ...argv], { maxBuffer: 512 * 1024 * 1024 });

/** يفكّ الملف إلى PCM أحادي 44.1kHz (بعد تقليص الصمت) */
const decode = (file: string, extraFilter?: string): Float32Array | null => {
  const chain = extraFilter ? `${TRIM},${extraFilter}` : TRIM;
  const r = spawn(['-i', file, '-af', chain, '-ac', '1', '-ar', '44100', '-f', 's16le', '-']);
  if (!r.stdout || r.stdout.length < 3200) return null; // أقل من 40ms
  const buf = r.stdout;
  const n = Math.floor(buf.length / 2);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) out[i] = buf.readInt16LE(i * 2) / 32768;
  return out;
};

/** مدة الملف بالثواني (من مخرجات ffmpeg) */
const durationOf = (file: string): number => {
  const r = spawn(['-i', file]);
  const out = `${r.stderr ? r.stderr.toString() : ''}`;
  const m = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(out);
  if (!m) return 0;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
};

/** الجَهارة المدرجة وذروة الإشارة الحقيقية (LUFS / dBTP) — قد تفشل على ملف أقصر من نصف ثانية */
const loudness = (file: string): { lufs: number; tp: number } | null => {
  const r = spawn(['-i', file, '-af', `loudnorm=I=${TARGET_LUFS}:TP=${PEAK_CEILING}:print_format=json`, '-f', 'null', '-']);
  const out = `${r.stderr ? r.stderr.toString() : ''}`;
  const i = /"input_i"\s*:\s*"(-?[\d.]+|[-a-z]+)"/.exec(out);
  const tp = /"input_tp"\s*:\s*"(-?[\d.]+|[-a-z]+)"/.exec(out);
  if (!i || !tp) return null;
  const lufs = Number(i[1]);
  const tpv = Number(tp[1]);
  if (!Number.isFinite(lufs) || !Number.isFinite(tpv)) return null; // ملف قصير جداً: القياس المدرج غير معرَّف
  return { lufs, tp: tpv };
};

interface Level {
  /** مستوى الكلام الفعلي (dBFS) */
  speech: number;
  /** الجَهارة المدرجة (LUFS) — تُملأ بعد التحقّق النهائي إن أمكن قياسها */
  perceived?: number;
  /** الذروة (dBFS) */
  peak: number;
  /** المدة بالثواني */
  seconds: number;
}

/** مستوى الكلام = الشريحة 90% من نوافذ 20ms النشطة */
const analyse = (samples: Float32Array, sr = 44100): Level => {
  const w = Math.floor(sr * 0.02);
  const frames = Math.floor(samples.length / w);
  const levels: number[] = [];
  let peak = 0;
  for (let f = 0; f < frames; f += 1) {
    let sum = 0;
    for (let i = 0; i < w; i += 1) {
      const s = samples[f * w + i];
      sum += s * s;
      const a = Math.abs(s);
      if (a > peak) peak = a;
    }
    const db = 10 * Math.log10(sum / w + 1e-12);
    if (db > SILENCE_DB) levels.push(db);
  }
  if (levels.length === 0) return { speech: -99, peak: -99, seconds: samples.length / sr };
  levels.sort((a, b) => a - b);
  const idx = Math.min(levels.length - 1, Math.floor(levels.length * 0.9));
  return {
    speech: levels[idx],
    peak: 20 * Math.log10(peak + 1e-9),
    seconds: samples.length / sr,
  };
};

interface Row {
  before: number;
  beforePeak: number;
  after: number;
  afterPeak: number;
  gainDb: number;
  seconds: number;
  bytes: number;
  /** الجَهارة المدرجة بعد المعايرة (LUFS) إن أمكن قياسها */
  perceived?: number;
}

const round1 = (v: number) => Number(v.toFixed(1));

/** ترميز يحفظ صيغة الملف الأصلي (wav/ogg/mp3/m4a) فلا تتغيّر روابط الموقع */
const encoderFor = (ext: string, keepChannels: boolean): string[] => {
  switch (ext) {
    case 'wav':
      return ['-c:a', 'pcm_s16le'];
    case 'ogg':
      return ['-c:a', 'libvorbis', '-q:a', '5'];
    case 'm4a':
    case 'aac':
      return ['-c:a', 'aac', '-b:a', keepChannels ? '160k' : '128k'];
    case 'opus':
      return ['-c:a', 'libopus', '-b:a', '128k'];
    default:
      return ['-c:a', 'libmp3lame', '-b:a', keepChannels ? '160k' : '128k'];
  }
};

const main = () => {
  if (!existsSync(VOICE_DIR)) {
    console.error(`✗ مجلد الأصوات غير موجود: ${VOICE_DIR}`);
    process.exit(1);
  }
  const EXT = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'opus'];
  const files = readdirSync(VOICE_DIR)
    .filter((f) => EXT.includes(f.split('.').pop()!.toLowerCase()))
    .filter((f) => (only ? only.includes(f.replace(/\.[^.]+$/, '')) : true))
    .sort();
  if (files.length === 0) {
    console.log('لا ملفات للمعايرة.');
    return;
  }

  const work = mkdtempSync(join(tmpdir(), 'khatwati-loud-'));
  const rows: Record<string, Row> = {};
  let failed = 0;
  let gainSum = 0;
  let trimmedSkipped = 0;

  console.log(
    `المعايرة: ${files.length} ملفاً — الجَهارة المسموعة المستهدفة ${TARGET_LUFS} LUFS، حدّ الذروة ${PEAK_CEILING} dBTP${dryRun ? '  (قياس فقط)' : ''}`,
  );
  console.log('');

  for (const name of files) {
    const id = name.replace(/\.[^.]+$/, '');
    const ext = name.split('.').pop()!.toLowerCase();
    const file = join(VOICE_DIR, name);
    try {
      // 1) سلسلة أولية مرّة واحدة: تقليص الصمت + ضغط خفيف للكلام (يرفع الوضوح ويمنع الذروات الحادّة)
      const pre = join(work, `${id}-pre.wav`);
      const filters = [NO_TRIM ? null : TRIM, NO_COMPRESS ? null : COMPRESS].filter(Boolean).join(',');
      const preArgs = ['-i', file, ...(filters ? ['-af', filters] : []), '-ac', '1', '-ar', '44100', '-y', pre];
      spawn(preArgs);
      // حارس أمان: لا نسمح لتشذيب الصمت أن يقطع كلاماً — إن نقصت المدة كثيراً نعود للأصل بلا تشذيب
      if (!NO_TRIM) {
        const rawDur = durationOf(file);
        const preDur = durationOf(pre);
        if (rawDur > 0.4 && preDur > 0 && preDur < rawDur * 0.62) {
          copyFileSync(file, pre); // عودة إلى الأصل بلا تشذيب
          trimmedSkipped += 1;
        }
      }
      if (!existsSync(pre)) throw new Error('تعذّر تحضير الملف (تحليل أو ترميز)');

      const samples = decode(pre);
      if (!samples) throw new Error('ملف فارغ أو أقصر من 40ms');
      const before = analyse(samples);

      /** يقيس الجَهارة المسموعة للملف، ويستعمل مستوى الكلام كبديل للملفات القصيرة جداً */
      const perceivedOf = (target: string): number => {
        const l = loudness(target);
        if (l) return l.lufs;
        const sm = decode(target);
        return sm ? analyse(sm).speech - 5 : -99;
      };

      let gain = 0;
      let perceivedNow = perceivedOf(pre);
      if (dryRun) {
        gain = Math.max(MIN_GAIN, Math.min(MAX_GAIN, TARGET_LUFS - perceivedNow));
        const afterDry: Level = { ...before, speech: before.speech + gain, peak: Math.min(before.peak + gain, PEAK_CEILING) };
        rows[id] = {
          before: round1(before.speech),
          beforePeak: round1(before.peak),
          after: round1(afterDry.speech),
          afterPeak: round1(afterDry.peak),
          gainDb: round1(gain),
          seconds: Number(before.seconds.toFixed(2)),
          bytes: statSync(file).size,
        };
        gainSum += gain;
        continue;
      }

      // 2) حلقة تصحيح: نرفع تدريجياً حتى نصل المستوى المستهدف فعلاً (الحدّ يتولّى الذروات)
      const out = join(work, `${id}.${ext}`);
      let ok = false;
      let error = 0;
      for (let attempt = 0; attempt < 5 && !ok; attempt += 1) {
        const r = spawn([
          '-i', pre,
          '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=${PEAK_CEILING}dB:level=false`,
          ...(keepChannels ? [] : ['-ac', '1']),
          '-ar', '44100',
          ...encoderFor(ext, keepChannels),
          '-y', out,
        ]);
        if (!existsSync(out)) {
          const msg = (r.stderr ? r.stderr.toString() : '').split('\n').slice(-2).join(' ').slice(0, 120);
          throw new Error(`فشل الترميز: ${msg}`);
        }
        perceivedNow = perceivedOf(out);
        error = TARGET_LUFS - perceivedNow;
        if (Math.abs(error) < 0.7) {
          ok = true;
          break;
        }
        const next = Math.max(MIN_GAIN, Math.min(MAX_GAIN, gain + error));
        if (Math.abs(next - gain) < 0.15) {
          ok = true; // وصلنا حدّ التعديل المسموح (سقف الذروة مثلاً)
          break;
        }
        gain = next;
      }

      writeFileSync(file, new Uint8Array(readFileSync(out)));
      rmSync(out, { force: true });

      const samples2 = decode(file);
      const afterMeasured = samples2 ? analyse(samples2) : before;
      const after: Level = {
        ...afterMeasured,
        perceived: perceivedOf(file),
      };

      rows[id] = {
        before: round1(before.speech),
        beforePeak: round1(before.peak),
        after: round1(after.speech),
        afterPeak: round1(after.peak),
        gainDb: round1(gain),
        seconds: Number(after.seconds.toFixed(2)),
        bytes: statSync(file).size,
        ...(Number.isFinite(after.perceived as number) ? { perceived: Number((after.perceived as number).toFixed(1)) } : {}),
      };
      gainSum += gain;
    } catch (err) {
      failed += 1;
      console.log(`✗ ${id}: ${(err as Error).message.slice(0, 110)}`);
    }
  }

  rmSync(work, { recursive: true, force: true });

  const list = Object.values(rows);
  const avgGain = gainSum / (list.length || 1);
  const scored = list.filter((r) => typeof r.perceived === 'number');
  const off = scored.filter((r) => Math.abs((r.perceived as number) - TARGET_LUFS) > 3);
  const quietest = [...list].sort((a, b) => a.before - b.before).slice(0, 6);

  console.log(`✓ ${dryRun ? 'قيس' : 'عُوير'} ${list.length} ملفاً${failed ? ` (فشل ${failed})` : ''}`);
  console.log(`  متوسط التعديل: ${avgGain >= 0 ? '+' : ''}${avgGain.toFixed(1)} dB`);
  if (scored.length) {
    const avg = scored.reduce((a, r) => a + (r.perceived as number), 0) / scored.length;
    console.log(`  الجَهارة بعد المعايرة: ${avg.toFixed(1)} LUFS (قياس ${scored.length} ملفاً)`);
  }
  console.log(`  في المدى المستهدف ±3 LUFS: ${scored.length - off.length} من ${scored.length}`);
  if (off.length) console.log(`  ⚠ خارج المدى: ${off.length} ملفاً (الذروة أو قِصر الملف)`);
  console.log('  أهدأ ما كان قبل المعايرة:');
  for (const q of quietest) {
    const lu = typeof q.perceived === 'number' ? ` → ${q.perceived} LUFS` : '';
    console.log(`    ${q.before} dBFS → ${q.after} dBFS${lu}   (${q.gainDb >= 0 ? '+' : ''}${q.gainDb} dB)`);
  }

  if (!dryRun) {
    let report: {
      note: string;
      level: number;
      peakCeiling: number;
      targets?: Record<string, Row>;
    } = {
      note:
        noteArg
          ? noteArg.split('=')[1]
          : 'قياسات الجَهارة المسموعة بعد المعايرة — يُولَّد بـnpm run voice-normalize ويقرأه npm run verify.',
      level: TARGET_LUFS,
      peakCeiling: PEAK_CEILING,
    };
    if (existsSync(REPORT)) {
      try {
        const prev = JSON.parse(readFileSync(REPORT, 'utf8')) as typeof report;
        report = { ...prev, ...report };
      } catch {
        /* تقرير قديم غير صالح — يُستبدل */
      }
    }
    report.targets = { ...(report.targets ?? {}), ...rows };
    writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log('\nالخطوة التالية: npm run voice-manifest ثم npm run verify');
  }
};

main();
