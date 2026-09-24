/**
 * نموذج البيانات الأساسي — خطوتي
 * كل مهارة في الاستمارة (245 بنداً) لها سجل واحد هنا، والنص الأصلي محفوظ حرفياً.
 */

export type DomainId = 'self-care' | 'cognitive' | 'motor' | 'vocational';

export type SafetyLevel = 'digital' | 'supervised' | 'safety-sensitive';

export type TrainingMode =
  | 'watch'
  | 'listen'
  | 'learn'
  | 'picture-choice'
  | 'audio-choice'
  | 'matching'
  | 'drag-drop'
  | 'sequence'
  | 'memory'
  | 'sorting'
  | 'counting'
  | 'tracing'
  | 'build-sentence'
  | 'category'
  | 'true-false'
  | 'computer-sim'
  | 'story'
  | 'simulation'
  | 'role-play'
  | 'real-world';

export type GameType =
  | 'explore'
  | 'picture-choice'
  | 'audio-choice'
  | 'matching'
  | 'drag-drop'
  | 'sequence'
  | 'memory'
  | 'sorting'
  | 'counting'
  | 'tracing'
  | 'build-sentence'
  | 'category'
  | 'true-false'
  | 'computer-sim'
  | 'story'
  | 'simulation'
  | 'supervised'
  | 'listen-player';

export type Visual = {
  /** emoji حالي = عنصر نائب موثق، و image = رسمة أصلية داخل /public/illustrations */
  kind: 'emoji' | 'image' | 'letter';
  value: string;
};

export interface VocabItem {
  id: string;
  label: string;
  /** النص الذي يُنطق عند الضغط (افتراضياً = label) */
  audio: string;
  visual: Visual;
  group?: string;
}

export interface ActivityBase {
  id: string;
  type: GameType;
  title: string;
  /** تعليمة بلغة الطفل */
  instruction: string;
  /** جملة تُنطق بضغط زر السماع */
  audio?: string;
}

export interface ExploreActivity extends ActivityBase {
  type: 'explore';
  items: VocabItem[];
  hint?: string;
}

export interface PictureChoiceActivity extends ActivityBase {
  type: 'picture-choice';
  prompt: string;
  options: VocabItem[];
  answerId: string;
}

export interface AudioChoiceActivity extends ActivityBase {
  type: 'audio-choice';
  prompt: string;
  /** مفتاح ملف صوتي حقيقي في مكتبة الأصوات */
  soundKey: string;
  soundLabel: string;
  options: VocabItem[];
  answerId: string;
}

export interface MatchingActivity extends ActivityBase {
  type: 'matching';
  pairs: { left: VocabItem; right: VocabItem }[];
}

export interface DragDropActivity extends ActivityBase {
  type: 'drag-drop';
  targets: { id: string; label: string; visual: Visual }[];
  items: { id: string; label: string; visual: Visual; targetId: string }[];
}

export interface SequenceActivity extends ActivityBase {
  type: 'sequence';
  steps: VocabItem[];
}

export interface MemoryActivity extends ActivityBase {
  type: 'memory';
  items: VocabItem[];
}

export interface SortingActivity extends ActivityBase {
  type: 'sorting';
  buckets: { id: string; label: string; visual: Visual }[];
  items: { id: string; label: string; visual: Visual; bucketId: string }[];
}

export interface CategoryActivity extends ActivityBase {
  type: 'category';
  categories: { id: string; label: string; visual: Visual }[];
  items: { id: string; label: string; visual: Visual; categoryId: string }[];
}

export interface CountingActivity extends ActivityBase {
  type: 'counting';
  prompt: string;
  count: number;
  unit: VocabItem;
  choices: number[];
  /** عملية حسابية بصرية (جمع/طرح) — تُعرض المجموعات ثم الخيارات */
  expression?: { left: number; op: '+' | '-'; right: number };
  /** عرض الأرقام الكبيرة (منزلتين/ثلاث منازل) نصياً */
  digitsOnly?: boolean;
}

export interface TracingActivity extends ActivityBase {
  type: 'tracing';
  mode: 'free' | 'lines' | 'dots' | 'letter' | 'word' | 'sentence';
  /** الحرف أو الكلمة أو الجملة الموجّهة */
  guide?: string;
  guideLabel?: string;
}

export interface BuildSentenceActivity extends ActivityBase {
  type: 'build-sentence';
  prompt: string;
  /** الكلمات الصحيحة بالترتيب */
  answer: string[];
  /** كلمات إضافية للتشويش التدريجي */
  distractors?: string[];
  /** نص يُنطق عند إكمال الجملة */
  resultAudio?: string;
}

export interface TrueFalseActivity extends ActivityBase {
  type: 'true-false';
  statement: string;
  isTrue: boolean;
  explain: string;
  visual?: Visual;
}

export type ComputerTaskId =
  | 'parts'
  | 'posture'
  | 'power'
  | 'mouse'
  | 'keyboard'
  | 'window'
  | 'word'
  | 'powerpoint'
  | 'paint'
  | 'typing';

export interface ComputerSimActivity extends ActivityBase {
  type: 'computer-sim';
  task: ComputerTaskId;
  /** بيانات خاصة بكل مهمة */
  payload?: {
    targetLabel?: string;
    targetVisual?: Visual;
    text?: string;
    options?: { label: string; visual: Visual }[];
    answerLabel?: string;
  };
}

export interface StoryChoice {
  label: string;
  visual: Visual;
  correct: boolean;
  feedback: string;
}

export interface StoryScene {
  text: string;
  visual: Visual;
  audio?: string;
  question?: string;
  options?: StoryChoice[];
}

export interface StoryActivity extends ActivityBase {
  type: 'story';
  scenes: StoryScene[];
}

export type SimKind =
  | 'zipper'
  | 'buttons'
  | 'snap'
  | 'faucet'
  | 'pour-water'
  | 'straw'
  | 'clothesline'
  | 'sweep'
  | 'wipe'
  | 'vacuum'
  | 'money'
  | 'traffic-light'
  | 'cross-street'
  | 'cut-paper'
  | 'fold-paper'
  | 'paint'
  | 'measure'
  | 'assemble'
  | 'thread-needle'
  | 'screw'
  | 'hammer'
  | 'knead'
  | 'sponge-transfer'
  | 'spoon-transfer'
  | 'beads'
  | 'blocks'
  | 'washing-hands'
  | 'brushing-teeth'
  | 'wudu'
  | 'prayer'
  | 'spoon-to-mouth'
  | 'spoon-sandwich';

export interface SimulationActivity extends ActivityBase {
  type: 'simulation';
  sim: SimKind;
  steps: string[];
  /** تعليمات للاستخدام الحقيقي لاحقاً */
  realWorld?: string;
}

export interface ListenTrack {
  id: string;
  title: string;
  /** مسار ملف صوتي حقيقي (تلاوة قرآنية أو تسجيل بشري) */
  src: string;
  /** نص موثوق (للقرآن: النص العثماني من مصدر مراجع) */
  text?: string;
  note?: string;
}

export interface ListenPlayerActivity extends ActivityBase {
  type: 'listen-player';
  tracks: ListenTrack[];
  /** لا تُستخدم أي قراءة آلية في هذا المشغل */
  noTts?: boolean;
}

export interface SupervisedActivity extends ActivityBase {
  type: 'supervised';
  tools: string[];
  steps: string[];
  safetyNote?: string;
  adultNote?: string;
}

export type Activity =
  | ExploreActivity
  | PictureChoiceActivity
  | AudioChoiceActivity
  | MatchingActivity
  | DragDropActivity
  | SequenceActivity
  | MemoryActivity
  | SortingActivity
  | CategoryActivity
  | CountingActivity
  | TracingActivity
  | BuildSentenceActivity
  | TrueFalseActivity
  | ComputerSimActivity
  | StoryActivity
  | SimulationActivity
  | SupervisedActivity
  | ListenPlayerActivity;

export interface Skill {
  id: string;
  /** مرجع بند الاستمارة الأصلي (1:1) */
  sourceId: string;
  domain: DomainId;
  category: string;
  /** رقم صفحة المصدر (1-22) */
  sourcePage: number;
  sourceItemNumber: number;
  /** النص الأصلي من الاستمارة — لا يُعدّل إطلاقاً */
  originalText: string;
  childFriendlyTitle: string;
  childFriendlyInstruction: string;
  description: string;
  icon: Visual;
  trainingMode: TrainingMode[];
  supervisorRequired: boolean;
  safetyLevel: SafetyLevel;
  activities: Activity[];
  audioText: string;
  keywords: string[];
  /** بند يحتاج مراجعة نصية (OCR غامض) — يبقى ظاهراً ولا يُحذف */
  needsReview?: boolean;
  needsReviewNote?: string;
  /** ملاحظة للأهل/الأخصائي */
  supervisorNote?: string;
  /** تنبيه سلامة صريح */
  safetyNote?: string;
  /** مراجع ظهور البند في مواضع أخرى متطابقة حرفياً */
  duplicateOf?: string[];
}

export interface Category {
  id: string;
  domain: DomainId;
  title: string;
  childTitle: string;
  description: string;
  icon: Visual;
  sourcePages: number[];
  /** منطقة على خريطة العالم */
  mapSpot?: string;
}

export interface Domain {
  id: DomainId;
  order: number;
  title: string;
  childTitle: string;
  tagline: string;
  description: string;
  icon: Visual;
  color: 'sky' | 'mint' | 'sun' | 'grape' | 'peach';
}

export interface SourceItem {
  id: string;
  domain: DomainId;
  category: string;
  sourcePage: number;
  sourceItemNumber: number;
  originalText: string;
  needsReview?: boolean;
  needsReviewNote?: string;
}
