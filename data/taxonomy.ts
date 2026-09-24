/**
 * المحاور والأقسام — خطوتي
 * هيكل ثابت يقابل الاستمارة حرفياً (17 قسماً داخل 4 محاور).
 */
import type { Category, Domain } from './types';

export const DOMAINS: Domain[] = [
  {
    id: 'self-care',
    order: 1,
    title: 'إدارة الذات',
    childTitle: 'حياتي اليومية',
    tagline: 'أتعلم مهارات حياتي اليومية',
    description: 'مهارات الاستقلالية: الطعام والشرب، النظافة الشخصية، الملابس، الأمن والسلامة، التسوق وتنظيف البيئة، اللغة والتواصل، والمهارات الاجتماعية.',
    icon: { kind: 'emoji', value: '🏡' },
    color: 'mint',
  },
  {
    id: 'cognitive',
    order: 2,
    title: 'الإدراكي',
    childTitle: 'التفكير والتعلم',
    tagline: 'أتعرف وأقرأ وأحسب',
    description: 'المهارات الإدراكية الحسية، القراءة، الكتابة، الحساب والمفاهيم العددية، العلوم الحياتية، والتربية الإسلامية.',
    icon: { kind: 'emoji', value: '🧠' },
    color: 'sky',
  },
  {
    id: 'motor',
    order: 3,
    title: 'الحركي',
    childTitle: 'الحركة',
    tagline: 'أستخدم يدي وجسمي',
    description: 'المهارات الحركية الدقيقة والمهارات الحركية الكبيرة — تُنفّذ الأنشطة الحقيقية بإشراف شخص بالغ.',
    icon: { kind: 'emoji', value: '🏃' },
    color: 'sun',
  },
  {
    id: 'vocational',
    order: 4,
    title: 'المهني',
    childTitle: 'المهارات والعمل',
    tagline: 'أتعلم وأصنع وأستخدم الحاسوب',
    description: 'التهيئة المهنية والأشغال اليدوية ومهارات الحاسوب.',
    icon: { kind: 'emoji', value: '🛠️' },
    color: 'grape',
  },
];

export const domainById = Object.fromEntries(DOMAINS.map((d) => [d.id, d]));

export const CATEGORIES: Category[] = [
  // المحور الأول
  { id: 'food-drink', domain: 'self-care', title: 'الطعام والشرب', childTitle: 'الطعام والمطبخ', description: 'مهارات الأكل والشرب وأدوات الطعام.', icon: { kind: 'emoji', value: '🍽️' }, sourcePages: [2], mapSpot: 'kitchen' },
  { id: 'hygiene', domain: 'self-care', title: 'النظافة الشخصية', childTitle: 'النظافة', description: 'غسل اليدين والوجه، الأسنان، الشعر، الأنف والأذن، الأظافر.', icon: { kind: 'emoji', value: '🛁' }, sourcePages: [3], mapSpot: 'bathroom' },
  { id: 'clothes', domain: 'self-care', title: 'الملابس', childTitle: 'خزانة الملابس', description: 'تسمية الملابس ولبسها والأزرار والسحاب والكبسات والغسيل.', icon: { kind: 'emoji', value: '👕' }, sourcePages: [3, 4], mapSpot: 'wardrobe' },
  { id: 'safety', domain: 'self-care', title: 'الأمن والسلامة', childTitle: 'مدينة الأمان', description: 'أصوات التنبيه، رموز الخطر، إشارات المرور، عبور الشارع، طرق الإخلاء.', icon: { kind: 'emoji', value: '🚦' }, sourcePages: [4], mapSpot: 'street' },
  { id: 'shopping-cleaning', domain: 'self-care', title: 'التسوق وتنظيف البيئة', childTitle: 'المتجر والنظافة', description: 'النقود والبيع والشراء وتنظيف البيئة.', icon: { kind: 'emoji', value: '🛒' }, sourcePages: [5], mapSpot: 'market' },
  { id: 'language', domain: 'self-care', title: 'المهارات اللغوية (الاستقبالية والتعبيرية)', childTitle: 'عالم التواصل', description: 'الطلب، المشاعر، الاحتياجات، الحيوانات، الأسرة، الاستفهام، المكان، القصص، الاستماع، بناء الجملة، الحوار.', icon: { kind: 'emoji', value: '💬' }, sourcePages: [5, 6, 7, 8], mapSpot: 'talk' },
  { id: 'social', domain: 'self-care', title: 'المهارات الاجتماعية', childTitle: 'مع الناس', description: 'الآداب الاجتماعية، المناسبات، معلومات بلده، العائلة الهاشمية، المرافق العامة.', icon: { kind: 'emoji', value: '🤝' }, sourcePages: [8, 9], mapSpot: 'community' },

  // المحور الثاني
  { id: 'sensory-perceptual', domain: 'cognitive', title: 'المهارات الإدراكية الحسية', childTitle: 'عالم التفكير', description: 'الذاكرة، المطابقة، الألوان، الأشكال، الأحجام، الأطوال، الأوزان، الكميات، الزمن، الأصوات، الملامس والروائح.', icon: { kind: 'emoji', value: '🧩' }, sourcePages: [10, 11, 12] },
  { id: 'reading', domain: 'cognitive', title: 'القراءة', childTitle: 'عالم الحروف', description: 'من الكلمات البسيطة إلى قراءة الفقرات.', icon: { kind: 'emoji', value: '📖' }, sourcePages: [12] },
  { id: 'writing', domain: 'cognitive', title: 'الكتابة', childTitle: 'عالم الكتابة', description: 'مسك القلم، الخطوط، النقاط، الحروف، الكلمات والجمل.', icon: { kind: 'emoji', value: '✍️' }, sourcePages: [13] },
  { id: 'math', domain: 'cognitive', title: 'الحساب والمفاهيم العددية', childTitle: 'عالم الأرقام', description: 'العدّ، الأرقام، الجمع، الطرح، الأكبر والأصغر، التنازلي والتصاعدي.', icon: { kind: 'emoji', value: '🔢' }, sourcePages: [13, 14] },
  { id: 'life-sciences', domain: 'cognitive', title: 'العلوم الحياتية', childTitle: 'عالم الطبيعة', description: 'الخضار، الفواكه، الحبوب، الحيوانات، الحشرات، الطيور، الماء، النبات، الكهرباء، الضوء والشمس.', icon: { kind: 'emoji', value: '🌱' }, sourcePages: [15, 16] },
  { id: 'islamic', domain: 'cognitive', title: 'التربية الإسلامية', childTitle: 'ديني الجميل', description: 'الله الخالق، نبينا محمد ﷺ، أركان الإسلام والإيمان، الوضوء والصلاة، القرآن الكريم.', icon: { kind: 'emoji', value: '🕌' }, sourcePages: [16, 17] },

  // المحور الثالث
  { id: 'fine-motor', domain: 'motor', title: 'المهارات الحركية الدقيقة', childTitle: 'أصابعي الصغيرة', description: 'العجن، الخرز، النقل، الفتح والإغلاق، الليجو، التلوين.', icon: { kind: 'emoji', value: '🤲' }, sourcePages: [18] },
  { id: 'gross-motor', domain: 'motor', title: 'المهارات الحركية الكبيرة', childTitle: 'جسمي يتحرك', description: 'المشي، القفز، الدرج، الكرة، الحمل، الركض، الجري.', icon: { kind: 'emoji', value: '🤸' }, sourcePages: [19] },

  // المحور الرابع
  { id: 'vocational-prep', domain: 'vocational', title: 'التهيئة المهنية والأشغال اليدوية', childTitle: 'الورشة الصغيرة', description: 'المهن وأدواتها، القص، الطي، الغراء، القياس، الدهان، الفخار، الخشب، الخيط والإبرة.', icon: { kind: 'emoji', value: '🧰' }, sourcePages: [20, 21] },
  { id: 'computer', domain: 'vocational', title: 'مهارات الحاسوب', childTitle: 'حاسوبي الصغير', description: 'أجزاء الحاسوب، التشغيل، الفأرة، لوحة المفاتيح، النوافذ، وورد، بوربوينت، الرسام.', icon: { kind: 'emoji', value: '🖥️' }, sourcePages: [21, 22] },
];

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const categoriesOfDomain = (domain: Domain['id']) =>
  CATEGORIES.filter((c) => c.domain === domain).sort(
    (a, b) => (a.sourcePages[0] ?? 0) - (b.sourcePages[0] ?? 0),
  );

/** مناطق خريطة «حياتي اليومية» */
export const SELF_CARE_MAP = [
  { spot: 'home', label: 'البيت', icon: '🏠', categoryId: 'hygiene' },
  { spot: 'kitchen', label: 'المطبخ', icon: '🍽️', categoryId: 'food-drink' },
  { spot: 'bathroom', label: 'النظافة', icon: '🛁', categoryId: 'hygiene' },
  { spot: 'wardrobe', label: 'الخزانة', icon: '👕', categoryId: 'clothes' },
  { spot: 'street', label: 'الشارع', icon: '🚦', categoryId: 'safety' },
  { spot: 'market', label: 'المتجر', icon: '🛒', categoryId: 'shopping-cleaning' },
  { spot: 'talk', label: 'التواصل', icon: '💬', categoryId: 'language' },
  { spot: 'community', label: 'المجتمع', icon: '🤝', categoryId: 'social' },
] as const;
