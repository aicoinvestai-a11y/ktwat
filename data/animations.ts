/**
 * الحركات التوضيحية — خطوتي 🎬
 *
 * بعض المهارات لا تكفي فيها صورة واحدة: الوضوء والصلاة وغسل اليدين والعجن والمقص وعبور الشارع…
 * حركاتها **تسلسل** لا لقطة. لذلك لكل مهارة من هذه المهارات «حركة توضيحية»:
 * خطوات مرقّمة، كل خطوة صورة متحرّكة صغيرة (SVG) + جملة تُقرأ وتُسمع.
 *
 * قواعد ملزمة:
 *  • لا تشغيل تلقائي: الطفل (أو مرافقه) يضغط ▶.
 *  • لا وميض ولا حركة سريعة، والوضع الهادئ 🌿 يوقف الحركة ويترك التنقّل بالزر.
 *  • كل خطوة لها نص مكتوب (يُقرأ ويُسمع) — فالحركة لا تعتمد على الصورة وحدها.
 *  • المهارات الحسّاسة تُعرض كمحاكاة مع تنبيه «بإشراف شخص بالغ».
 *
 * إضافة حركة جديدة: أضف تعريفاً هنا + مشهدها في components/animations/scenes.tsx.
 */
import type { Skill } from '@/data/types';
import { allSkills } from '@/data/skills';

export type AnimationKey =
  | 'wudu'
  | 'prayer'
  | 'handwash'
  | 'teeth'
  | 'comb'
  | 'nails'
  | 'knead'
  | 'cut'
  | 'fold'
  | 'sweep'
  | 'wipe'
  | 'cross'
  | 'dress'
  | 'hammer'
  | 'glue';

export interface AnimationStep {
  /** الجملة التي تظهر وتُسمع مع هذه الخطوة */
  caption: string;
  /** نص منطوق بديل عند الحاجة (تُستخدم الجملة نفسها افتراضياً) */
  audio?: string;
}

export interface AnimationDef {
  key: AnimationKey;
  /** عنوان الحركة كما يراه الطفل */
  title: string;
  /** سطر توضيحي موجز */
  hint: string;
  /** كلمات تُطابَق مع نص المهارة ووسومها لربط الحركة آلياً */
  match: string[];
  /** مهارات محدَّدة بالاسم (لها أولوية على المطابقة بالكلمات) */
  skillIds?: string[];
  steps: AnimationStep[];
  /** ملاحظة إشراف أو سلامة تُعرض مع الحركة */
  note?: string;
  supervised?: boolean;
  safetySensitive?: boolean;
}

export const ANIMATIONS: AnimationDef[] = [
  {
    key: 'wudu',
    title: 'أتوضّأ خطوة خطوة',
    hint: 'ثماني خطوات مرتّبة — اضغط ▶ ثم تابع معي',
    match: ['الوضوء', 'يتوضأ', 'أتوضأ', 'مضمض', 'استنشق'],
    skillIds: ['cg-isl-021'],
    steps: [
      { caption: 'أغسل كفّيّ ثلاث مرات.' },
      { caption: 'أتمضمض الماء في فمي.' },
      { caption: 'أستنشق الماء في أنفي بلطف.' },
      { caption: 'أغسل وجهي كاملاً.' },
      { caption: 'أغسل ذراعي الأيمن ثم الأيسر إلى المرفقين.' },
      { caption: 'أمسح رأسي بيدي المبلّلة.' },
      { caption: 'أمسح أذنيّ.' },
      { caption: 'أغسل قدمي اليمنى ثم اليسرى إلى الكعبين.' },
    ],
    note: 'نص هذه الحركة ويُراجع بشرياً من مصدر موثوق قبل الاستخدام الموسّع، كما هو حال بقية المحتوى الديني في الموقع.',
  },
  {
    key: 'prayer',
    title: 'حركات الصلاة بالترتيب',
    hint: 'أربع حركات أساسية — أراجعها مع شخص بالغ',
    match: ['حركات الصلاة', 'يصلي'],
    skillIds: ['cg-isl-022'],
    steps: [
      { caption: 'أقف مستقبلاً القبلة وأكبّر.' },
      { caption: 'أركع وأقول: سبحان ربي العظيم.' },
      { caption: 'أسجد وأقول: سبحان ربي الأعلى.' },
      { caption: 'أجلس ثم أسجد مرة أخرى.' },
    ],
    note: 'نص هذه الحركة ويُراجع بشرياً من مصدر موثوق قبل الاستخدام الموسّع، كما هو حال بقية المحتوى الديني في الموقع.',
  },
  {
    key: 'handwash',
    title: 'أغسل يديّ ووجهي',
    hint: 'خمس خطوات للنظافة',
    match: ['يغسل يديه', 'غسل اليدين', 'غسل الوجه واليدين', 'يديه بالماء', 'الصابون'],
    skillIds: ['sc-hyg-002', 'sc-hyg-003'],
    steps: [
      { caption: 'أبلّ يديّ بالماء.' },
      { caption: 'أضع قليلاً من الصابون.' },
      { caption: 'أفرك كفّيّ وظهر اليد وبين الأصابع.' },
      { caption: 'أشطف يديّ بالماء حتى يزول الصابون.' },
      { caption: 'أجفّف يديّ بالمنشفة.' },
    ],
  },
  {
    key: 'teeth',
    title: 'أنظّف أسناني',
    hint: 'أربع خطوات لابتسامة نظيفة',
    match: ['أسنانه بالفرشاة', 'تنظيف أسنانه', 'فرشاة أسنان', 'معجون أسنان', 'أسنانه'],
    skillIds: ['sc-hyg-005'],
    steps: [
      { caption: 'أضع قليلاً من المعجون على الفرشاة.' },
      { caption: 'أفرش الأسنان العلوية من أعلى إلى أسفل.' },
      { caption: 'أفرش الأسنان السفلية من أسفل إلى أعلى.' },
      { caption: 'أمضمض فمي بالماء وأبصق.' },
    ],
  },
  {
    key: 'comb',
    title: 'أمشّط شعري',
    hint: 'ثلاث خطوات بهدوء',
    match: ['تسريح', 'المشط', 'أمشط'],
    skillIds: ['sc-hyg-004'],
    steps: [
      { caption: 'أمسك المشط بيدي.' },
      { caption: 'أمشّط من الأعلى إلى الأسفل.' },
      { caption: 'أمشّط الأطراف بهدوء حتى تصبح مرتّبة.' },
    ],
  },
  {
    key: 'nails',
    title: 'أقصّ أظافري',
    hint: 'مع شخص بالغ — ثلاث خطوات',
    match: ['الأظافر', 'أظافره', 'أظافر'],
    skillIds: ['sc-hyg-007'],
    supervised: true,
    safetySensitive: true,
    steps: [
      { caption: 'أمسك مقصّ الأظافر بيد، والإصبع باليد الأخرى.' },
      { caption: 'أقصّ طرف الظفر بهدوء.' },
      { caption: 'أغسل يديّ بعدهما.' },
    ],
    note: 'هذه الحركة تُجرَّب بإشراف مباشر من شخص بالغ.',
  },
  {
    key: 'knead',
    title: 'أعجن وأشكّل',
    hint: 'خمس خطوات للعجين والصلصال والطين',
    match: ['العجين', 'العجن', 'أعجن', 'يعجن'],
    skillIds: ['mt-fin-001', 'mt-fin-003', 'mt-fin-004', 'mt-fin-006', 'vo-pre-004'],
    supervised: true,
    steps: [
      { caption: 'أضع الطحين في الوعاء.' },
      { caption: 'أضيف الماء قليلاً قليلاً.' },
      { caption: 'أخلط بالمعلقة.' },
      { caption: 'أعجن بيديّ حتى يصبح طرياً.' },
      { caption: 'أشكّل منه كرات أو أشكالاً.' },
    ],
  },
  {
    key: 'cut',
    title: 'أستخدم المقص',
    hint: 'مع شخص بالغ — أربع خطوات آمنة',
    match: ['المقص', 'قصاص', 'قص الورق'],
    skillIds: ['vo-pre-003', 'vo-pre-010'],
    supervised: true,
    safetySensitive: true,
    steps: [
      { caption: 'أمسك الورقة بيدي وأثبّتها.' },
      { caption: 'أفتح المقص وأضع أصابعي في المقبض.' },
      { caption: 'أحرّك المقص على الخط ببطء.' },
      { caption: 'أُعيد المقص إلى مكانه بعد الانتهاء.' },
    ],
    note: 'المقص أداة تحتاج شخصاً بالغاً قريباً — تُجرَّب بإشرافه.',
  },
  {
    key: 'fold',
    title: 'أطوي الورقة',
    hint: 'أربع خطوات لورقة مرتّبة',
    match: ['طوي الورقة', 'طيات الورقة'],
    skillIds: ['vo-pre-005'],
    steps: [
      { caption: 'أضع الورقة أمامي مستوية.' },
      { caption: 'أطوي نصفها على النصف.' },
      { caption: 'أضغط على الطيّة بإصبعي.' },
      { caption: 'أطويها مرة أخرى ليصغر حجمها.' },
    ],
  },
  {
    key: 'sweep',
    title: 'أكنس المكان',
    hint: 'أربع خطوات حتى المكان النظيف',
    match: ['المكنسة', 'أكنس', 'كنس', 'السجاد'],
    skillIds: ['sc-shop-006'],
    steps: [
      { caption: 'أمسك المكنسة بيديّ الاثنتين.' },
      { caption: 'أكنس من بعيد إلى قريب.' },
      { caption: 'أجمع الكومة في المغرفة.' },
      { caption: 'أفرغ المغرفة في سلة المهملات.' },
    ],
  },
  {
    key: 'wipe',
    title: 'أمسح وأنظّف',
    hint: 'أربع خطوات للمسح والنظافة',
    match: ['مسح الغبرة', 'أمسح الطاولة', 'الفوطة', 'ملمع'],
    skillIds: ['sc-shop-005'],
    supervised: true,
    steps: [
      { caption: 'أضع قليلاً من المنظّف على الفوطة.' },
      { caption: 'أمسح من الأعلى إلى الأسفل.' },
      { caption: 'أمسح الزوايا والأطراف.' },
      { caption: 'أعيد الفوطة إلى مكانها.' },
    ],
    note: 'مواد التنظيف تُستخدم بإشراف شخص بالغ.',
  },
  {
    key: 'cross',
    title: 'أعبر الشارع بأمان',
    hint: 'محاكاة رقمية — لا تُجرَّب منفرداً',
    match: ['قطع الشارع', 'عبور الشارع', 'الشارع بشكل آمن', 'الرصيف'],
    skillIds: ['sc-saf-004'],
    supervised: true,
    safetySensitive: true,
    steps: [
      { caption: 'أقف عند طرف الرصيف وأتوقّف تماماً.' },
      { caption: 'أنظر يميناً.' },
      { caption: 'أنظر يساراً.' },
      { caption: 'أنظر يميناً مرة أخرى.' },
      { caption: 'أعبر على الممرّ بخطوات هادئة وأنا ممسك بيد شخص بالغ.' },
    ],
    note: 'هذه محاكاة تعليمية على الشاشة فقط. عبور الشارع الحقيقي يكون دائماً مع شخص بالغ من المكان المخصّص.',
  },
  {
    key: 'dress',
    title: 'ألبس حذائي وأغلق السحاب',
    hint: 'خمس خطوات للّبس والترتيب',
    match: ['لبس الحذاء', 'فتح وإغلاق السحاب', 'الكبسات', 'لبس الملابس'],
    skillIds: ['sc-clo-007', 'sc-clo-004', 'sc-clo-005', 'sc-clo-006'],
    steps: [
      { caption: 'أجلس على الكرسي بهدوء.' },
      { caption: 'أُدخل قدمي في الحذاء.' },
      { caption: 'أشدّ كعب الحذاء بيدي.' },
      { caption: 'أغلق السحاب أو أضغط الكبسة.' },
      { caption: 'أتأكّد أن الحذاء مريح على قدمي.' },
    ],
  },
  {
    key: 'hammer',
    title: 'أدقّ المسمار بالشاكوش',
    hint: 'مع شخص بالغ — أربع خطوات آمنة',
    match: ['الشاكوش', 'دق مسامير', 'المسمار', 'مسامير'],
    skillIds: ['vo-pre-015'],
    supervised: true,
    safetySensitive: true,
    steps: [
      { caption: 'أمسك المسمار بيد، والشاكوش باليد الأخرى.' },
      { caption: 'أثبّت رأس المسمار على الخشب.' },
      { caption: 'أدقّ الشاكوش بهدوء على رأس المسمار.' },
      { caption: 'أتوقّف وأتأكّد أن المسمار دخل مستقيماً.' },
    ],
    note: 'الشاكوش والمسمار أدوات تحتاج شخصاً بالغاً قريباً — تُجرَّب بإشرافه فقط.',
  },
  {
    key: 'glue',
    title: 'ألصق بالغراء',
    hint: 'أربع خطوات للصق مرتّب',
    match: ['الغراء', 'ألصق', 'الصق المواد'],
    skillIds: ['vo-pre-006'],
    supervised: true,
    steps: [
      { caption: 'أفتح أنبوب الغراء.' },
      { caption: 'أضع قليلاً من الغراء على القطعة.' },
      { caption: 'أضغط القطعتين معاً بهدوء.' },
      { caption: 'أنتظر قليلاً حتى يجفّ الغراء.' },
    ],
    note: 'الغراء يُستخدم بحذر وبإشراف شخص بالغ، وبعيداً عن العين والفم.',
  },
];

export const animationByKey: Record<string, AnimationDef> = Object.fromEntries(
  ANIMATIONS.map((a) => [a.key, a]),
);

/** الصيغة المطبَّعة للمطابقة: تشكيل وتطويل وحروف متشابهة */
const norm = (s: string) =>
  s
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();

/** الحركة المرتبطة بمهارة: المهارات المسمّاة أولاً، ثم المطابقة بالكلمات */
export function animationForSkill(skill: Skill): AnimationDef | null {
  const named = ANIMATIONS.find((a) => a.skillIds?.includes(skill.id));
  if (named) return named;
  const haystack = norm(`${skill.childFriendlyTitle} ${skill.originalText} ${skill.keywords.join(' ')}`);
  return ANIMATIONS.find((a) => a.match.some((m) => haystack.includes(norm(m)))) ?? null;
}

/** كل المهارات التي لها حركة توضيحية (تُستخدم في الفحوص الآلية والتقارير) */
export function animatedSkills(skills: Skill[] = allSkills): { skill: Skill; animation: AnimationDef }[] {
  return skills
    .map((skill) => ({ skill, animation: animationForSkill(skill) }))
    .filter((x): x is { skill: Skill; animation: AnimationDef } => x.animation !== null);
}
