'use client';

import React, { useMemo, useState } from 'react';
import type { SimulationActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { Feedback, GameTitle } from './parts';

/**
 * محاكاة تفاعلية — خطوتي
 * كل محاكاة: مشهد + خطوات + عنصر تحكم قابل للسحب/الضغط يعمل باللمس والماوس ولوحة المفاتيح.
 * لا خطوات حقيقية خطرة هنا: السحب يستخدم input[type=range] والقواعد الآمنة موضّحة.
 */

const SIM_EMOJI: Record<string, string> = {
  zipper: '🧥',
  buttons: '👕',
  snap: '🎒',
  faucet: '🚰',
  'pour-water': '🥛',
  straw: '🧃',
  clothesline: '👕',
  sweep: '🧹',
  wipe: '🧻',
  vacuum: '🧹',
  money: '💰',
  'traffic-light': '🚦',
  'cross-street': '🚸',
  'cut-paper': '✂️',
  'fold-paper': '📄',
  paint: '🎨',
  measure: '📏',
  assemble: '🧩',
  'thread-needle': '🪡',
  screw: '🔩',
  hammer: '🔨',
  knead: '🟤',
  'sponge-transfer': '🧽',
  'spoon-transfer': '🥄',
  beads: '📿',
  blocks: '🧱',
  'washing-hands': '🧼',
  'brushing-teeth': '🪥',
  wudu: '💧',
  prayer: '🕌',
  'spoon-to-mouth': '🥄',
  'spoon-sandwich': '🥪',
};

const DRAG_LABEL: Record<string, string> = {
  zipper: 'اسحب السحاب',
  faucet: 'أدر المقبض',
  'pour-water': 'اسكب الماء',
  money: 'ادفع النقود',
  sweep: 'حرّك المكنسة',
  vacuum: 'حرّك المكنسة',
  'thread-needle': 'اسحب الخيط',
  screw: 'أدر المفك',
  clothesline: 'ثبّت المشبك',
  'cut-paper': 'اسحب المقص',
  'fold-paper': 'اطوِ الورقة',
  paint: 'اسحب الفرشاة',
  measure: 'مدّ المتر',
  'sponge-transfer': 'اضغط الإسفنجة',
  'spoon-transfer': 'اسحب الملعقة',
  beads: 'اسحب الخرزة',
  blocks: 'ركّب القطعة',
  knead: 'اضغط العجين',
  'spoon-to-mouth': 'اسحب الملعقة إلى الفم',
  'spoon-sandwich': 'اسحب الملعقة إلى الخبز',
  'traffic-light': 'اختر اللون',
  'cross-street': 'اعبر بهدوء',
  'washing-hands': 'افرك يديك',
  'brushing-teeth': 'افرُش الأسنان',
  wudu: 'اغسل العضو',
  prayer: 'انتقل إلى الحركة',
  hammer: 'اسحب المطرقة',
  straw: 'ضع المصاصة',
  assemble: 'الصق القطعة',
  snap: 'اضغط الكبسة',
  buttons: 'افتح الزر',
  wipe: 'امسح السطح',
};

export function SimulationGame({ activity }: { activity: SimulationActivity }) {
  const [step, setStep] = useState(0);
  const [value, setValue] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const done = step >= activity.steps.length;
  const emoji = useMemo(() => SIM_EMOJI[activity.sim] ?? '🎯', [activity.sim]);
  const dragLabel = DRAG_LABEL[activity.sim] ?? 'اسحب للتنفيذ';

  const completeStep = () => {
    if (done) return;
    audioService.chime('success');
    audioService.speak(activity.steps[step]);
    setStep((s) => s + 1);
    setValue(0);
    setMsg(null);
    if (step + 1 >= activity.steps.length) audioService.praise();
  };

  const onRange = (v: number) => {
    setValue(v);
    if (v >= 90) completeStep();
    else if (v > 5) setMsg('أكمل الحركة قليلاً…');
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />

      <div className="flex flex-col items-center gap-4 rounded-xl2 bg-paper-card p-6 shadow-soft">
        <div className="text-7xl md:text-8xl" aria-hidden>
          {emoji}
        </div>
        <ol className="w-full space-y-2">
          {activity.steps.map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-3 rounded-xl2 px-4 py-2 text-child-sm ${
                i < step ? 'bg-mint-50 text-mint-700 font-semibold' : i === step ? 'bg-sky-50 font-bold text-ink' : 'text-ink-mute'
              }`}
            >
              <span aria-hidden className="text-xl">
                {i < step ? '✅' : i === step ? '👉' : '•'}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>

        {!done ? (
          <div className="w-full space-y-4">
            <p className="text-center text-child-base font-bold text-ink">{dragLabel}</p>
            <input
              type="range"
              min={0}
              max={100}
              value={value}
              aria-label={dragLabel}
              onChange={(e) => onRange(Number(e.target.value))}
              className="h-8 w-full accent-mint-500"
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={completeStep}
                className="min-h-touch rounded-xl2 bg-mint-100 px-6 text-child-base font-bold text-mint-700 transition hover:bg-mint-200"
              >
                ✓ نعم، فعلتها
              </button>
            </div>
          </div>
        ) : (
          <Feedback kind="correct" message="أحسنت! أكملت الخطوات" />
        )}
        {msg && <Feedback kind="info" message={msg} />}
      </div>

      {activity.realWorld && (
        <div className="rounded-xl2 bg-sun-50 p-4 text-child-sm text-sun-700">
          <span aria-hidden>👨‍👩‍👧 </span>
          <strong>في الواقع: </strong>
          {activity.realWorld}
        </div>
      )}
    </section>
  );
}
