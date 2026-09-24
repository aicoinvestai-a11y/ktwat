import Link from 'next/link';

export const metadata = { title: 'لا يوجد اتصال — خطوتي' };

export default function OfflinePage() {
  return (
    <div className="space-y-6 text-center">
      <h1 className="font-display text-child-xl font-bold text-ink">
        <span aria-hidden>🌱 </span>
        لا يوجد اتصال بالإنترنت الآن
      </h1>
      <p className="mx-auto max-w-2xl text-child-base text-ink-soft">
        يمكنك متابعة الأنشطة التي حمّلتها سابقاً على هذا الجهاز. وإذا لم تظهر الصفحة، انتظر قليلاً ثم جرّب مرة أخرى.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-touch items-center rounded-xl2 bg-mint-500 px-6 text-child-base font-bold text-white shadow-lift"
        >
          العودة إلى الرئيسية
        </Link>
        <Link
          href="/skills"
          className="inline-flex min-h-touch items-center rounded-xl2 bg-paper-card px-6 text-child-base font-semibold text-ink shadow-soft"
        >
          كل المهارات
        </Link>
      </div>
    </div>
  );
}
