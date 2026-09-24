'use client';

/**
 * Game Engine — خطوتي
 * محرّك واحد يقرأ بيانات الأنشطة (TypeScript/JSON) ويعرض اللعبة المناسبة.
 * إضافة أي عدد من التدريبات = إضافة بيانات فقط، بلا صفحات مكررة.
 */
import dynamic from 'next/dynamic';
import type { Activity, Visual } from '@/data/types';
import { ExploreGame, AudioChoiceGame, PictureChoiceGame, TrueFalseGame } from './SimpleGames';
import { MatchingGame, MemoryGame } from './MatchMemory';
import { CategoryGame, SortingGame } from './SortCategory';
import { DragDropGame } from './DragDropGame';
import { SequenceGame } from './SequenceGame';
import { CountingGame } from './CountingGame';
import { BuildSentenceGame } from './BuildSentenceGame';
import { StoryGame } from './StoryGame';
import { SimulationGame } from './SimulationGame';
import { SupervisedGame } from './SupervisedGame';
import { ListenPlayerGame } from './ListenPlayerGame';

/** تحميل متأخر للمكوّنات الثقيلة (Canvas / سطح المكتب الافتراضي) */
const TracingGame = dynamic(() => import('./TracingGame').then((m) => m.TracingGame), {
  ssr: false,
  loading: () => <CanvasPlaceholder label="نُجهّز لوحة الكتابة…" />,
});
const ComputerSimGame = dynamic(() => import('./ComputerSimGame').then((m) => m.ComputerSimGame), {
  ssr: false,
  loading: () => <CanvasPlaceholder label="نُجهّز الحاسوب الافتراضي…" />,
});

function CanvasPlaceholder({ label }: { label: string }) {
  return (
    <div role="status" className="rounded-xl2 bg-paper-card p-8 text-center text-child-base text-ink-mute shadow-soft">
      {label}
    </div>
  );
}

export function GameEngine({ activity, visual }: { activity: Activity; visual?: Visual }) {
  switch (activity.type) {
    case 'explore':
      return <ExploreGame activity={activity} />;
    case 'picture-choice':
      return <PictureChoiceGame activity={activity} />;
    case 'audio-choice':
      return <AudioChoiceGame activity={activity} />;
    case 'matching':
      return <MatchingGame activity={activity} />;
    case 'memory':
      return <MemoryGame activity={activity} />;
    case 'sorting':
      return <SortingGame activity={activity} />;
    case 'category':
      return <CategoryGame activity={activity} />;
    case 'drag-drop':
      return <DragDropGame activity={activity} />;
    case 'sequence':
      return <SequenceGame activity={activity} />;
    case 'counting':
      return <CountingGame activity={activity} />;
    case 'tracing':
      return <TracingGame activity={activity} />;
    case 'build-sentence':
      return <BuildSentenceGame activity={activity} />;
    case 'true-false':
      return <TrueFalseGame activity={activity} />;
    case 'story':
      return <StoryGame activity={activity} />;
    case 'simulation':
      return <SimulationGame activity={activity} />;
    case 'supervised':
      return <SupervisedGame activity={activity} visual={visual} />;
    case 'listen-player':
      return <ListenPlayerGame activity={activity} />;
    case 'computer-sim':
      return <ComputerSimGame activity={activity} />;
    default:
      return null;
  }
}
