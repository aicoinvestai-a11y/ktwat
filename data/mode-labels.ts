/**
 * تسميات عربية لكل أنواع الأنشطة ومراحل الرحلة — خطوتي 🌱
 *
 * السبب: معرّفات الأنشطة في البيانات إنجليزية (لأنها مفاتيح برمجية)، لكن أي شيء يراه المستخدم
 * يجب أن يكون عربياً. هذه الخريطة هي المرجع الوحيد للتسمية في الواجهة.
 */
import type { TrainingMode } from '@/data/types';

export const MODE_LABELS: Record<TrainingMode, string> = {
  watch: 'أشاهد',
  listen: 'أستمع',
  learn: 'أتعلم',
  'picture-choice': 'اختر الصورة',
  'audio-choice': 'استمع واختر',
  matching: 'المطابقة',
  'drag-drop': 'اسحب وأفلت',
  sequence: 'رتّب الخطوات',
  memory: 'لعبة الذاكرة',
  sorting: 'التصنيف',
  counting: 'العدّ',
  tracing: 'التتبع بالقلم',
  'build-sentence': 'كوّن الجملة',
  category: 'اختر الفئة',
  'true-false': 'صح أم خطأ؟',
  'computer-sim': 'محاكاة الحاسوب',
  story: 'قصة مصوّرة',
  simulation: 'محاكاة',
  'role-play': 'تمثيل الدور',
  'real-world': 'جرّب في الواقع',
};

/** تسمية عربية آمنة لأي معرّف: تعود بالمعرّف نفسه فقط إن لم تكن له تسمية معروفة */
export function modeLabel(mode: string): string {
  return MODE_LABELS[mode as TrainingMode] ?? mode;
}
