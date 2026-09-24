/**
 * فحص المحتوى — Content Verification
 * ------------------------------------------------------------------
 * يُشغَّل قبل كل نشر: `npm run verify`
 * يتحقق من:
 *  1) تغطية الاستمارة كاملة (245 بنداً) بلا نقص، ومن عدم وجود مهارات بلا أنشطة.
 *  2) سلامة المرجعية: كل مهارة مرتبطة ببند أصلي موجود فعلاً.
 *  3) أن النص الأصلي (originalText) موجود لك بند، وأن النص المبسط منفصل عنه.
 *  4) عدم وجود ألعاب بلا بيانات كافية (خيارات فارغة، جواب غير موجود ضمن الخيارات...).
 *  5) ملفات الصوت والصورة المطلوبة موجودة فعلياً في /public.
 *  6) ألا يكون في النصوص العربية المبسطة كلمات لاتينية ساقطة بالخطأ.
 *  7) توثيق تراخيص الأصوات في data/audio-licenses.json.
 *
 * يخرج بكود 1 عند أي فشل حتى يتوقف النشر تلقائياً.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { allSkills } from '../data/skills';
import { allSourceItems, sourceById } from '../data/source/inventory';
import { CATEGORIES, DOMAINS } from '../data/taxonomy';
import { ENV_SOUNDS, QURAN_SURAHS, quranSrc } from '../lib/audio/library';
import { BOARD_GROUPS } from '../data/board';
import { ANIMATIONS, animatedSkills, animationByKey } from '../data/animations';
import { SCENES } from '../components/animations/scenes';
import { PICTOGRAMS } from '../components/illustrations/Pictograms';
import imageLicenses from '../data/image-licenses.json';
import { PHRASES } from '../lib/audio/phrases';
import { speechText, needsSpokenExpansion } from '../lib/audio/text';
import { voiceId } from '../lib/audio/voice-hash';
import voiceManifest from '../data/voice-manifest.json';
import surahData from '../data/quran/surahs.json';

const ROOT = join(__dirname, '..');
const problems: string[] = [];
const notes: string[] = [];

const fail = (msg: string) => problems.push(msg);
const note = (msg: string) => notes.push(msg);

/* 1) التغطية */
const skillsBySource = new Map<string, string[]>();
for (const s of allSkills) {
  const arr = skillsBySource.get(s.sourceId) ?? [];
  arr.push(s.id);
  skillsBySource.set(s.sourceId, arr);
}
const uncovered = allSourceItems.filter((i) => !skillsBySource.has(i.id));
if (uncovered.length) fail(`بنود بلا مهارة (${uncovered.length}): ${uncovered.slice(0, 10).map((i) => i.id).join(', ')}`);

const withTwo = [...skillsBySource.entries()].filter(([, v]) => v.length > 1);
if (withTwo.length) fail(`بنود لها أكثر من مهارة: ${withTwo.map(([k, v]) => `${k}→${v.join('+')}`).join(', ')}`);

const noActivity = allSkills.filter((s) => !s.activities.length);
if (noActivity.length) fail(`مهارات بلا أي نشاط (${noActivity.length}): ${noActivity.slice(0, 10).map((s) => s.id).join(', ')}`);

/* 2) المرجعية */
for (const s of allSkills) {
  const src = sourceById[s.sourceId];
  if (!src) fail(`مرجع بند غير موجود: ${s.id} → ${s.sourceId}`);
  else {
    if (src.category !== s.category) fail(`اختلاف قسم بين المهارة والبند: ${s.id}`);
    if (src.domain !== s.domain) fail(`اختلاف محور بين المهارة والبند: ${s.id}`);
    if (src.sourcePage !== s.sourcePage) fail(`اختلاف رقم صفحة: ${s.id} (${s.sourcePage} ≠ ${src.sourcePage})`);
    if (src.sourceItemNumber !== s.sourceItemNumber) fail(`اختلاف رقم البند: ${s.id}`);
    if (src.originalText.trim() !== s.originalText.trim()) fail(`النص الأصلي تغيّر عن الاستمارة: ${s.id}`);
    if (src.needsReview && !s.needsReview) fail(`بند ملتبس في المصدر غير موسوم للمراجعة: ${s.id}`);
  }
}

/* 3) الحقول الإلزامية */
const required: (keyof (typeof allSkills)[number])[] = [
  'id',
  'sourceId',
  'domain',
  'category',
  'sourcePage',
  'sourceItemNumber',
  'originalText',
  'childFriendlyTitle',
  'childFriendlyInstruction',
  'description',
  'icon',
  'trainingMode',
  'supervisorRequired',
  'safetyLevel',
  'activities',
  'audioText',
  'keywords',
];
for (const s of allSkills) {
  for (const k of required) {
    const v = s[k];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
      fail(`حقل ناقص: ${s.id}.${String(k)}`);
    }
  }
  if (s.originalText.trim() === s.childFriendlyTitle.trim()) {
    note(`النص المبسط مطابق للنص الأصلي حرفياً في: ${s.id} — يُراجع إن كان يحتاج تبسيطاً`);
  }
  if (s.supervisorRequired && !s.safetyLevel) fail(`مهارة بإشراف بلا تصنيف سلامة: ${s.id}`);
}

/* 4) سلامة بيانات الألعاب */
for (const s of allSkills) {
  const ids = new Set<string>();
  for (const a of s.activities) {
    if (ids.has(a.id)) fail(`معرّف نشاط مكرر داخل المهارة: ${s.id} → ${a.id}`);
    ids.add(a.id);
    if (!a.title || !a.instruction) fail(`نشاط بلا عنوان أو تعليمة: ${s.id} (${a.id})`);

    switch (a.type) {
      case 'explore':
        if (!a.items?.length) fail(`نشاط استكشاف بلا عناصر: ${s.id} (${a.id})`);
        break;
      case 'picture-choice':
      case 'audio-choice':
        if (a.options.length < 2) fail(`خيارات أقل من اثنين: ${s.id} (${a.id})`);
        if (!a.options.some((o) => o.id === a.answerId)) fail(`الجواب غير موجود ضمن الخيارات: ${s.id} (${a.id})`);
        if (a.type === 'audio-choice' && !a.soundKey) fail(`نشاط سماع بلا مفتاح صوت: ${s.id} (${a.id})`);
        break;
      case 'true-false':
        if (typeof a.isTrue !== 'boolean') fail(`نشاط صح/خطأ بلا جواب: ${s.id} (${a.id})`);
        if (!a.explain) fail(`نشاط صح/خطأ بلا توضيح هادئ: ${s.id} (${a.id})`);
        break;
      case 'counting': {
        const expected = a.expression
          ? a.expression.op === '+'
            ? a.expression.left + a.expression.right
            : a.expression.left - a.expression.right
          : a.count;
        if (expected < 0) fail(`نتيجة حسابية سالبة: ${s.id} (${a.id})`);
        if (!a.choices.includes(expected)) fail(`جواب العدّ غير موجود في الخيارات: ${s.id} (${a.id})`);
        if (!a.unit) fail(`نشاط عدّ بلا وحدة: ${s.id} (${a.id})`);
        break;
      }
      case 'sequence':
        if (a.steps.length < 2) fail(`ترتيب خطوات بأقل من خطوتين: ${s.id} (${a.id})`);
        break;
      case 'memory':
        if (a.items.length < 2) fail(`عناصر ذاكرة أقل من اثنين: ${s.id} (${a.id})`);
        break;
      case 'matching': {
        if (a.pairs.length < 2) fail(`أزواج أقل من اثنين: ${s.id} (${a.id})`);
        const seen = new Set<string>();
        for (const pr of a.pairs) {
          if (seen.has(pr.right.id)) fail(`هدف مطابقة مكرر: ${s.id} (${a.id})`);
          seen.add(pr.right.id);
        }
        break;
      }
      case 'sorting':
        if (!a.buckets.length || !a.items.length) fail(`تصنيف بلا سلال أو عناصر: ${s.id} (${a.id})`);
        for (const it of a.items) if (!a.buckets.some((b) => b.id === it.bucketId)) fail(`عنصر بسلة غير موجودة: ${s.id} (${a.id})`);
        break;
      case 'category':
        if (!a.categories.length || !a.items.length) fail(`تصنيف فئوي بلا فئات أو عناصر: ${s.id} (${a.id})`);
        for (const it of a.items) if (!a.categories.some((c) => c.id === it.categoryId)) fail(`عنصر بفئة غير موجودة: ${s.id} (${a.id})`);
        break;
      case 'drag-drop':
        if (!a.targets.length || !a.items.length) fail(`سحب وإفلات بلا أهداف أو عناصر: ${s.id} (${a.id})`);
        for (const it of a.items) if (!a.targets.some((t2) => t2.id === it.targetId)) fail(`عنصر بهدف غير موجود: ${s.id} (${a.id})`);
        break;
      case 'build-sentence':
        if (a.answer.length < 2) fail(`بناء جملة بأقل من كلمتين: ${s.id} (${a.id})`);
        for (const w of a.answer) if (a.distractors?.includes(w)) fail(`كلمة الجواب مكررة بين المشتتات: ${s.id} (${a.id})`);
        break;
      case 'story':
        if (!a.scenes.length) fail(`قصة بلا مشاهد: ${s.id} (${a.id})`);
        if (a.scenes.length === 1) note(`قصة بمشهد واحد يمكن إثراؤها: ${s.id} (${a.id})`);
        for (const sc of a.scenes) {
          if (sc.options?.length) {
            if (sc.options.filter((o) => o.correct).length !== 1)
              fail(`سؤال قصة بلا جواب واحد صحيح: ${s.id} (${a.id})`);
          }
        }
        break;
      case 'simulation':
        if (a.steps.length < 2) fail(`محاكاة بأقل من خطوتين: ${s.id} (${a.id})`);
        if (!a.sim) fail(`محاكاة بلا معرّف: ${s.id} (${a.id})`);
        break;
      case 'supervised':
        if (!a.steps.length || !a.tools.length) fail(`نشاط بإشراف بلا خطوات أو أدوات: ${s.id} (${a.id})`);
        if (s.safetyLevel === 'safety-sensitive' && !a.safetyNote && !s.safetyNote)
          fail(`بند حساس للسلامة بلا تنبيه صريح: ${s.id} (${a.id})`);
        if (!a.safetyNote) note(`نشاط واقعي بلا تنبيه سلامة خاص — يُعرض التنبيه الافتراضي: ${s.id} (${a.id})`);
        break;
      case 'tracing':
        if (!a.mode) fail(`تتبّع بلا نمط: ${s.id} (${a.id})`);
        if (['letter', 'word', 'sentence'].includes(a.mode) && !a.guide)
          fail(`تتبّع حرف أو كلمة بلا نص موجّه: ${s.id} (${a.id})`);
        break;
      case 'listen-player':
        if (a.noTts === false) fail(`مشغّل استماع يسمح بالنطق الآلي: ${s.id} (${a.id})`);
        if (!a.tracks.length) fail(`مشغّل استماع بلا مقاطع: ${s.id} (${a.id})`);
        for (const t of a.tracks) {
          if (!t.src.startsWith('/audio/')) fail(`مسار صوت غير محلي: ${s.id} (${t.id}) → ${t.src}`);
          if (!t.title) fail(`مقطع صوتي بلا عنوان: ${s.id} (${t.id})`);
        }
        break;
      case 'computer-sim':
        if (!a.task) fail(`محاكاة حاسوب بلا مهمة: ${s.id} (${a.id})`);
        if (a.task === 'keyboard' || a.task === 'typing') {
          if (!a.payload?.text) fail(`مهمة كتابة بلا نص: ${s.id} (${a.id})`);
        } else if (a.task === 'power' || a.task === 'mouse' || a.task === 'window') {
          if (!a.payload?.targetLabel) fail(`مهمة تشغيل بلا هدف: ${s.id} (${a.id})`);
        } else if (!a.payload?.options?.length && !a.payload?.targetLabel) {
          fail(`مهمة حاسوب بلا خيارات أو هدف بصري: ${s.id} (${a.id})`);
        }
        break;
      default:
        break;
    }
  }
}

/* 5) وجود ملفات الصوت فعلياً */
for (const [key, s] of Object.entries(ENV_SOUNDS)) {
  const file = join(ROOT, 'public', s.src.replace(/^\//, ''));
  if (!existsSync(file)) fail(`ملف صوت بيئة مفقود (${key}): ${s.src}`);
}
for (const q of QURAN_SURAHS) {
  const file = join(ROOT, 'public', quranSrc(q.number).replace(/^\//, ''));
  if (!existsSync(file)) fail(`ملف تلاوة مفقود: السورة ${q.number}`);
}

/* 6) تسرّب حروف لاتينية في النصوص المبسطة */
const latin = /[A-Za-z]/;
for (const s of allSkills) {
  const fields: [string, string][] = [
    ['childFriendlyTitle', s.childFriendlyTitle],
    ['childFriendlyInstruction', s.childFriendlyInstruction],
    ['description', s.description],
    ['audioText', s.audioText],
  ];
  for (const [name, value] of fields) {
    if (latin.test(value)) fail(`نص عربي يحتوي حروفاً لاتينية: ${s.id}.${name} → «${value}»`);
  }
  for (const k of s.keywords) if (latin.test(k)) fail(`كلمة مفتاحية بحروف لاتينية: ${s.id} → «${k}»`);
}

/* 7) توثيق التراخيص */
const licPath = join(ROOT, 'data', 'audio-licenses.json');
if (!existsSync(licPath)) fail('ملف توثيق التراخيص مفقود: data/audio-licenses.json');
else {
  const lic = JSON.parse(readFileSync(licPath, 'utf8')) as {
    environmentSounds: { key: string; sourceUrl: string; license: string; author: string }[];
    quranRecitations: { reviewStatus?: string };
  };
  const documented = new Set(lic.environmentSounds.map((x) => x.key));
  for (const key of Object.keys(ENV_SOUNDS)) {
    if (!documented.has(key)) fail(`صوت بيئة بلا توثيق ترخيص: ${key}`);
  }
  for (const rec of lic.environmentSounds) {
    if (!rec.author || !rec.license || !rec.sourceUrl) fail(`توثيق ترخيص ناقص للصوت: ${rec.key}`);
  }
  if (lic.quranRecitations.reviewStatus !== 'needs-human-review')
    note('حالة مراجعة المصدر القرآني غير مضبوطة على needs-human-review');
}

/* 7ب) لوحة التواصل بالصور */
{
  const seen = new Set<string>();
  for (const g of BOARD_GROUPS) {
    if (!g.cards.length) fail(`مجموعة لوحة بلا بطاقات: ${g.id}`);
    for (const card of g.cards) {
      if (seen.has(card.id)) fail(`بطاقة لوحة مكرّرة: ${card.id}`);
      seen.add(card.id);
      if (!card.label?.trim() || !card.say?.trim()) fail(`بطاقة لوحة بلا نص أو نطق: ${card.id}`);
      if (!card.icon?.value) fail(`بطاقة لوحة بلا رسمة: ${card.id}`);
      if (/[A-Za-z]/.test(card.say + card.label)) fail(`بطاقة لوحة بحروف لاتينية: ${card.id}`);
    }
  }
}

/* 8ج) الصوت: قائمة الجمل متزامنة مع البيانات، والملفات المسجّلة موجودة، وبلا أي نص قرآني */
{
  const expected = new Map<string, string>();
  const put = (text: string) => {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean) expected.set(voiceId(clean), clean);
  };
  for (const p of PHRASES) put(p.text);
  for (const s of allSkills) {
    put(s.audioText);
    for (const a of s.activities) if (a.audio) put(a.audio);
  }
  for (const g of BOARD_GROUPS) for (const c of g.cards) put(c.say);

  const manifestIds = new Set(voiceManifest.entries.map((e) => e.id));
  const missing = [...expected.keys()].filter((id) => !manifestIds.has(id));
  if (missing.length) {
    fail(`قائمة الصوت غير متزامنة: ${missing.length} جملة جديدة غير موجودة — شغّل npm run voice-manifest`);
  }

  const ayahSet = new Set<string>();
  for (const surah of Object.values((surahData as { surahs: Record<string, { ayahs: string[] }> }).surahs)) {
    for (const ayah of surah.ayahs) ayahSet.add(ayah.replace(/\s+/g, ' ').trim());
  }
  for (const e of voiceManifest.entries) {
    if (ayahSet.has(e.text)) fail(`نص قرآني في قائمة الصوت المسجّل (ممنوع تماماً): ${e.id}`);
    if (e.file && !existsSync(join(ROOT, 'public', e.file))) fail(`ملف صوت مسجّل مفقود: ${e.file}`);
    if (e.kind === 'skill' && !allSkills.some((s) => s.id === e.usedIn[0])) {
      fail(`جملة مهارة بلا مهارة معروفة: ${e.id}`);
    }
  }
  const declaredRecorded = voiceManifest.entries.filter((e) => e.file).length;
  const actualFiles = voiceManifest.counts.recorded;
  if (declaredRecorded !== actualFiles) fail('تعارض في عدد ملفات الصوت المسجّلة في قائمة الصوت');

  const index = join(ROOT, 'public/audio/voice/index.json');
  if (declaredRecorded > 0) {
    if (!existsSync(index)) fail('فهرس الجمل المسجّلة مفقود: public/audio/voice/index.json — شغّل npm run voice-manifest');
    else {
      const idx = JSON.parse(readFileSync(index, 'utf8')) as { files?: string[] };
      const expectedFiles = voiceManifest.entries.filter((e) => e.file).map((e) => e.file as string).sort();
      const actual = (idx.files ?? []).slice().sort();
      if (expectedFiles.join('|') !== actual.join('|')) fail('فهرس الملفات الصوتية غير مطابق لقائمة الجمل المسجّلة — شغّل npm run voice-manifest');
    }
  }

  const linesPath = join(ROOT, 'docs/voice-lines.md');
  if (!existsSync(linesPath)) fail('ورقة نص التسجيل مفقودة: docs/voice-lines.md — شغّل npm run voice-manifest');
  else {
    const sheet = readFileSync(linesPath, 'utf8');
    const m = sheet.match(/counts: total=(\d+) recorded=(\d+)/);
    if (!m) fail('ورقة نص التسجيل بلا سطر الأرقام (counts) — أعد توليدها');
    else if (Number(m[1]) !== voiceManifest.counts.total || Number(m[2]) !== declaredRecorded) {
      fail(`ورقة نص التسجيل غير متزامنة: total=${m[1]} recorded=${m[2]} والمطلوب ${voiceManifest.counts.total}/${declaredRecorded}`);
    }
    if (/\bTTS\b.*القرآن|القرآن.*TTS/i.test(sheet)) note('ورقة التسجيل تذكر القرآن — تأكّد من بقاء قاعدة «لا تسجيل قرآني» واضحة');
  }
}

/* 8د) نطق الصلاة كاملة: كل ﷺ تُوضَّح «صلى الله عليه وسلم» عند النطق */
const honorTest = speechText('من جد النبي ﷺ؟');
if (!honorTest.includes('صلى الله عليه وسلم') || honorTest.includes('ﷺ')) {
  fail('توسيع الصلاة عند النطق معطّل: lib/audio/text.ts لا ينطق «ﷺ» كاملة — قاعدة الديني في المشروع تقتضي النطق الكامل.');
}
const honorificLines = voiceManifest.entries.filter((e) => needsSpokenExpansion(e.text)).length;
const loudnessLevel = existsSync(join(ROOT, 'data/voice-loudness.json'))
  ? (JSON.parse(readFileSync(join(ROOT, 'data/voice-loudness.json'), 'utf8')) as { level: number }).level
  : 0;

/* 8هـ) معايرة الصوت: لا ملف مسجّل أخفض من الحدّ المسموع (شكوى «الصوت منخفض») */
const loudnessPath = join(ROOT, 'data/voice-loudness.json');
const recordedEntries = voiceManifest.entries.filter((e) => e.file);
if (recordedEntries.length > 0) {
  if (!existsSync(loudnessPath)) {
    fail('تقرير معايرة الصوت مفقود: data/voice-loudness.json — شغّل npm run voice-normalize');
  } else {
    const report = JSON.parse(readFileSync(loudnessPath, 'utf8')) as {
      level: number;
      targets?: Record<string, { after: number; afterPeak: number; perceived?: number }>;
    };
    const targets = report.targets ?? {};
    const missing = recordedEntries.map((e) => e.id).filter((id) => !targets[id]);
    if (missing.length)
      fail(
        `${missing.length} ملفاً صوتياً بلا قياس معايرة — شغّل npm run voice-normalize (مثل: ${missing.slice(0, 3).join(', ')})`,
      );

    // المعيار: الجَهارة المسموعة (LUFS) — هو المقياس الذي يشعر به المستمع فعلاً
    const measured = Object.entries(targets).filter(([, v]) => typeof v.perceived === 'number');
    const tooQuiet = measured.filter(([, v]) => (v.perceived as number) < report.level - 3.5);
    const tooLoud = measured.filter(
      ([, v]) => (v.perceived as number) > report.level + 3.5 || v.afterPeak > -0.5,
    );
    const unmeasured = Object.keys(targets).length - measured.length;
    if (tooQuiet.length)
      fail(
        `${tooQuiet.length} جملة أهدأ من الحدّ (أقل من ${report.level - 3.5} LUFS) — سمعها الطفل منخفضة: ` +
          tooQuiet.slice(0, 3).map(([id, v]) => `${id} (${v.perceived})`).join('، '),
      );
    if (tooLoud.length)
      fail(
        `${tooLoud.length} جملة أعلى من الحدّ أو ذروتها مفرطة (تشويش محتمل): ` +
          tooLoud.slice(0, 3).map(([id, v]) => `${id} (${v.perceived})`).join('، '),
      );
    if (unmeasured > 0 && unmeasured === Object.keys(targets).length)
      fail('لا يوجد أي قياس جَهارة مسموعة في تقرير المعايرة — شغّل npm run voice-normalize');
  }
}

/* 8ز) لا جملة مقطوعة: مدة كل ملف مسجّل تكفي لنصّه (خلل تشذيب الصمت السابق) */
{
  const loudPath = join(ROOT, 'data/voice-loudness.json');
  if (existsSync(loudPath)) {
    const rep = JSON.parse(readFileSync(loudPath, 'utf8')) as {
      targets: Record<string, { seconds?: number }>;
    };
    const chopped: string[] = [];
    for (const e of voiceManifest.entries) {
      if (!e.file) continue;
      const rec = rep.targets[e.id];
      const text = String(e.text ?? '').trim();
      if (!rec || typeof rec.seconds !== 'number' || !text) continue;
      const expected = 0.35 + 0.075 * text.length;
      if (rec.seconds < Math.max(0.45, expected * 0.58)) chopped.push(`${e.id} (${rec.seconds}s لنصّ من ${text.length} حرفاً)`);
    }
    if (chopped.length)
      fail(
        `${chopped.length} ملفاً صوتياً مقطوع (مدته أقصر من نصّه) — شغّل npx tsx scripts/restore-voice.ts: ` +
          chopped.slice(0, 3).join('، '),
      );
  }
}

/* 8ح) سلامة مجلد الصوت: لا ملف يتيم ولا ناقص، وتوثيق التراخيص والمعايرة محدَّث */
{
  const dir = join(ROOT, 'public/audio/voice');
  const onDisk = new Set(
    readdirSync(dir)
      .filter((f) => f.endsWith('.mp3'))
      .map((f) => `/audio/voice/${f}`),
  );
  const inManifest = new Set(voiceManifest.entries.filter((e) => e.file).map((e) => e.file as string));
  const orphans = [...onDisk].filter((f) => !inManifest.has(f));
  const missing = [...inManifest].filter((f) => !onDisk.has(f));
  if (missing.length) fail(`${missing.length} ملف صوت مسجّل في القائمة وغير موجود على القرص: ${missing.slice(0, 3).join('، ')}`);
  if (orphans.length)
    note(`${orphans.length} ملف صوت في المجلد وغير مذكور في القائمة (يتيم) — شغّل npm run voice-manifest أو احذفه`);

  // التوثيق إلزامي لكل ما نضيفه من صوت (قاعدة ملف التراخيص نفسه)
  const lic = JSON.parse(readFileSync(join(ROOT, 'data/audio-licenses.json'), 'utf8')) as {
    environmentSounds?: Array<{ changes?: string }>;
    quranRecitations?: { changes?: string };
    textToSpeech?: { recordedSentences?: { count?: number; generatedAt?: string } };
  };
  const envUndoc = (lic.environmentSounds ?? []).filter((x) => !/LUFS/.test(x.changes ?? ''));
  if (envUndoc.length) fail(`${envUndoc.length} صوت بيئة بلا توثيق معايرة في data/audio-licenses.json`);
  if (!/LUFS/.test(lic.quranRecitations?.changes ?? '')) fail('تلاوات القرآن بلا توثيق معايرة في data/audio-licenses.json');
  const rec = lic.textToSpeech?.recordedSentences;
  const recordedCount = voiceManifest.entries.filter((e) => e.file).length;
  if (!rec?.generatedAt) fail('ملفات الجمل المسجّلة بلا توثيق في data/audio-licenses.json (textToSpeech.recordedSentences)');
  else if (rec.count !== recordedCount)
    fail(`عدد الجمل المسجّلة في التوثيق (${rec.count}) لا يطابق الواقع (${recordedCount}) — حدّث data/audio-licenses.json`);
}

/* 8و) أصوات البيئة والتلاوات: مستوى مسموع موحّد (لا صوت منخفض ولا صوت مفاجئ) */
const mediaReports: Array<{ file: string; label: string; expected: number; peakMax: number }> = [
  { file: 'data/env-loudness.json', label: 'أصوات البيئة', expected: -18, peakMax: -1 },
  { file: 'data/quran-loudness.json', label: 'تلاوات القرآن', expected: -16, peakMax: -0.5 },
];
let mediaCalibrated = 0;
for (const spec of mediaReports) {
  const p = join(ROOT, spec.file);
  if (!existsSync(p)) {
    fail(`تقرير معايرة ${spec.label} مفقود: ${spec.file} — شغّل معايرة المجلد المخصّص`);
    continue;
  }
  const rep = JSON.parse(readFileSync(p, 'utf8')) as {
    level: number;
    targets: Record<string, { perceived?: number; afterPeak: number }>;
  };
  const rows = Object.entries(rep.targets);
  const measured = rows.filter(([, v]) => typeof v.perceived === 'number');
  mediaCalibrated += rows.length;
  const off = measured.filter(([, v]) => Math.abs((v.perceived as number) - spec.expected) > 3.0);
  const hot = rows.filter(([, v]) => v.afterPeak > spec.peakMax);
  if (rows.length < 10 && spec.label === 'أصوات البيئة')
    fail(`عدد أصوات البيئة المعايَرة أقل من المتوقّع (${rows.length})`);
  if (off.length)
    fail(
      `${off.length} ملفاً في ${spec.label} بعيد عن المستوى المسموع (${spec.expected} LUFS): ` +
        off.slice(0, 3).map(([id, v]) => `${id} (${v.perceived})`).join('، '),
    );
  if (hot.length)
    fail(
      `${hot.length} ملفاً في ${spec.label} ذروته مرتفعة (فوق ${spec.peakMax} dBTP): ` +
        hot.slice(0, 3).map(([id, v]) => `${id} (${v.afterPeak})`).join('، '),
    );
}

/* 8ب) الصور الحقيقية: ملفاتها موجودة، وتراخيصها مقبولة، وبلا أشخاص، ومفاتيحها رموز مستخدمة فعلاً */
const photoLicPath = join(ROOT, 'data/image-licenses.json');
const ALLOWED_PHOTO_LICENSE = /^(cc0|public domain|cc by(?!-nc)|cc by-sa|pd\b|no restrictions)/i;
const FORBIDDEN_PHOTO = /(person|people|man\b|woman|child|girl|boy|portrait|crowd|nude|alcohol|beer|wine|whisky|vodka|cigarette|tobacco)/i;
if (!existsSync(photoLicPath)) {
  fail('ملف توثيق صور الصور الحقيقية مفقود: data/image-licenses.json');
} else {
  const photoLic = JSON.parse(readFileSync(photoLicPath, 'utf8')) as {
    note?: string;
    items?: Record<string, { src?: string; alt?: string; credit?: string; license?: string; sourceUrl?: string; commonsTitle?: string }>;
  };
  const items = photoLic.items ?? {};
  const usedVisuals = new Set<string>();
  for (const s of allSkills) {
    usedVisuals.add(s.icon.value);
    for (const a of s.activities) {
      const anyA = a as unknown as { options?: { visual?: { value?: string } }[]; scenes?: { visual?: { value?: string }; options?: { visual?: { value?: string } }[] }[] };
      for (const o of anyA.options ?? []) if (o.visual?.value) usedVisuals.add(o.visual.value);
      for (const sc of anyA.scenes ?? []) {
        if (sc.visual?.value) usedVisuals.add(sc.visual.value);
        for (const o of sc.options ?? []) if (o.visual?.value) usedVisuals.add(o.visual.value);
      }
    }
  }
  for (const [key, p] of Object.entries(items)) {
    if (!p.src) fail(`صورة بلا مسار: ${key}`);
    else if (!existsSync(join(ROOT, 'public', p.src))) fail(`ملف صورة مفقود (${key}): ${p.src}`);
    if (!p.alt?.trim()) fail(`صورة بلا نص بديل عربي: ${key}`);
    if (!p.credit?.trim()) fail(`صورة بلا نسبة للمؤلف: ${key}`);
    if (!p.sourceUrl?.startsWith('http')) fail(`صورة بلا رابط مصدر: ${key}`);
    if (!ALLOWED_PHOTO_LICENSE.test(p.license ?? '')) fail(`رخصة صورة غير مسموحة (${key}): ${p.license}`);
    if (FORBIDDEN_PHOTO.test(`${p.commonsTitle ?? ''} ${p.credit ?? ''}`)) fail(`صورة قد تحتوي أشخاصاً أو محتوى غير مناسب (${key})`);
    if (!usedVisuals.has(key)) note(`صورة موثّقة لا يقابلها رمز مستخدم في بيانات المهارات: ${key}`);
    if (!PICTOGRAMS[key]) note(`صورة بلا رسم أصلي مقابل (سيظهر الرمز النصي في حال تعذّر تحميل الصورة): ${key}`);
  }
  if (Object.keys(items).length === 0) fail('لا توجد صور حقيقية موثّقة (data/image-licenses.json فارغ)');
}

/* 9) ورقة المراجعة البشرية: موجودة وأرقامها متزامنة مع البيانات */
const reviewPath = join(ROOT, 'docs/review-sheet.md');
if (!existsSync(reviewPath)) {
  fail('ورقة المراجعة البشرية مفقودة: docs/review-sheet.md — شغّل npm run review-sheet');
} else {
  const sheet = readFileSync(reviewPath, 'utf8');
  const m = sheet.match(/counts: needsReview=(\d+) religion=(\d+) surahs=(\d+) photos=(\d+)/);
  if (!m) {
    fail('ورقة المراجعة بلا سطر الأرقام (counts) — أعد توليدها بـnpm run review-sheet');
  } else {
    const declared = { needsReview: Number(m[1]), religion: Number(m[2]), surahs: Number(m[3]), photos: Number(m[4]) };
    const actual = {
      needsReview: allSkills.filter((s) => s.needsReview).length,
      religion: allSkills.filter((s) => s.category === 'islamic').length,
      surahs: QURAN_SURAHS.length,
      photos: Object.keys(imageLicenses.items).length,
    };
    if (declared.needsReview !== actual.needsReview)
      fail(`ورقة المراجعة غير متزامنة: needsReview=${declared.needsReview} والمطلوب ${actual.needsReview} — شغّل npm run review-sheet`);
    if (declared.religion !== actual.religion)
      fail(`ورقة المراجعة غير متزامنة: religion=${declared.religion} والمطلوب ${actual.religion}`);
    if (declared.surahs !== actual.surahs)
      fail(`ورقة المراجعة غير متزامنة: surahs=${declared.surahs} والمطلوب ${actual.surahs}`);
    if (declared.photos !== actual.photos)
      fail(`ورقة المراجعة غير متزامنة: photos=${declared.photos} والمطلوب ${actual.photos}`);
  }
  for (const s of allSkills.filter((x) => x.needsReview)) {
    if (!sheet.includes(s.id)) fail(`بند needsReview غير مذكور في ورقة المراجعة: ${s.id}`);
  }
}

/* 10) بطاقات النشاط للطباعة: لكل مهارة بطاقة، ومعرّفاتها فريدة */
if (!existsSync(join(ROOT, 'app/card/[id]/page.tsx'))) {
  fail('صفحة بطاقة النشاط للطباعة مفقودة: app/card/[id]/page.tsx');
}
if (allSkills.length !== new Set(allSkills.map((s) => s.id)).size) fail('معرّفات مهارات مكرّرة (ستتصادم في صفحة البطاقة)');

/* 8) تناسق الأقسام والمحاور */
for (const c of CATEGORIES) {
  if (!DOMAINS.some((d) => d.id === c.domain)) fail(`قسم بمحور غير معروف: ${c.id}`);
  if (!allSkills.some((s) => s.category === c.id)) fail(`قسم بلا مهارات: ${c.id}`);
}


/* 8ط) الحركات التوضيحية 🎬: تعريفات سليمة، ومشاهد موجودة، ومهارات مربوطة فعلاً */
{
  const keys = ANIMATIONS.map((a) => a.key);
  if (keys.length !== new Set(keys).size) fail('معرّفات حركات توضيحية مكرّرة');
  const sceneKeys = new Set(Object.keys(SCENES));
  for (const a of ANIMATIONS) {
    if (a.steps.length < 3) fail(`حركة بأقل من ٣ خطوات: ${a.key} (${a.steps.length})`);
    for (const st of a.steps) {
      if (!st.caption?.trim()) fail(`خطوة بلا جملة في الحركة: ${a.key}`);
      if (!/[\u0600-\u06FF]/.test(st.caption)) fail(`جملة خطوة بلا حروف عربية في الحركة: ${a.key}`);
    }
    if (!sceneKeys.has(a.key)) fail(`لا يوجد مشهد مرسوم للحركة: ${a.key} — أضفه في components/animations/scenes.tsx`);
    for (const id of a.skillIds ?? []) {
      if (!allSkills.some((s) => s.id === id)) fail(`حركة "${a.key}" تشير إلى مهارة غير موجودة: ${id}`);
    }
  }
  const mapped = animatedSkills(allSkills);
  if (mapped.length < ANIMATIONS.length) fail(`عدد المهارات المرتبطة بحركات (${mapped.length}) أقل من عدد الحركات (${ANIMATIONS.length})`);
  const unused = ANIMATIONS.filter((a) => !mapped.some((m) => m.animation.key === a.key));
  if (unused.length) fail(`حركات بلا أي مهارة مرتبطة: ${unused.map((a) => a.key).join('، ')}`);
  const safetyMismatch = mapped.filter((m) => m.animation.safetySensitive && !m.skill.supervisorRequired && !m.animation.supervised);
  if (safetyMismatch.length) note(`${safetyMismatch.length} مهارة حساسة للسلامة لها حركة بلا تنبيه إشراف`);
  if (animationByKey['cross'] && !/محاكاة/.test(animationByKey['cross'].note ?? '')) {
    fail('حركة عبور الشارع بلا تنبيه «محاكاة فقط» — شرط سلامة ملزم');
  }
}

/* التقرير */
console.log('\n=== فحص المحتوى ===');
console.log(`بنود المصدر: ${allSourceItems.length} • المهارات: ${allSkills.length}`);
console.log(`ملفات صوت البيئة: ${Object.keys(ENV_SOUNDS).length} • التلاوات: ${QURAN_SURAHS.length}`);
console.log(`بطاقات لوحة التواصل: ${BOARD_GROUPS.reduce((n, g) => n + g.cards.length, 0)}`);

const animatedReport = animatedSkills(allSkills);
console.log(
  `الحركات التوضيحية: ${ANIMATIONS.length} حركة بـ${ANIMATIONS.reduce((n, a) => n + a.steps.length, 0)} خطوة` +
    ` • مهارات لها حركة: ${animatedReport.length}` +
    ` • حركات حساسة للسلامة: ${ANIMATIONS.filter((a) => a.safetySensitive).length}`,
);
console.log(`رسوم أصلية: ${Object.keys(PICTOGRAMS).length} • صور حقيقية موثّقة: ${Object.keys(imageLicenses.items).length}`);
console.log(
  `جمل صوتية في القائمة: ${voiceManifest.counts.total} • مسجّلة: ${voiceManifest.counts.recorded} (docs/voice-lines.md)` +
    ` • النطق الكامل (صلاة وأرقام) في ${honorificLines} جملة` +
    ` • الجَهارة المسموعة ${loudnessLevel} LUFS` +
    ` • معايَرة: ${mediaCalibrated} صوت بيئة وتلاوة`,
);
console.log(
  `في انتظار مراجعة بشرية: ${allSkills.filter((s) => s.needsReview).length} بند نصي • ${allSkills.filter((s) => s.category === 'islamic').length} بنداً دينياً (docs/review-sheet.md)`,
);
if (notes.length) {
  console.log('\nملاحظات (لا توقف النشر):');
  for (const n of notes) console.log(`  • ${n}`);
}
if (problems.length) {
  console.log(`\n✗ مشاكل (${problems.length}):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('\n✓ كل الفحوص ناجحة: المحتوى مكتمل ومتّسق والملفات موجودة والتراخيص موثّقة.\n');
process.exit(0);
