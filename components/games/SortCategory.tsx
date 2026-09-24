'use client';

import React, { useState } from 'react';
import type { CategoryActivity, SortingActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { Feedback, GameTitle, VisualBox, shuffle } from './parts';

type Bucket = { id: string; label: string; visual: { kind: 'emoji' | 'image' | 'letter'; value: string } };
type Item = { id: string; label: string; visual: { kind: 'emoji' | 'image' | 'letter'; value: string }; targetId: string };

function SorterBase({
  title,
  instruction,
  buckets,
  items,
  bucketWord,
}: {
  title: string;
  instruction: string;
  buckets: Bucket[];
  items: Item[];
  bucketWord: string;
}) {
  const [order] = useState(() => shuffle(items, 23));
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const current = order[currentIndex];
  const done = currentIndex >= order.length;

  const choose = (bucketId: string) => {
    if (!current) return;
    if (current.targetId === bucketId) {
      setPlaced((p) => ({ ...p, [current.id]: bucketId }));
      setCurrentIndex((i) => i + 1);
      setWrong(null);
      audioService.chime('success');
      if (currentIndex + 1 >= order.length) audioService.praise();
    } else {
      setWrong(bucketId);
      audioService.encourage();
    }
  };

  return (
    <section className="space-y-5">
      <GameTitle title={title} instruction={instruction} />
      <div className="flex justify-center">
        {current ? (
          <div className="flex flex-col items-center gap-2 rounded-xl2 border border-paper-line bg-paper-card px-8 py-5 shadow-soft">
            <VisualBox visual={current.visual} size="lg" />
            <span className="text-child-base font-bold text-ink">{current.label}</span>
          </div>
        ) : (
          <Feedback kind="correct" message="أحسنت! صنّفت كل العناصر" />
        )}
      </div>
      <p className="text-center text-child-sm text-ink-mute">أين نضع هذا؟ اختر {bucketWord} المناسب</p>
      <div className={`grid gap-4 ${buckets.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {buckets.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => choose(b.id)}
            disabled={done}
            className={`flex min-h-[7rem] flex-col items-center justify-center gap-2 rounded-xl2 border border-paper-line p-4 shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
              wrong === b.id ? 'bg-sun-50 ring-4 ring-sun-200' : 'bg-paper-card hover:bg-sky-50'
            }`}
          >
            <VisualBox visual={b.visual} size="md" />
            <span className="text-child-sm font-bold text-ink">{b.label}</span>
            <span className="text-sm text-ink-mute" aria-hidden>
              {Object.values(placed).filter((v) => v === b.id).length > 0
                ? `(${Object.values(placed).filter((v) => v === b.id).length})`
                : ''}
            </span>
          </button>
        ))}
      </div>
      {wrong && <Feedback kind="retry" message="حاول مرة أخرى 💛" />}
    </section>
  );
}

export function SortingGame({ activity }: { activity: SortingActivity }) {
  return (
    <SorterBase
      title={activity.title}
      instruction={activity.instruction}
      buckets={activity.buckets}
      items={activity.items.map((i) => ({ id: i.id, label: i.label, visual: i.visual, targetId: i.bucketId }))}
      bucketWord="الصندوق"
    />
  );
}

export function CategoryGame({ activity }: { activity: CategoryActivity }) {
  return (
    <SorterBase
      title={activity.title}
      instruction={activity.instruction}
      buckets={activity.categories}
      items={activity.items.map((i) => ({ id: i.id, label: i.label, visual: i.visual, targetId: i.categoryId }))}
      bucketWord="الفئة"
    />
  );
}
