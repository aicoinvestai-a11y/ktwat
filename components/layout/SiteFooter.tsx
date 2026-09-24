import Link from 'next/link';
import { siteConfig } from '@/config/site.config';

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-paper-line bg-white/70">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-child-sm text-ink-soft md:grid-cols-3">
        <div className="space-y-2">
          <p className="font-display text-child-base font-bold text-ink">
            {siteConfig.name} <span aria-hidden>🌱</span>
          </p>
          <p>{siteConfig.slogan}</p>
          <p className="text-sm">{siteConfig.disclaimer}</p>
        </div>

        <nav aria-label="روابط الفوتر" className="space-y-2">
          <p className="font-semibold text-ink">روابط مفيدة</p>
          <ul className="space-y-1">
            <li>
              <Link href="/skills" className="underline hover:text-sky-700">
                كل المهارات (للأهل والأخصائي)
              </Link>
            </li>
            <li>
              <Link href="/my-skills" className="underline hover:text-sky-700">
                ⭐ مهاراتي
              </Link>
            </li>
            <li>
              <Link href="/board" className="underline hover:text-sky-700">
                🗣️ لوحة التواصل بالصور
              </Link>
            </li>
            <li>
              <Link href="/quran" className="underline hover:text-sky-700">
                القرآن الكريم (تلاوات حقيقية)
              </Link>
            </li>
            <li>
              <Link href="/guide" className="underline hover:text-sky-700">
                📘 دليل الاستخدام للأسرة والأخصائي
              </Link>
            </li>
            <li>
              <Link href="/about" className="underline hover:text-sky-700">
                الخصوصية والمصادر وإمكانية الوصول
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-2">
          <p className="font-semibold text-ink">المصدر التعليمي</p>
          <p className="text-sm">
            «{siteConfig.sourceDocument.title}» — {siteConfig.sourceDocument.owner}. حُفظت نصوص البنود الأصلية كما هي دون أي تعديل.
          </p>
          <p className="text-sm">لا تسجيل، ولا حساب، ولا جمع بيانات. تُخزَّن تفضيلاتك على جهازك فقط.</p>
        </div>
      </div>
    </footer>
  );
}
