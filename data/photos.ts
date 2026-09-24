import { licenseArabic } from '@/lib/licenses';

/**
 * الصور الحقيقية — خطوتي 🖼️
 * ------------------------------------------------------------------
 * صور واقعية (لا رسوم) لأشياء يحتاج الطفل رؤيتها كما هي في الواقع في مرحلة
 * «جرّب مع المشرف». كل صورة مصرّح بها: CC0 / ملكية عامة / CC BY / CC BY-SA،
 * ولا توجد أي صورة لأشخاص. المصدر والترخيص موثّقان في data/image-licenses.json.
 *
 * القاعدة: إن وُجدت صورة حقيقية للعنصر تُعرض هي؛ وإن لم توجد يُعرض الرسم الأصلي (SVG)،
 * وإن لم يوجد رسم يُعرض الرمز النصي كعنصر نائب موثّق. لا تعديل على أي ملف بيانات.
 */
import licenses from './image-licenses.json';

export interface RealPhoto {
  /** مسار الملف داخل /public */
  src: string;
  /** نص بديل عربي وصفي (يقرأه قارئ الشاشة) */
  alt: string;
  /** المصدر على Wikimedia Commons */
  sourceUrl: string;
  /** اسم الملف الأصلي */
  title: string;
  /** اسم المصوّر/الرافع */
  credit: string;
  /** الرخصة كما وردت في المصدر */
  license: string;
  licenseUrl?: string;
}

type LicenseFile = {
  note: string;
  retrieved: string;
  items: Record<string, { src: string; alt: string; sourceUrl: string; commonsTitle: string; credit: string; license: string; licenseUrl?: string }>;
};

const file = licenses as LicenseFile;

export const REAL_PHOTOS: Record<string, RealPhoto> = Object.fromEntries(
  Object.entries(file.items).map(([key, v]) => [
    key,
    {
      src: v.src,
      alt: v.alt,
      sourceUrl: v.sourceUrl,
      title: v.commonsTitle,
      credit: v.credit,
      license: v.license,
      licenseUrl: v.licenseUrl,
    },
  ]),
);

export const PHOTO_NOTE = file.note;
export const PHOTO_RETRIEVED = file.retrieved;

export const allPhotos = Object.entries(REAL_PHOTOS).map(([key, photo]) => ({ key, ...photo }));

export const hasPhoto = (value: string): boolean => Boolean(REAL_PHOTOS[value]);

/** سطر نسبة مختصر يُعرض تحت الصورة */
export function photoCreditText(photo: RealPhoto): string {
  const license = licenseArabic(photo.license);
  return `صورة حقيقية من ويكيميديا كومنز${license ? ` • الرخصة: ${license}` : ''}`;
}

/** الاعتماد الكامل (أسماء المؤلفين الأصلية بالإنجليزية) — للكبار فقط، ويُعرض داخل «تفاصيل المصدر» */
export function photoCreditFull(photo: RealPhoto): string {
  const clean = (v: string) =>
    String(v ?? '')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  return `${clean(photo.credit)} — ${clean(photo.license)} — Wikimedia Commons`;
}
