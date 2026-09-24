import { Suspense } from 'react';
import { SearchResults } from '@/components/skills/SearchResults';

export const metadata = { title: 'نتائج البحث — خطوتي' };

/**
 * صفحة البحث: تعمل بلا سيرفر — تقرأ كلمة البحث من العنوان، وتُحمَّل فهرس البحث عند الطلب.
 * (يعمل هذا في التصدير الساكن أيضاً، لذا الموقع كله صالح للاستضافة الثابتة.)
 */
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <p className="rounded-xl2 bg-paper-card p-6 text-center text-child-base text-ink-soft shadow-soft">
          … جارٍ التحميل
        </p>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
