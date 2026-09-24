import Link from 'next/link';
import { DOMAINS } from '@/data/taxonomy';
import { skillsOfDomain } from '@/data/skills';
import { WorldScene } from '@/components/illustrations/Illustrations';

export const metadata = { title: 'ابدأ رحلتي — خطوتي' };

export default function StartPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="font-display text-child-xl font-bold text-ink">
          ماذا نريد أن نتعلم اليوم؟ <span aria-hidden>🌟</span>
        </h1>
        <p className="mt-2 text-child-base text-ink-soft">اختر العالم الذي تحبه… وابدأ خطوة بخطوة</p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {DOMAINS.map((d) => (
          <Link
            key={d.id}
            href={`/world/${d.id}`}
            className="flex flex-col items-center gap-4 rounded-xl3 border border-paper-line bg-paper-card p-8 text-center shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
          >
            <WorldScene id={d.id} className="w-44" />
            <h2 className="font-display text-child-xl font-bold text-ink">
              <span aria-hidden className="me-2">
                {d.icon.value}
              </span>
              {d.childTitle}
            </h2>
            <p className="text-child-base font-semibold text-ink-soft">{d.tagline}</p>
            <p className="text-child-sm text-ink-mute">{skillsOfDomain(d.id).length} نشاطاً تدريبياً</p>
            <span className="mt-2 rounded-xl2 bg-sky-100 px-6 py-3 text-child-base font-bold text-sky-800">
              هيا ندخل <span aria-hidden>←</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-xl2 bg-mint-50 p-5 text-center text-child-sm text-mint-700">
        <span aria-hidden>🌿 </span>
        خذ وقتك. يمكنك التوقف في أي لحظة، والعودة لاحقاً. لا يوجد اختبار ولا درجات.
      </div>
    </div>
  );
}
