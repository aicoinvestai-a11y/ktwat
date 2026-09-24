/**
 * مولّد قائمة الجمل الصوتية — خطوتي 🎧
 * يُشغَّل: `npm run voice-manifest`
 * ------------------------------------------------------------------
 * المخرجات:
 *   1) data/voice-manifest.json  — كل جملة يحتاجها الموقع: المعرّف، النص، النوع، مواضعها.
 *   2) lib/audio/voice-files.ts  — خريطة المعرّفات التي لها ملفات مسجّلة فعلاً (يقرأها التطبيق).
 *   3) docs/voice-lines.md       — نص التسجيل للشخص الذي يسجّل بصوته (مرتّباً بالأولوية).
 *
 * الترتيب: العبارات الثابتة أولاً (20 سطراً تغطي أكثر المواضع تكراراً)، ثم بطاقات اللوحة (صوت
 * الطفل في لوحة التواصل)، ثم جمل الأنشطة مرتّبة
 * بحسب عدد مرات ظهورها، فتُسجَّل الجملة الأكثر استعمالاً أولاً. الجمل المكرّرة تُدمج تلقائياً.
 */
import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { PHRASES } from '../lib/audio/phrases';
import { voiceId } from '../lib/audio/voice-hash';
import { speechText, needsSpokenExpansion } from '../lib/audio/text';
import { allSkills } from '../data/skills';
import { BOARD_GROUPS } from '../data/board';
import surahData from '../data/quran/surahs.json';

const ROOT = join(__dirname, '..');
const VOICE_DIR = join(ROOT, 'public/audio/voice');

type Entry = {
  id: string;
  kind: 'phrase' | 'skill' | 'activity' | 'board';
  text: string;
  /** مواضع الاستخدام (معرّفات المهارات أو الأنشطة) */
  usedIn: string[];
  /** عدد مرات الظهور في الموقع */
  uses: number;
  when?: string;
};

const entries = new Map<string, Entry>();

function add(kind: Entry['kind'], text: string, where: string, when?: string) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return;
  const id = voiceId(clean);
  const found = entries.get(id);
  if (found) {
    found.uses += 1;
    if (found.usedIn.length < 6) found.usedIn.push(where);
    return;
  }
  entries.set(id, { id, kind, text: clean, usedIn: [where], uses: 1, when });
}

/* 1) العبارات الثابتة */
for (const p of PHRASES) add('phrase', p.text, `phrase:${p.id}`, p.when);

/* 2) جمل المهارات (نص الاستماع لكل مهارة) */
for (const s of allSkills) add('skill', s.audioText, s.id, s.childFriendlyTitle);

/* 3) جمل الأنشطة (تعليمات كل نشاط) */
for (const s of allSkills) {
  for (const a of s.activities) add('activity', a.audio ?? '', `${s.id}#${a.type}`, a.title);
}

/* 4) بطاقات لوحة التواصل (تُنطق عند الضغط) */
for (const g of BOARD_GROUPS) {
  for (const c of g.cards) add('board', c.say, `board:${c.id}`, c.label);
}

/* ملفات مسجّلة موجودة فعلاً */
mkdirSync(VOICE_DIR, { recursive: true });
const files = readdirSync(VOICE_DIR).filter((f) => f.endsWith('.mp3'));
const recorded = new Set(files.map((f) => f.replace(/\.mp3$/, '')));


/* تحقّق: لا يُنطق أي نص قرآني آلياً — ولا يجوز أن يدخل في قائمة التسجيل */
const ayahSet = new Set<string>();
for (const surah of Object.values((surahData as { surahs: Record<string, { ayahs: string[] }> }).surahs)) {
  for (const ayah of surah.ayahs) ayahSet.add(ayah.replace(/\s+/g, ' ').trim());
}
const quranLeaks = [...entries.values()].filter((e) => ayahSet.has(e.text));
if (quranLeaks.length) {
  console.error('✗ نصوص قرآنية دخلت قائمة الصوت (ممنوع تماماً):', quranLeaks.map((e) => e.id).join(', '));
  process.exit(1);
}

/* الترتيب: العبارات الثابتة، ثم الأنشطة الأكثر تكراراً، ثم المهارات، ثم البطاقات */
const kindRank: Record<Entry['kind'], number> = { phrase: 0, activity: 1, skill: 2, board: 3 };
const sorted = [...entries.values()].sort(
  (a, b) => kindRank[a.kind] - kindRank[b.kind] || b.uses - a.uses || a.text.localeCompare(b.text, 'ar'),
);
const honorific = sorted.filter((e) => needsSpokenExpansion(e.text));


/* 1) data/voice-manifest.json */
const manifest = {
  note: 'قائمة كل الجمل الصوتية في خطوتي. لا تُعدَّل يدوياً: تُولَّد بـnpm run voice-manifest. القرآن لا يدخل هنا إطلاقاً.',
  generated: new Date().toISOString().slice(0, 10),
  counts: {
    total: sorted.length,
    phrases: sorted.filter((e) => e.kind === 'phrase').length,
    activityLines: sorted.filter((e) => e.kind === 'activity').length,
    skillLines: sorted.filter((e) => e.kind === 'skill').length,
    boardLines: sorted.filter((e) => e.kind === 'board').length,
    recorded: [...recorded].filter((id) => entries.has(id)).length,
  },
  entries: sorted.map((e) => ({
    id: e.id,
    kind: e.kind,
    text: e.text,
    uses: e.uses,
    usedIn: e.usedIn,
    when: e.when,
    file: recorded.has(e.id) ? `/audio/voice/${e.id}.mp3` : null,
  })),
};
mkdirSync(join(ROOT, 'data'), { recursive: true });
writeFileSync(join(ROOT, 'data/voice-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

/* 2) lib/audio/voice-files.ts — ما يقرأه التطبيق (خفيف: معرّف ← مسار) */
const wired = sorted.filter((e) => recorded.has(e.id));
const ts = `/**
 * ملفات صوتية مسجّلة — مولَّد آلياً بواسطة scripts/voice-manifest.ts
 * لا تُعدّل يدوياً: أضف ملفات MP3 في public/audio/voice ثم شغّل \`npm run voice-manifest\`.
 * تسجيلات بشرية أو مسجّلة مسبقاً؛ والمحرّك يستعملها أولاً ثم يرجع إلى نطق الجهاز.
 */
export const VOICE_FILES: Record<string, string> = {
${wired.map((e) => `  '${e.id}': '/audio/voice/${e.id}.mp3',`).join('\n')}
};

export const RECORDED_COUNT = ${wired.length};
export const TOTAL_COUNT = ${sorted.length};
`;
writeFileSync(join(ROOT, 'lib/audio/voice-files.ts'), ts, 'utf8');

/* 2ب) فهرس الملفات المسجّلة — يقرأه Service Worker ليخزّنها مسبقاً (استماع بلا إنترنت) */
writeFileSync(
  join(VOICE_DIR, 'index.json'),
  JSON.stringify(
    {
      note: 'فهرس الجمل المسجّلة — يُولَّد بـnpm run voice-manifest ويستخدمه Service Worker للتخزين المسبق.',
      files: wired.map((e) => `/audio/voice/${e.id}.mp3`),
      // الأساسي فقط يُخزَّن مسبقاً (الجمل الثابتة وبطاقات اللوحة) — البقية تُجلب عند الحاجة
      core: wired
        .filter((e) => e.kind === 'phrase' || e.kind === 'board')
        .map((e) => `/audio/voice/${e.id}.mp3`),
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

/* 3) docs/voice-lines.md — نص التسجيل */
const lines: string[] = [];
lines.push('# نص التسجيل الصوتي — خطوتي 🎧');
lines.push('');
lines.push('> هذه قائمة **كل الجمل** التي يسمعها الطفل في الموقع، جاهزة للتسجيل بصوت بشري.');
lines.push(
  `> المجموع: **${sorted.length}** جملة (بعد دمج المكرّر حرفياً). المسجَّل منها حتى الآن: **${wired.length}**.`,
);
lines.push('');
lines.push(`<!-- counts: total=${sorted.length} recorded=${wired.length} phrases=${manifest.counts.phrases} activities=${manifest.counts.activityLines} skills=${manifest.counts.skillLines} board=${manifest.counts.boardLines} -->`);
lines.push('');
if (wired.length > 0) {
  lines.push(
    '> ⚠️ التسجيلات المؤشَّرة ✅ الآن هي **تسجيلات أولية** وُضعت لتعمل التجربة بلا انتظار (صوت مُولَّد يقرأ النص نفسه).',
  );
  lines.push(
    '> استبدلها بتسجيلك البشري بنفس أسماء الملفات تماماً، ثم `npm run voice-manifest` — لا يلزم أي تعديل برمجي.',
  );
  lines.push('');
}
const pct = (rows: { uses: number }[], n: number): number => {
  const total = rows.reduce((sum, r) => sum + r.uses, 0) || 1;
  const top = rows.slice(0, n).reduce((sum, r) => sum + r.uses, 0);
  return Math.round((top / total) * 100);
};

lines.push('## طريقة التسجيل (مهم)');
lines.push('');
lines.push('1. صوت هادئ وواضح، بلا موسيقى ولا مؤثرات، وبسرعة أقل من الكلام العادي — الطفل يحتاج وقتاً.');
lines.push('2. النبرة ودّية ومشجّعة، بلا صراخ ولا مبالغة. لا يوجد أي عبارة لوم أو تقييم في القائمة.');
lines.push('3. احفظ كل جملة في ملف مستقل بصيغة **MP3** وبالاسم الظاهر في الجدول: `<المعرّف>.mp3`.');
lines.push('4. ضع الملفات في المجلد: `public/audio/voice/` ثم شغّل `npm run voice-manifest`.');
lines.push('5. الملفات المُضافة تُشغَّل تلقائياً في الموقع بدل نطق الجهاز، وتعمل بلا إنترنت (PWA).');
lines.push('6. **لا تسجّل أي نص قرآني**: القرآن في هذا الموقع ملفات تلاوة حقيقية فقط، ولا يدخل قائمة الصوت إطلاقاً.');
lines.push('');
lines.push('### مواصفات فنية');
lines.push('');
lines.push('- الصيغة: MP3، معدّل 128kbps، أحادي القناة (Mono)، 44.1kHz.');
lines.push(
  `- **النطق الكامل**: ${honorific.length} جملة تحتاج توسيعاً عند النطق (رمز ﷺ → «صلى الله عليه وسلم»، أو أرقام → كلمات)، والجدول يعرضها بالنطق الكامل. ونفس التوسيع يطبّقه الموقع في الحالات التي ينطقها محرّك الجهاز.`,
);
lines.push(
  '- **مستوى الصوت**: كل جملة معايَرة على **الجَهارة المسموعة** (−15 وحدة LUFS، النطاق المقبول −16 إلى −14) بحدّ ذروة −1.5 dBTP حتى لا يضطرّ أحد لرفع مستوى الجهاز. بعد إضافة أي تسجيل بشري شغّل `npm run voice-normalize` ليتساوى مع البقية.',
);
lines.push('- المدة: العبارات القصيرة أقل من 2 ثانية، وجمل الأنشطة أقل من 6 ثوانٍ.');
lines.push('- بلا صدى (Reverb) وبلا خلفية؛ إضافة نصف ثانية صمت في البداية والنهاية.');
lines.push('');

function table(title: string, note: string, rows: Entry[]) {
  lines.push(`## ${title}`);
  lines.push('');
  lines.push(note);
  lines.push('');
  lines.push('| ✔ | الملف | الجملة | يظهر في | عدد الظهور |');
  lines.push('| :---: | --- | --- | --- | ---: |');
  for (const e of rows) {
    const where = e.usedIn.slice(0, 3).join('، ') + (e.usedIn.length > 3 ? ' …' : '');
    lines.push(
      `| ${recorded.has(e.id) ? '✅' : '☐'} | \`${e.id}.mp3\` | ${needsSpokenExpansion(e.text) ? `${speechText(e.text)}  \u2190 تُنطق كاملة (الصلاة والأرقام)` : e.text} | ${e.when ?? where} | ${e.uses} |`,
    );
  }
  lines.push('');
}

const phrases = sorted.filter((e) => e.kind === 'phrase');
const activities = sorted.filter((e) => e.kind === 'activity');
const skills = sorted.filter((e) => e.kind === 'skill');
const boards = sorted.filter((e) => e.kind === 'board');

table('أ) العبارات الثابتة (الأولوية القصوى)', 'تُسمع في كل مكان، وتسجيلها يغطي أكثر المواضع تكراراً.', phrases);
table(
  'ب) بطاقات لوحة التواصل',
  `الجمل التي تُنطق عند الضغط على بطاقات اللوحة (${boards.length} بطاقة). هذه صوت الطفل نفسه في اللوحة، ` +
    'وكلماتها قصيرة ومتكرّرة يومياً — فأثرها كبير مقابل جهد تسجيل صغير.',
  boards,
);
table(
  'ج) جمل الأنشطة',
  `تعليمات الأنشطة (${activities.length} جملة بعد دمج المكرّر)، مرتّبة بالأكثر ظهوراً. ` +
    `أعلى 100 جملة تغطي ${pct(activities, 100)}% من مرات الظهور، وأعلى 200 تغطي ${pct(activities, 200)}% — ` +
    'فالتسجيل التدريجي من الأعلى يعطي أثراً محسوساً بسرعة.',
  activities,
);
table('د) جمل المهارات', `نص الاستماع لكل مهارة (${skills.length} جملة) — تُسمع عند فتح المهارة والضغط على 🔊.`, skills);

lines.push('## ملاحظات');
lines.push('');
lines.push('- أي جملة تبقى غير مسجّلة، ينطقها محرّك الجهاز تلقائياً — فلا تتعطّل التجربة.');
lines.push('- لو لم يوجد محرّك نطق عربي في الجهاز، تبقى الجملة المسجّلة هي الوسيلة الوحيدة للسماع؛ ولهذا التسجيل مهم.');
lines.push('- تُحدَّث هذه الورقة تلقائياً بعد أي تعديل على البيانات أو إضافة ملفات: `npm run voice-manifest`.');
lines.push('');

mkdirSync(join(ROOT, 'docs'), { recursive: true });
writeFileSync(join(ROOT, 'docs/voice-lines.md'), lines.join('\n'), 'utf8');

console.log(
  `✓ الجمل: ${sorted.length} (ثابتة ${manifest.counts.phrases}، أنشطة ${manifest.counts.activityLines}، مهارات ${manifest.counts.skillLines}، لوحة ${manifest.counts.boardLines}) — مسجّلة: ${wired.length}`,
);
console.log('✓ data/voice-manifest.json • lib/audio/voice-files.ts • docs/voice-lines.md');
