'use client';

import Link from 'next/link';
import { usePrefs } from '@/lib/prefs';
import { skillById } from '@/data/skills';
import { SkillCard } from '@/components/skills/SkillCard';

/** ⭐ مهاراتي — اختيار المهارات للعمل عليها. بلا تقييم، بلا درجات، وبلا حساب. */
export default function MySkillsPage() {
  const { favorites, practiced, clearAll, ready } = usePrefs();

  const favoriteSkills = favorites.map((id) => skillById[id]).filter(Boolean);
  const practicedSkills = practiced.map((id) => skillById[id]).filter(Boolean);

  return (
    <div className="space-y-8">
      <header className="rounded-xl3 bg-paper-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-4xl font-bold text-ink">
          <span aria-hidden className="me-3">
            ⭐
          </span>
          مهاراتي
        </h1>
        <p className="mt-3 max-w-3xl text-child-base text-ink-soft">
          هنا نضع المهارات التي نريد العمل عليها. تُحفظ على هذا الجهاز فقط، ويمكن حذفها في أي وقت. ولا يوجد أي تقييم:
          فقط «تدربنا على هذا النشاط ✓» إن أردت.
        </p>
      </header>

      {!ready ? (
        <p className="text-child-base text-ink-mute">… جارٍ التحميل</p>
      ) : (
        <>
          <section className="space-y-4" aria-labelledby="fav-title">
            <h2 id="fav-title" className="font-display text-child-lg font-bold text-ink">
              المهارات المفضلة ({favoriteSkills.length})
            </h2>
            {favoriteSkills.length === 0 ? (
              <p className="rounded-xl2 bg-sky-50 p-5 text-child-base text-sky-800">
                لم نضف مهارات بعد. افتح أي مهارة واضغط ♡ «إضافة إلى مهاراتي»، أو استعرض{' '}
                <Link href="/skills" className="underline">
                  كل المهارات
                </Link>
                .
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteSkills.map((s) => (
                  <SkillCard key={s.id} skill={s} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4" aria-labelledby="prac-title">
            <h2 id="prac-title" className="font-display text-child-lg font-bold text-ink">
              أنشطة تدربنا عليها ({practicedSkills.length})
            </h2>
            {practicedSkills.length === 0 ? (
              <p className="text-child-sm text-ink-mute">لا يوجد سجل بعد — وهذا جيد أيضاً 🌿</p>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {practicedSkills.map((s) => (
                  <li key={s.id} className="rounded-xl2 bg-mint-50 px-4 py-2 text-child-sm font-semibold text-mint-700">
                    ✓ {s.icon.value} {s.childFriendlyTitle}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl2 border border-peach-200 bg-peach-50 p-5">
            <h2 className="font-display text-child-base font-bold text-peach-600">الخصوصية والحذف</h2>
            <p className="mt-2 text-child-sm text-ink-soft">
              كل ما هنا مخزّن في متصفح جهازك (LocalStorage). لا يُرسل أي شيء إلى أي سيرفر، ولا يوجد حساب ولا بريد.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('هل تريد حذف كل التفضيلات المحلية (المفضلة والسجل والإعدادات)؟')) clearAll();
              }}
              className="mt-3 min-h-touch rounded-xl2 bg-white px-5 text-child-sm font-bold text-peach-600 shadow-soft"
            >
              🗑️ حذف كل البيانات المحلية
            </button>
          </section>
        </>
      )}
    </div>
  );
}
