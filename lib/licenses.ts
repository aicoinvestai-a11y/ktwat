/**
 * تعريب أسماء الرخص — خطوتي 📜
 *
 * السبب: كل نص يراه المستخدم في الواجهة يجب أن يكون عربياً. أما معرّفات الرخص القياسية
 * (CC0 / CC BY / CC BY-SA / GFDL) فهي أسماء قانونية للرخص تُكتب كما هي، ولذلك تُعرَّب الوصف
 * ويُذكر المعرّف مختصراً بين قوسين عند الحاجة التوثيقية فقط.
 */

const AR_DIGITS: Record<string, string> = {
  '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
  '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩',
};

export const toArabicDigits = (value: string): string =>
  value.replace(/\d|[.,]/g, (ch) => (ch === '.' ? '٫' : ch === ',' ? '،' : (AR_DIGITS[ch] ?? ch)));

/** يترجم اسم الرخصة إلى وصف عربي مفهوم. الرخص غير المعروفة تُترك كما هي دون اختراع. */
export function licenseArabic(raw: string, opts: { withId?: boolean } = {}): string {
  const s = String(raw ?? '').trim();
  if (!s) return 'رخصة حرّة';
  const version = (s.match(/\d+(?:\.\d+)?/) || [])[0];
  const v = version ? ` ${toArabicDigits(version)}` : '';
  const id = (name: string) => (opts.withId ? ` (${name})` : '');

  if (/CC0/i.test(s)) return `الملكية العامة — لا قيود${id('CC0')}`;
  if (/public\s*domain|^\s*PD\b/i.test(s)) return 'ملكية عامة';
  if (/CC\s*BY-SA/i.test(s)) return `نَسب المُصنَّف والمشاركة بالمثل${v}${id('CC BY-SA')}`;
  if (/CC\s*BY/i.test(s)) return `نَسب المُصنَّف${v}${id('CC BY')}`;
  if (/GFDL/i.test(s)) return 'رخصة توثيق جنو الحرّة';
  if (/Apache/i.test(s)) return 'رخصة أباتشي';
  return s;
}

/** اسم ملف/مؤلف لاتيني (اسم علم لا يُترجم) — يُعرض داخل «تفاصيل المصدر» للكبار فقط */
export const isLatinName = (value: string): boolean => /[A-Za-z]{3,}/.test(String(value ?? ''));
