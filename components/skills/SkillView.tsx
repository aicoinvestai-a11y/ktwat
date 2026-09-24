'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Skill } from '@/data/types';
import { GameEngine } from '@/components/games/GameEngine';
import { VisualBox, AudioButton } from '@/components/games/parts';
import { SupervisorPanel } from './SupervisorPanel';
import { audioService } from '@/lib/audio/service';
import { StepAnimator } from '@/components/animations/StepAnimator';
import { animationForSkill } from '@/data/animations';
import { usePrefs } from '@/lib/prefs';

type StageId = 'watch' | 'listen' | 'learn' | 'play' | 'real';

const STAGES: { id: StageId; label: string; icon: string }[] = [
  { id: 'watch', label: 'شاهد', icon: '👀' },
  { id: 'listen', label: 'استمع', icon: '🔊' },
  { id: 'learn', label: 'تعلّم', icon: '💡' },
  { id: 'play', label: 'العب', icon: '🎮' },
  { id: 'real', label: 'جرّب مع المشرف', icon: '👨‍👩‍👧' },
];

/** رحلة المهارة: لا يُشترط إكمال المراحل، ويمكن القفز بينها */
export function SkillView({ skill }: { skill: Skill }) {
  const [stage, setStage] = useState<StageId>('watch');
  const [gameIndex, setGameIndex] = useState(0);
  const { markVisited, isFavorite, toggleFavorite, isPracticed, markPracticed } = usePrefs();

  useEffect(() => {
    markVisited(skill.id);
  }, [skill.id, markVisited]);

  const animation = animationForSkill(skill);
  const games = skill.activities.filter((a) => a.type !== 'explore');
  const explore = skill.activities.find((a) => a.type === 'explore');
  const current = games[gameIndex];
  const fav = isFavorite(skill.id);

  return (
    <div className="space-y-6">
      <header className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <VisualBox visual={skill.icon} size="lg" />
            <div>
              <h1 className="font-display text-child-xl font-bold text-ink">{skill.childFriendlyTitle}</h1>
              <p className="text-child-sm text-ink-soft">{skill.childFriendlyInstruction}</p>
              {animation && (
                <p className="mt-1 inline-flex items-center gap-1 rounded-xl2 bg-grape-50 px-3 py-1 text-sm font-semibold text-grape-700">
                  <span aria-hidden>🎬</span> فيها حركة توضيحية
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleFavorite(skill.id)}
              aria-pressed={fav}
              className={`flex min-h-touch items-center gap-2 rounded-xl2 px-4 text-child-sm font-bold shadow-soft transition ${
                fav ? 'bg-peach-100 text-peach-600' : 'bg-paper text-ink hover:bg-peach-50'
              }`}
            >
              <span aria-hidden>{fav ? '♥' : '♡'}</span>
              {fav ? 'في مهاراتي' : 'إضافة إلى مهاراتي'}
            </button>
          </div>
        </div>

        {skill.safetyNote && (
          <p className="mt-4 rounded-xl2 border border-sun-300 bg-sun-50 p-3 text-child-sm font-semibold text-sun-700" role="note">
            {skill.safetyNote}
          </p>
        )}
      </header>

      {/* شرائط المراحل */}
      <nav aria-label="مراحل المهارة" className="flex flex-wrap justify-center gap-2">
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStage(s.id)}
            aria-current={stage === s.id ? 'step' : undefined}
            className={`min-h-touch rounded-xl2 px-4 text-child-sm font-bold shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
              stage === s.id ? 'bg-sky-100 text-sky-800 ring-4 ring-sky-200' : 'bg-paper-card text-ink hover:bg-sky-50'
            }`}
          >
            <span aria-hidden className="me-1">
              {s.icon}
            </span>
            {s.label}
          </button>
        ))}
      </nav>

      {stage === 'watch' && (
        <section className="space-y-4 rounded-xl2 bg-paper-card p-6 text-center shadow-soft">
          {animation && <StepAnimator animation={animation} />}
          <p className="text-child-base text-ink">
            <span aria-hidden>👀 </span>
            انظر إلى الصورة، واضغط عليها لتسمع الاسم:
          </p>
          {explore ? (
            <GameEngine activity={explore} />
          ) : (
            <VisualBox visual={skill.icon} size="lg" />
          )}
        </section>
      )}

      {stage === 'listen' && (
        <section className="space-y-4 rounded-xl2 bg-paper-card p-6 text-center shadow-soft">
          <p className="text-child-base text-ink">
            <span aria-hidden>🔊 </span>
            اضغط لتسمع المهارة — ويمكنك التكرار بلا حد:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <AudioButton text={skill.audioText} label="المهارة" className="text-4xl" />
            <span className="rounded-xl2 bg-sky-50 px-4 py-2 text-child-sm text-ink-soft">
              «{skill.audioText}»
            </span>
          </div>
        </section>
      )}

      {stage === 'learn' && (
        <section className="space-y-3 rounded-xl2 bg-paper-card p-6 shadow-soft">
          <h2 className="font-display text-child-lg font-bold text-ink">
            <span aria-hidden>💡 </span>
            {skill.childFriendlyTitle}
          </h2>
          <p className="text-child-base leading-relaxed text-ink-soft">{skill.description}</p>
          <details className="rounded-xl2 bg-paper p-4">
            <summary className="cursor-pointer text-child-sm font-semibold text-ink">
              ما الخطوات التي سنتدرب عليها؟
            </summary>
            <ul className="mt-2 space-y-1 text-child-sm text-ink-soft">
              {skill.activities
                .filter((a) => a.type !== 'explore')
                .map((a) => (
                  <li key={a.id}>• {a.title}</li>
                ))}
            </ul>
          </details>
          {skill.needsReview && (
            <p className="rounded-xl2 bg-peach-50 p-3 text-sm text-peach-600">
              ملاحظة: هذا البند أُخذ من الاستمارة كما هو، وبعض كلماته كانت غير واضحة في النص الأصلي وأُبقيت للمراجعة.
            </p>
          )}
        </section>
      )}

      {stage === 'play' && (
        <section className="space-y-5">
          {games.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              {games.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGameIndex(i)}
                  className={`min-h-touch rounded-xl2 px-4 text-child-sm font-semibold shadow-soft ${
                    i === gameIndex ? 'bg-grape-100 text-grape-700 ring-4 ring-grape-200' : 'bg-paper-card text-ink hover:bg-grape-50'
                  }`}
                >
                  {g.title} {i + 1}
                </button>
              ))}
            </div>
          )}
          {current ? (
            <div className="rounded-xl2 bg-paper-card p-5 shadow-soft">
              <GameEngine activity={current} visual={skill.icon} />
            </div>
          ) : (
            <p className="rounded-xl2 bg-paper-card p-6 text-center text-child-base text-ink-soft shadow-soft">
              لا توجد لعبة لهذه المهارة — النشاط الحقيقي هو التدريب.
            </p>
          )}
          {games.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3" id="more">
              <button
                type="button"
                onClick={() => setGameIndex((i) => (i + 1) % games.length)}
                className="min-h-touch rounded-xl2 bg-sky-100 px-5 text-child-base font-semibold text-sky-800 hover:bg-sky-200"
              >
                🔁 لعبة أخرى
              </button>
              <Link
                href={`/category/${skill.category}`}
                className="min-h-touch rounded-xl2 bg-mint-100 px-5 text-child-base font-semibold text-mint-700 hover:bg-mint-200"
              >
                ➡️ مهارة جديدة
              </Link>
            </div>
          )}
        </section>
      )}

      {stage === 'real' && (
        <section className="space-y-5">
          <div className="rounded-xl2 bg-grape-50 p-6 text-center">
            <p className="text-child-lg font-bold text-grape-700">
              <span aria-hidden>👨‍👩‍👧 </span>
              جرب هذا النشاط مع الشخص الذي يساعدك
            </p>
            {skill.supervisorNote && <p className="mt-2 text-child-sm text-ink-soft">{skill.supervisorNote}</p>}
            {skill.safetyNote && (
              <p className="mt-3 rounded-xl2 bg-white p-3 text-child-sm font-semibold text-sun-700">{skill.safetyNote}</p>
            )}
            <button
              type="button"
              onClick={() =>
                skill.supervisorRequired
                  ? audioService.speak('هذا النشاط يتم بإشراف مباشر من شخص بالغ. جربه مع الشخص الذي يساعدك')
                  : audioService.speak('جرب هذا النشاط مع الشخص الذي يساعدك عندما تكون جاهزاً')
              }
              className="mt-4 min-h-touch rounded-xl2 bg-white px-5 text-child-base font-semibold text-grape-700 shadow-soft"
            >
              🔊 استمع للتعليمة
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => markPracticed(skill.id)}
              aria-pressed={isPracticed(skill.id)}
              className={`min-h-touch rounded-xl2 px-5 text-child-base font-semibold shadow-soft ${
                isPracticed(skill.id) ? 'bg-mint-100 text-mint-700' : 'bg-paper-card text-ink hover:bg-mint-50'
              }`}
            >
              {isPracticed(skill.id) ? '✓ تدربنا على هذا النشاط' : 'تسجيل أننا تدربنا ✓'}
            </button>
          </div>
        </section>
      )}

      <SupervisorPanel skill={skill} />
    </div>
  );
}
