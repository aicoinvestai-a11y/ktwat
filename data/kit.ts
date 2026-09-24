/**
 * مكتبة بناء المحتوى (Content Kit) — خطوتي
 * تقلل التكرار وتضمن أن كل نشاط مرتبط ببند أصلي من الاستمارة.
 */
import type {
  Activity,
  ListenPlayerActivity,
  ListenTrack,
  CategoryActivity,
  ComputerSimActivity,
  ComputerTaskId,
  CountingActivity,
  DomainId,
  DragDropActivity,
  ExploreActivity,
  MatchingActivity,
  MemoryActivity,
  PictureChoiceActivity,
  SafetyLevel,
  SequenceActivity,
  SimulationActivity,
  SimKind,
  Skill,
  SortingActivity,
  SourceItem,
  StoryActivity,
  StoryScene,
  SupervisedActivity,
  TracingActivity,
  TrainingMode,
  TrueFalseActivity,
  BuildSentenceActivity,
  AudioChoiceActivity,
  Visual,
  VocabItem,
} from './types';
import { sourceById } from './source/inventory';

export const slug = (s: string): string =>
  s
    .trim()
    .replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, '')
    .replace(/[^\u0621-\u064Aa-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const seenIds = new Set<string>();
export const uniqueId = (raw: string): string => {
  const base = slug(raw) || 'item';
  let id = base;
  let i = 2;
  while (seenIds.has(id)) id = `${base}-${i++}`;
  seenIds.add(id);
  return id;
};

export const emojiVisual = (value: string): Visual => ({ kind: 'emoji', value });
export const imageVisual = (src: string): Visual => ({ kind: 'image', value: src });
export const letterVisual = (value: string): Visual => ({ kind: 'letter', value });

/** عنصر مفردات (صورة + كلمة + صوت) */
export function v(label: string, emoji = '🔹', opts: { audio?: string; group?: string; visual?: Visual } = {}): VocabItem {
  return {
    id: uniqueId(label),
    label,
    audio: opts.audio ?? label,
    visual: opts.visual ?? emojiVisual(emoji),
    group: opts.group,
  };
}

type Pair = [string, string]; // [التسمية، الرمز]
type Triple = [string, string, string]; // [التسمية، الرمز، مرجع]

/** لعبة اختيار الصورة */
export function pic(
  prompt: string,
  options: Pair[],
  answerLabel: string,
  extra: { id?: string; title?: string; instruction?: string; audio?: string } = {},
): PictureChoiceActivity {
  const items = options.map(([l, e]) => v(l, e));
  const answer = items.find((i) => i.label === answerLabel) ?? items[0];
  return {
    id: extra.id ?? uniqueId(`pic-${prompt}`),
    type: 'picture-choice',
    title: extra.title ?? 'هيا نلعب',
    instruction: extra.instruction ?? prompt,
    audio: extra.audio ?? prompt,
    prompt,
    options: items,
    answerId: answer.id,
  };
}

/** لعبة اختيار بالصوت (صوت حقيقي من المكتبة) */
export function audioQ(
  soundKey: string,
  soundLabel: string,
  prompt: string,
  options: Pair[],
  answerLabel: string,
  extra: { id?: string; title?: string } = {},
): AudioChoiceActivity {
  const items = options.map(([l, e]) => v(l, e));
  const answer = items.find((i) => i.label === answerLabel) ?? items[0];
  return {
    id: extra.id ?? uniqueId(`audio-${soundKey}-${prompt}`),
    type: 'audio-choice',
    title: extra.title ?? 'استمع واختر',
    instruction: prompt,
    audio: prompt,
    prompt,
    soundKey,
    soundLabel,
    options: items,
    answerId: answer.id,
  };
}

/** مطابقة كلمة ↔ صورة */
export function matchPic(
  instruction: string,
  items: Pair[],
  extra: { id?: string; title?: string; audio?: string } = {},
): MatchingActivity {
  const vs = items.map(([l, e]) => v(l, e));
  return {
    id: extra.id ?? uniqueId(`match-${instruction}`),
    type: 'matching',
    title: extra.title ?? 'طابِق',
    instruction,
    audio: extra.audio ?? instruction,
    pairs: vs.map((item) => ({ left: item, right: item })),
  };
}

/** مطابقة عنصرين مختلفين (مثل: الحيوان ومكان عيشه) */
export function matchPairs(
  instruction: string,
  pairs: [string, string, string, string][],
  extra: { id?: string; title?: string; audio?: string } = {},
): MatchingActivity {
  return {
    id: extra.id ?? uniqueId(`matchp-${instruction}`),
    type: 'matching',
    title: extra.title ?? 'طابِق',
    instruction,
    audio: extra.audio ?? instruction,
    pairs: pairs.map(([ll, le, rl, re]) => ({ left: v(ll, le), right: v(rl, re) })),
  };
}

/** سحب وإفلات */
export function dragTo(
  instruction: string,
  targets: Pair[],
  items: Triple[],
  extra: { id?: string; title?: string; audio?: string } = {},
): DragDropActivity {
  const t = targets.map(([l, e]) => ({ id: uniqueId(l), label: l, visual: emojiVisual(e) }));
  return {
    id: extra.id ?? uniqueId(`drag-${instruction}`),
    type: 'drag-drop',
    title: extra.title ?? 'اسحب وضع في المكان الصحيح',
    instruction,
    audio: extra.audio ?? instruction,
    targets: t,
    items: items.map(([l, e, targetLabel]) => ({
      id: uniqueId(l),
      label: l,
      visual: emojiVisual(e),
      targetId: t.find((x) => x.label === targetLabel)?.id ?? t[0].id,
    })),
  };
}

/** ترتيب الخطوات */
export function seq(
  instruction: string,
  steps: Pair[],
  extra: { id?: string; title?: string; audio?: string } = {},
): SequenceActivity {
  return {
    id: extra.id ?? uniqueId(`seq-${instruction}`),
    type: 'sequence',
    title: extra.title ?? 'رتّب الخطوات',
    instruction,
    audio: extra.audio ?? instruction,
    steps: steps.map(([l, e]) => v(l, e)),
  };
}

/** لعبة الذاكرة */
export function mem(items: Pair[], instruction = 'اقلب البطاقات وابحث عن الأزواج المتشابهة', extra: { id?: string; title?: string } = {}): MemoryActivity {
  return {
    id: extra.id ?? uniqueId(`mem-${instruction}-${items.length}`),
    type: 'memory',
    title: extra.title ?? 'لعبة الذاكرة',
    instruction,
    audio: instruction,
    items: items.map(([l, e]) => v(l, e)),
  };
}

function toBuckets(buckets: Pair[]) {
  return buckets.map(([l, e]) => ({ id: uniqueId(l), label: l, visual: emojiVisual(e), _label: l }));
}

/** تصنيف إلى سلال */
export function sortBy(
  instruction: string,
  buckets: Pair[],
  items: Triple[],
  extra: { id?: string; title?: string; audio?: string } = {},
): SortingActivity {
  const b = toBuckets(buckets);
  return {
    id: extra.id ?? uniqueId(`sort-${instruction}`),
    type: 'sorting',
    title: extra.title ?? 'صنّف',
    instruction,
    audio: extra.audio ?? instruction,
    buckets: b.map(({ id, label, visual }) => ({ id, label, visual })),
    items: items.map(([l, e, bucketLabel]) => ({
      id: uniqueId(l),
      label: l,
      visual: emojiVisual(e),
      bucketId: b.find((x) => x._label === bucketLabel)?.id ?? b[0].id,
    })),
  };
}

/** تصنيف إلى فئات */
export function catBy(
  instruction: string,
  categories: Pair[],
  items: Triple[],
  extra: { id?: string; title?: string; audio?: string } = {},
): CategoryActivity {
  const c = toBuckets(categories);
  return {
    id: extra.id ?? uniqueId(`cat-${instruction}`),
    type: 'category',
    title: extra.title ?? 'صنّف في الفئة الصحيحة',
    instruction,
    audio: extra.audio ?? instruction,
    categories: c.map(({ id, label, visual }) => ({ id, label, visual })),
    items: items.map(([l, e, catLabel]) => ({
      id: uniqueId(l),
      label: l,
      visual: emojiVisual(e),
      categoryId: c.find((x) => x._label === catLabel)?.id ?? c[0].id,
    })),
  };
}

/** العدّ */
export function countQ(
  count: number,
  unit: Pair,
  choices: number[],
  extra: { id?: string; prompt?: string; title?: string; instruction?: string } = {},
): CountingActivity {
  const prompt = extra.prompt ?? `كم عدد ${unit[0]}؟`;
  return {
    id: extra.id ?? uniqueId(`count-${count}-${unit[0]}`),
    type: 'counting',
    title: extra.title ?? 'هيا نعُدّ',
    instruction: extra.instruction ?? prompt,
    audio: prompt,
    prompt,
    count,
    unit: v(unit[0], unit[1]),
    choices,
  };
}

/** مسألة حسابية بصرية (جمع/طرح) */
export function mathQ(
  left: number,
  op: '+' | '-',
  right: number,
  unit: Pair,
  choices: number[],
  extra: { id?: string; prompt?: string; title?: string; instruction?: string; digitsOnly?: boolean } = {},
): CountingActivity {
  const prompt = extra.prompt ?? `${left} ${op === '+' ? 'زائد' : 'ناقص'} ${right} يساوي كم؟`;
  return {
    id: extra.id ?? uniqueId(`math-${left}${op}${right}`),
    type: 'counting',
    title: extra.title ?? 'هيا نحسب',
    instruction: extra.instruction ?? prompt,
    audio: prompt,
    prompt,
    count: op === '+' ? left + right : Math.max(left - right, 0),
    unit: v(unit[0], unit[1]),
    choices,
    expression: { left, op, right },
    digitsOnly: extra.digitsOnly,
  };
}

/** التتبع والكتابة */
export function trace(
  mode: TracingActivity['mode'],
  guide: string | undefined,
  instruction: string,
  extra: { id?: string; title?: string; guideLabel?: string } = {},
): TracingActivity {
  return {
    id: extra.id ?? uniqueId(`trace-${mode}-${guide ?? 'free'}`),
    type: 'tracing',
    title: extra.title ?? 'هيا نكتب',
    instruction,
    audio: instruction,
    mode,
    guide,
    guideLabel: extra.guideLabel,
  };
}

/** بناء جملة */
export function sentence(
  instruction: string,
  answer: string[],
  distractors: string[] = [],
  extra: { id?: string; title?: string; resultAudio?: string } = {},
): BuildSentenceActivity {
  return {
    id: extra.id ?? uniqueId(`sentence-${instruction}`),
    type: 'build-sentence',
    title: extra.title ?? 'رتّب الجملة',
    instruction,
    audio: instruction,
    prompt: instruction,
    answer,
    distractors,
    resultAudio: extra.resultAudio ?? answer.join(' '),
  };
}

/** صح أم خطأ */
export function tf(
  statement: string,
  isTrue: boolean,
  explain: string,
  extra: { id?: string; title?: string; instruction?: string; visual?: Visual } = {},
): TrueFalseActivity {
  return {
    id: extra.id ?? uniqueId(`tf-${statement}`),
    type: 'true-false',
    title: extra.title ?? 'فكّر معي',
    instruction: extra.instruction ?? 'هل هذا صحيح؟',
    audio: statement,
    statement,
    isTrue,
    explain,
    visual: extra.visual,
  };
}

/** قصة اجتماعية / مشهد تفاعلي */
export function story(instruction: string, scenes: StoryScene[], extra: { id?: string; title?: string } = {}): StoryActivity {
  return {
    id: extra.id ?? uniqueId(`story-${instruction}`),
    type: 'story',
    title: extra.title ?? 'قصة مصوّرة',
    instruction,
    audio: instruction,
    scenes,
  };
}

/** محاكاة تفاعلية */
export function sim(
  kind: SimKind,
  instruction: string,
  steps: string[],
  extra: { id?: string; title?: string; realWorld?: string } = {},
): SimulationActivity {
  return {
    id: extra.id ?? uniqueId(`sim-${kind}`),
    type: 'simulation',
    title: extra.title ?? 'هيا نجرب',
    instruction,
    audio: instruction,
    sim: kind,
    steps,
    realWorld: extra.realWorld,
  };
}

/** نشاط واقعي مع المشرف */
export function sup(
  instruction: string,
  tools: string[],
  steps: string[],
  extra: { id?: string; title?: string; safetyNote?: string; adultNote?: string } = {},
): SupervisedActivity {
  return {
    id: extra.id ?? uniqueId(`sup-${instruction}`),
    type: 'supervised',
    title: extra.title ?? 'جرّبها مع الشخص الذي يساعدك',
    instruction,
    audio: instruction,
    tools,
    steps,
    safetyNote: extra.safetyNote,
    adultNote: extra.adultNote,
  };
}

/** مشغّل استماع (تلاوات وتسجيلات بشرية — بلا قراءة آلية) */
export function player(
  instruction: string,
  tracks: ListenTrack[],
  extra: { id?: string; title?: string; noTts?: boolean } = {},
): ListenPlayerActivity {
  return {
    id: extra.id ?? uniqueId(`player-${instruction}`),
    type: 'listen-player',
    title: extra.title ?? 'استمع وتعلّم',
    instruction,
    audio: instruction,
    tracks,
    noTts: extra.noTts ?? true,
  };
}

/** محاكاة الحاسوب */
export function pc(
  task: ComputerTaskId,
  instruction: string,
  payload: ComputerSimActivity['payload'] = {},
  extra: { id?: string; title?: string } = {},
): ComputerSimActivity {
  return {
    id: extra.id ?? uniqueId(`pc-${task}-${instruction}`),
    type: 'computer-sim',
    title: extra.title ?? 'تدريب على الحاسوب',
    instruction,
    audio: instruction,
    task,
    payload,
  };
}

export interface SkillDef {
  sourceId: string;
  title: string;
  instruction: string;
  description?: string;
  icon?: string;
  modes?: TrainingMode[];
  vocab?: VocabItem[];
  games?: Activity[];
  audio?: string;
  keywords?: string[];
  supervisorRequired?: boolean;
  safetyLevel?: SafetyLevel;
  supervisorNote?: string;
  safetyNote?: string;
  needsReview?: boolean;
  needsReviewNote?: string;
  duplicateOf?: string[];
  /**
   * إذا لم تُعرَّف ألعاب، تُبنى لعبة اختيار صورة تلقائياً من المفردات (بيانات حقيقية من البند نفسه).
   */
  autoGame?: boolean;
}

const MODE_BY_TYPE: Record<string, TrainingMode> = {
  'picture-choice': 'picture-choice',
  'audio-choice': 'audio-choice',
  matching: 'matching',
  'drag-drop': 'drag-drop',
  sequence: 'sequence',
  memory: 'memory',
  sorting: 'sorting',
  counting: 'counting',
  tracing: 'tracing',
  'build-sentence': 'build-sentence',
  category: 'category',
  'true-false': 'true-false',
  'computer-sim': 'computer-sim',
  story: 'story',
  simulation: 'simulation',
  supervised: 'real-world',
};

/** بناء مهارة كاملة من بند الاستمارة الأصلي */
export function S(def: SkillDef): Skill {
  const src: SourceItem | undefined = sourceById[def.sourceId];
  if (!src) throw new Error(`[content] بند مصدر غير موجود: ${def.sourceId}`);

  const vocab = def.vocab ?? [];
  const games = [...(def.games ?? [])];

  if (games.length === 0 && def.autoGame !== false && vocab.length >= 2) {
    const options = vocab.slice(0, Math.min(3, vocab.length));
    games.push(
      pic(
        `أين ${options[0].label}؟`,
        options.map((o) => [o.label, o.visual.value] as Pair),
        options[0].label,
        { title: 'هيا نلعب' },
      ),
    );
  }

  const activities: Activity[] = [];
  if (vocab.length > 0) {
    const explore: ExploreActivity = {
      id: `${src.id}#explore`,
      type: 'explore',
      title: 'شاهد واستمع',
      instruction: src.originalText,
      audio: def.audio ?? def.title,
      items: vocab,
      hint: 'المس أي صورة لتسمع اسمها',
    };
    activities.push(explore);
  }
  games.forEach((g, i) => {
    activities.push({ ...g, id: `${src.id}#${i + 1}-${g.type}` } as Activity);
  });

  const modes = new Set<TrainingMode>(['watch', 'listen', 'learn']);
  modes.add('real-world');
  games.forEach((g) => {
    const m = MODE_BY_TYPE[g.type];
    if (m) modes.add(m);
  });
  const modesArr = def.modes ? Array.from(new Set([...modes, ...def.modes])) : Array.from(modes);

  const supervisorRequired =
    def.supervisorRequired ??
    (games.some((g) => g.type === 'supervised' || g.type === 'simulation') && src.domain !== 'cognitive');

  const skillsInCategory = '__categoryCount';

  const keywords = Array.from(
    new Set([
      ...(def.keywords ?? []),
      ...vocab.map((x) => x.label),
      src.originalText,
      def.title,
    ]),
  ).filter(Boolean);

  void skillsInCategory;

  return {
    id: src.id,
    sourceId: src.id,
    domain: src.domain,
    category: src.category,
    sourcePage: src.sourcePage,
    sourceItemNumber: src.sourceItemNumber,
    originalText: src.originalText,
    childFriendlyTitle: def.title,
    childFriendlyInstruction: def.instruction,
    description: def.description ?? def.instruction,
    icon: emojiVisual(def.icon ?? vocab[0]?.visual.value ?? '🌱'),
    trainingMode: modesArr,
    supervisorRequired,
    safetyLevel: def.safetyLevel ?? (supervisorRequired ? 'supervised' : 'digital'),
    activities,
    audioText: def.audio ?? def.title,
    keywords,
    needsReview: def.needsReview ?? src.needsReview,
    needsReviewNote: def.needsReviewNote ?? src.needsReviewNote,
    supervisorNote: def.supervisorNote,
    safetyNote: def.safetyNote,
    duplicateOf: def.duplicateOf,
  };
}
