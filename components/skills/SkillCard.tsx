'use client';

import Link from 'next/link';
import type { Skill } from '@/data/types';
import { usePrefs } from '@/lib/prefs';
import { VisualBox } from '@/components/games/parts';
import { animationForSkill } from '@/data/animations';

/** بطاقة مهارة كبيرة سهلة اللمس */
export function SkillCard({ skill }: { skill: Skill }) {
  const { isFavorite, toggleFavorite } = usePrefs();
  const fav = isFavorite(skill.id);
  const hasAnimation = animationForSkill(skill) !== null;

  return (
    <div className="relative flex flex-col rounded-xl2 border border-paper-line bg-paper-card p-4 shadow-soft transition hover:shadow-lift">
      <button
        type="button"
        onClick={() => toggleFavorite(skill.id)}
        aria-label={fav ? `إزالة ${skill.childFriendlyTitle} من مهاراتي` : `إضافة ${skill.childFriendlyTitle} إلى مهاراتي`}
        aria-pressed={fav}
        className="absolute end-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-paper text-2xl text-peach-500 transition hover:bg-peach-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-peach-300"
      >
        <span aria-hidden>{fav ? '♥' : '♡'}</span>
      </button>

      <Link href={`/skill/${skill.id}`} className="flex flex-1 flex-col items-center gap-3 text-center focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400">
        <span className="mt-2">
          <VisualBox visual={skill.icon} size="lg" />
        </span>
        <span className="text-child-base font-bold text-ink">{skill.childFriendlyTitle}</span>
        {hasAnimation && (
          <span className="inline-flex items-center gap-1 rounded-xl2 bg-grape-50 px-3 py-1 text-xs font-semibold text-grape-700">
            <span aria-hidden>🎬</span> حركة توضيحية
          </span>
        )}
        <span className="text-sm text-ink-mute">{skill.childFriendlyInstruction}</span>
        <span className="mt-auto inline-flex min-h-touch items-center gap-2 rounded-xl2 bg-sky-100 px-5 text-child-sm font-bold text-sky-800">
          هيا نتعلم <span aria-hidden>←</span>
        </span>
      </Link>

      {skill.supervisorRequired && (
        <p className="mt-3 rounded-xl2 bg-sun-50 px-3 py-2 text-center text-sm font-semibold text-sun-700">
          👨‍👩‍👧 مع شخص بالغ
        </p>
      )}
    </div>
  );
}
