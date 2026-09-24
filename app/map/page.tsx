import Link from 'next/link';
import { SELF_CARE_MAP } from '@/data/taxonomy';
import { skillsOfCategory } from '@/data/skills';
import { SpotIllustration } from '@/components/illustrations/Illustrations';

export const metadata = { title: 'خريطة حياتي اليومية — خطوتي' };

export default function MapPage() {
  return (
    <div className="space-y-8">
      <nav aria-label="مسار التنقل" className="text-child-sm text-ink-mute">
        <Link href="/world/self-care" className="underline">
          حياتي اليومية
        </Link>{' '}
        / الخريطة
      </nav>

      <header className="text-center">
        <h1 className="font-display text-child-xl font-bold text-ink">أين نريد أن نتعلم اليوم؟ 🗺️</h1>
        <p className="mt-2 text-child-base text-ink-soft">اضغط على أي مكان في الخريطة</p>
      </header>

      <div className="rounded-xl3 bg-gradient-to-b from-mint-50 to-sky-50 p-5 md:p-8">
        <ul className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {SELF_CARE_MAP.map((spot) => {
            const count = skillsOfCategory(spot.categoryId).length;
            return (
              <li key={spot.spot}>
                <Link
                  href={`/category/${spot.categoryId}`}
                  className="flex flex-col items-center gap-3 rounded-xl2 bg-white/80 p-5 text-center shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
                >
                  <SpotIllustration spot={spot.spot} className="w-20" />
                  <span className="font-display text-child-base font-bold text-ink">
                    <span aria-hidden className="me-1">
                      {spot.icon}
                    </span>
                    {spot.label}
                  </span>
                  <span className="text-sm text-ink-mute">{count} مهارة</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-center text-child-sm text-ink-mute">
        الخريطة بسيطة عن قصد: 8 مناطق كبيرة سهلة اللمس، بلا ازدحام 👌
      </p>
    </div>
  );
}
