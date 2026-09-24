import Link from 'next/link';
import { siteConfig } from '@/config/site.config';

export const metadata = { title: `لم نجد هذه الصفحة — ${siteConfig.name}` };

/** صفحة 404 هادئة وودّية: بلا لوم، وبلا تقييم — فقط طريق للعودة. */
export default function NotFound() {
  const links = [
    { href: '/', label: 'العودة إلى الرئيسية', primary: true },
    { href: '/start', label: '🦋 ابدأ رحلتي' },
    { href: '/skills', label: 'كل المهارات' },
    { href: '/map', label: 'خريطة المهارات' },
    { href: '/board', label: 'لوحة التواصل بالصور' },
  ];

  return (
    <div className="space-y-6 text-center">
      <h1 className="font-display text-child-xl font-bold text-ink">
        <span aria-hidden>🧭 </span>
        لم نجد هذه الصفحة
      </h1>
      <p className="mx-auto max-w-2xl text-child-base text-ink-soft">
        ربما الرابط قديم أو مكتوب بشكل مختلف. لا مشكلة على الإطلاق — اختر من أين تحب أن نُكمل، ونحن معك خطوة
        بخطوة.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              link.primary
                ? 'inline-flex min-h-touch items-center rounded-xl2 bg-mint-500 px-6 text-child-base font-bold text-white shadow-lift'
                : 'inline-flex min-h-touch items-center rounded-xl2 bg-paper-card px-6 text-child-base font-semibold text-ink shadow-soft hover:bg-sky-50'
            }
          >
            {link.label}
          </Link>
        ))}
      </div>

      <p className="mx-auto max-w-xl rounded-2xl bg-sky-50 p-4 text-child-sm text-ink-soft">
        يمكنك أيضاً البحث عن أي مهارة بالعربية من صفحة «كل المهارات»، أو سؤال الشخص الذي يساعدك.
      </p>
    </div>
  );
}
