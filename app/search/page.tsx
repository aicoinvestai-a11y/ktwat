import { Suspense } from 'react';
import { SearchResults } from '@/components/skills/SearchResults';

export const metadata = { title: 'نتائج البحث — خطوتي' };

/**
 * صفحة البحث: تعمل بلا سيرفر — تقرأ كلمة البحث من العنوان، وتُحمَّل فهرس البحث عند الطلب.
 * (يعمل هذا في التصدير الساكن أيضاً، لذا الموقع كله صالح للاستضافة الثابتة.)
 */
export default function SearchPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-xl3 bg-paper-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-3xl font-bold text-ink">
          <span aria-hidden className="me-2">🔎</span>
          البحث عن مهارة
        </h1>
        <p className="mt-2 text-child-base text-ink-soft">
          اكتب كلمة في مربع البحث في الأعلى — مثال: «أسنان»، «ملعقة»، «أرقام».
        </p>
        <p className="mt-2 text-sm text-ink-mute">
          يبحث الموقع في: النص الأصلي للاستمارة، عناوين المهارات المبسطة، والكلمات المفتاحية.
        </p>
      </header>

      <Suspense
      fallback={
        <p className="rounded-xl2 bg-paper-card p-6 text-center text-child-base text-ink-soft shadow-soft">
          … جارٍ التحميل
        </p>
      }
    >
        <SearchResults />
      </Suspense>
    </div>
  );
}
