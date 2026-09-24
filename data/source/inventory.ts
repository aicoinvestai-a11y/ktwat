/**
 * فهرس البنود المصدرية — خطوتي
 * كل بند في «استمارة التقييم والتدريب لمنتفعي المراكز النهارية الدامجة» (22 صفحة)
 * له سجل هنا. النص الأصلي منقول حرفياً من الاستمارة، ولا يُعدّل.
 * البنود التي كان نصها في طبقة PDF مشوّهاً بسبب ترميز الحروف (ٍ بدل ِ مثلًا)
 * صُحّحت فقط بعد التحقق البصري من صورة الصفحة، ووُثّق ذلك في needsReviewNote.
 */
import type { DomainId, SourceItem } from '../types';
import { selfCareItems } from './self-care';
import { cognitiveItems } from './cognitive';
import { motorItems } from './motor';
import { vocationalItems } from './vocational';

export const domainTitles: Record<DomainId, string> = {
  'self-care': 'إدارة الذات',
  cognitive: 'الإدراكي',
  motor: 'الحركي',
  vocational: 'المهني',
};

export const allSourceItems: SourceItem[] = [
  ...selfCareItems,
  ...cognitiveItems,
  ...motorItems,
  ...vocationalItems,
];

export const sourceById: Record<string, SourceItem> = Object.fromEntries(
  allSourceItems.map((s) => [s.id, s]),
);

export const sourceStats = () => {
  const byDomain = new Map<DomainId, number>();
  const byCategory = new Map<string, number>();
  const byPage = new Set<number>();
  for (const s of allSourceItems) {
    byDomain.set(s.domain, (byDomain.get(s.domain) ?? 0) + 1);
    byCategory.set(s.category, (byCategory.get(s.category) ?? 0) + 1);
    byPage.add(s.sourcePage);
  }
  return {
    total: allSourceItems.length,
    byDomain: Object.fromEntries(byDomain) as Record<DomainId, number>,
    categories: byCategory.size,
    byCategory: Object.fromEntries(byCategory),
    pages: Array.from(byPage).sort((a, b) => a - b),
    needsReview: allSourceItems.filter((s) => s.needsReview).map((s) => s.id),
  };
};
