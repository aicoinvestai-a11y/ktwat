'use client';

import React, { useRef, useState } from 'react';
import type { ComputerSimActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { Feedback, GameTitle } from './parts';

/**
 * محاكاة حاسوب — خطوتي
 * سطح مكتب افتراضي داخل الموقع: أجزاء الحاسوب، التشغيل، الفأرة، لوحة المفاتيح، النوافذ،
 * وورد، بوربوينت، والرسام — بتدريبات مبسّطة وبلا أي بيانات شخصية.
 */
export function ComputerSimGame({ activity }: { activity: ComputerSimActivity }) {
  const { task, payload } = activity;
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const success = (text: string) => {
    setOk(true);
    setMessage(text);
    audioService.chime('success');
    audioService.praise();
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />
      <div className="rounded-xl2 border border-paper-line bg-sky-50 p-4 shadow-soft">
        <DesktopChrome task={task} payload={payload} onDone={success} onHint={setMessage} />
      </div>
      {message && <Feedback kind={ok ? 'correct' : 'info'} message={message} />}
      <p className="text-center text-child-sm text-ink-mute">
        هذه محاكاة تعليمية داخل الموقع. التدريب الحقيقي على الحاسوب يكون مع الشخص الذي يساعدك.
      </p>
    </section>
  );
}

function DesktopChrome({
  task,
  payload,
  onDone,
  onHint,
}: {
  task: ComputerSimActivity['task'];
  payload: ComputerSimActivity['payload'];
  onDone: (t: string) => void;
  onHint: (t: string) => void;
}) {
  switch (task) {
    case 'posture':
      return <PostureTask payload={payload} onDone={onDone} onHint={onHint} />;
    case 'parts':
      return <PartsTask payload={payload} onDone={onDone} onHint={onHint} />;
    case 'power':
      return <PowerTask payload={payload} onDone={onDone} onHint={onHint} />;
    case 'mouse':
      return <MouseTask payload={payload} onDone={onDone} onHint={onHint} />;
    case 'keyboard':
    case 'typing':
      return <KeyboardTask payload={payload} onDone={onDone} onHint={onHint} />;
    case 'window':
      return <WindowTask onDone={onDone} onHint={onHint} />;
    case 'word':
    case 'powerpoint':
      return <OfficeTask kind={task} payload={payload} onDone={onDone} onHint={onHint} />;
    case 'paint':
      return <PaintTask payload={payload} onDone={onDone} onHint={onHint} />;
    default:
      return <Feedback kind="info" message="تدريب الحاسوب" />;
  }
}

/* ————— 1) الجلسة الصحيحة ————— */
function PostureTask({ payload, onDone, onHint }: TaskProps) {
  const options = payload?.options ?? [];
  return (
    <div className="space-y-3">
      <p className="text-child-base font-bold text-ink">اختر الجلسة الصحيحة:</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => {
              if (o.label === payload?.answerLabel) onDone('أحسنت! جلسة صحيحة ومريحة');
              else onHint('حاول مرة أخرى — الظهر مستقيم والقدمان على الأرض');
            }}
            className="flex min-h-[6rem] flex-col items-center justify-center gap-2 rounded-xl2 border border-paper-line bg-white p-4 shadow-soft transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
          >
            <span className="text-4xl" aria-hidden>
              {o.visual.value}
            </span>
            <span className="text-child-sm font-semibold text-ink">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ————— 2) أجزاء الحاسوب ————— */
const PC_PARTS = [
  { label: 'الشاشة', emoji: '🖥️' },
  { label: 'لوحة المفاتيح', emoji: '⌨️' },
  { label: 'الفأرة', emoji: '🖱️' },
  { label: 'سماعات', emoji: '🎧' },
  { label: 'صندوق الحاسوب', emoji: '🖲️' },
];

function PartsTask({ onDone, onHint }: TaskProps) {
  const [seen, setSeen] = useState<string[]>([]);
  const press = (label: string) => {
    audioService.speak(label);
    setSeen((s) => (s.includes(label) ? s : [...s, label]));
    if (seen.length + 1 === PC_PARTS.length) onDone('أحسنت! تعرفت على أجزاء الحاسوب');
    else onHint(`هذا ${label} — اضغط بقية الأجزاء`);
  };
  return (
    <div className="space-y-3">
      <p className="text-child-base font-bold text-ink">اضغط على كل جزء لتسمع اسمه:</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PC_PARTS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => press(p.label)}
            className={`flex min-h-[6rem] flex-col items-center justify-center gap-1 rounded-xl2 border p-3 shadow-soft transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
              seen.includes(p.label) ? 'border-mint-200 bg-mint-50' : 'border-paper-line bg-white hover:bg-sky-50'
            }`}
          >
            <span className="text-4xl" aria-hidden>
              {p.emoji}
            </span>
            <span className="text-sm font-semibold text-ink">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ————— 3) التشغيل ————— */
function PowerTask({ onDone, onHint }: TaskProps) {
  const [on, setOn] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex min-h-[10rem] items-center justify-center rounded-xl2 bg-ink/90 text-5xl">
        {on ? <span aria-label="سطح المكتب">🖥️</span> : <span aria-label="شاشة مغلقة" className="opacity-40">⬛</span>}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (!on) {
              setOn(true);
              onHint('جيد! الحاسوب يعمل الآن… انتظر قليلاً');
              setTimeout(() => onDone('أحسنت! شغّلت الحاسوب وأغلقته بأمان'), 900);
            } else {
              setOn(false);
              onHint('أغلقنا الحاسوب بهدوء');
            }
          }}
          aria-pressed={on}
          className="min-h-touch rounded-xl2 bg-white px-6 text-3xl shadow-soft focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
        >
          <span aria-hidden>⏻</span>
          <span className="ms-2 text-child-sm font-bold text-ink">{on ? 'إغلاق' : 'تشغيل'}</span>
        </button>
      </div>
    </div>
  );
}

/* ————— 4) الفأرة ————— */
function MouseTask({ payload, onDone, onHint }: TaskProps) {
  const [hover, setHover] = useState(false);
  const [found, setFound] = useState(false);
  return (
    <div className="space-y-3">
      <p className="text-center text-child-base font-bold text-ink">
        حرّك الفأرة إلى {payload?.targetLabel ?? 'النجمة'} ثم اضغط عليها
      </p>
      <div className="flex min-h-[12rem] items-center justify-center rounded-xl2 bg-white shadow-inner">
        <button
          type="button"
          onMouseEnter={() => setHover(true)}
          onFocus={() => setHover(true)}
          onClick={() => {
            if (!found) {
              setFound(true);
              onDone('أحسنت! تحرّك المؤشر وضغطت على النجمة');
            }
          }}
          className={`flex h-32 w-32 items-center justify-center rounded-full text-6xl transition ${
            hover ? 'bg-sun-100 scale-105' : 'bg-sky-50'
          } ${found ? 'ring-4 ring-mint-400' : ''}`}
          aria-label="النجمة — اضغط هنا"
        >
          <span aria-hidden>{payload?.targetVisual?.value ?? '⭐'}</span>
        </button>
      </div>
      {hover && !found && <Feedback kind="info" message="ممتاز! الآن اضغط على النجمة" />}
      {!hover && <Feedback kind="info" message="حرّك المؤشر فوق النجمة (أو وصل إليها بلوحة المفاتيح بالضغط على Tab)" />}
      <button type="button" onClick={() => onHint('يمكن استخدام الفأرة الحقيقية مع الشخص الذي يساعدك')} className="mx-auto block text-sm text-ink-mute underline">
        كيف أجرّبها بالواقع؟
      </button>
    </div>
  );
}

/* ————— 5) لوحة المفاتيح/الكتابة ————— */
function KeyboardTask({ payload, onDone, onHint }: TaskProps) {
  const target = payload?.text ?? 'كتاب';
  const [typed, setTyped] = useState('');
  const keys = ['ا', 'ب', 'ت', 'ك', 'ن', 'خ', 'ي', 'ر', '1', '2', '3', '4', '5'];

  const press = (k: string) => {
    const next = typed + k;
    if (target.startsWith(next)) {
      setTyped(next);
      audioService.speak(k);
      if (next === target) onDone(`أحسنت! كتبت: ${target}`);
    } else {
      onHint('حاول مرة أخرى 💛');
      audioService.encourage();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-child-base font-bold text-ink">
        اكتب: <span className="rounded-lg bg-white px-3 py-1">{target}</span>
      </p>
      <div className="flex min-h-[4rem] items-center justify-center gap-2 rounded-xl2 bg-white p-3 text-child-lg font-bold text-ink shadow-inner">
        {typed || <span className="text-ink-mute">…</span>}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className="h-14 w-14 rounded-xl2 bg-white text-child-base font-bold text-ink shadow-soft transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
          >
            {k}
          </button>
        ))}
      </div>
      <Feedback kind="info" message="هذه لوحة مفاتيح مبسّطة للتدريب. لا نكتب أي اسم أو بيانات شخصية." />
    </div>
  );
}

/* ————— 6) النوافذ ————— */
function WindowTask({ onDone, onHint }: TaskProps) {
  const [open, setOpen] = useState(true);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="space-y-3">
      <p className="text-child-base font-bold text-ink">افتح النافذة، اسحبها من الشريط العلوي، ثم أغلقها:</p>
      <div className="relative min-h-[13rem] overflow-hidden rounded-xl2 bg-sky-100">
        {minimized && (
          <button
            type="button"
            onClick={() => {
              setMinimized(false);
              onHint('عادت النافذة للظهور');
            }}
            className="absolute bottom-2 start-2 rounded-xl2 bg-white px-4 py-2 text-child-sm font-semibold shadow-soft"
          >
            🪟 نافذة مصغّرة
          </button>
        )}
        {open && !minimized && (
          <div
            className="absolute w-64 rounded-xl2 bg-white shadow-lift"
            style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, top: 12, insetInlineStart: 12 }}
          >
            <div
              className="flex cursor-grab items-center justify-between rounded-t-xl2 bg-grape-100 px-3 py-2"
              onPointerDown={(e) => {
                dragRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!dragRef.current) return;
                setPos({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y });
              }}
              onPointerUp={() => {
                dragRef.current = null;
                onHint('أحسنت! سحبت النافذة');
              }}
            >
              <span className="text-child-sm font-bold text-grape-700">نافذتي 🪟</span>
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMinimized(true)}
                  aria-label="تصغير النافذة"
                  className="h-8 w-8 rounded-lg bg-white text-lg"
                >
                  ➖
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onDone('أحسنت! فتحت النافذة وسحبتها وأغلقتها');
                  }}
                  aria-label="إغلاق النافذة"
                  className="h-8 w-8 rounded-lg bg-white text-lg"
                >
                  ❌
                </button>
              </span>
            </div>
            <div className="p-4 text-child-sm text-ink-soft">هذه نافذة تعليمية داخل الموقع.</div>
          </div>
        )}
        {!open && (
          <div className="flex h-[13rem] items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setOpen(true);
                setPos({ x: 0, y: 0 });
                onHint('فتحنا النافذة من جديد');
              }}
              className="rounded-xl2 bg-white px-5 py-3 text-child-base font-semibold shadow-soft"
            >
              🖱️ فتح النافذة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ————— 7) وورد / بوربوينت ————— */
function OfficeTask({ kind, payload, onDone, onHint }: TaskProps & { kind: 'word' | 'powerpoint' }) {
  const [opened, setOpened] = useState(false);
  const [text, setText] = useState('');
  const [slides, setSlides] = useState<string[]>([]);
  const isWord = kind === 'word';

  return (
    <div className="space-y-3">
      <p className="text-child-base font-bold text-ink">اضغط الأيقونة لفتح {isWord ? 'وورد' : 'بوربوينت'}:</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setOpened(true);
            audioService.speak(isWord ? 'فتحنا برنامج وورد' : 'فتحنا برنامج بوربوينت');
            onHint(isWord ? 'اكتب جملة قصيرة داخل الصفحة' : 'أضف شريحة واكتب عنواناً');
          }}
          className="flex min-h-[5rem] w-24 flex-col items-center justify-center gap-1 rounded-xl2 bg-white shadow-soft"
        >
          <span className="text-4xl" aria-hidden>
            {payload?.targetVisual?.value ?? (isWord ? '📝' : '📊')}
          </span>
          <span className="text-sm font-bold text-ink">{isWord ? 'وورد' : 'بوربوينت'}</span>
        </button>
      </div>

      {opened && isWord && (
        <div className="space-y-2 rounded-xl2 bg-white p-4 shadow-soft">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب جملة قصيرة هنا…"
            className="min-h-touch w-full rounded-xl2 border border-paper-line px-4 text-child-base"
            aria-label="صفحة الكتابة"
          />
          {text.trim().length > 3 && onDoneSafe(text, onDone)}
        </div>
      )}

      {opened && !isWord && (
        <div className="space-y-2 rounded-xl2 bg-white p-4 shadow-soft">
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setSlides((s) => (s.length >= 3 ? s : [...s, `شريحة ${s.length + 1}`]))}
              className="min-h-touch rounded-xl2 bg-sky-100 px-4 text-child-sm font-semibold text-sky-800"
            >
              ➕ شريحة جديدة
            </button>
          </div>
          <ul className="flex flex-wrap justify-center gap-2">
            {slides.map((s) => (
              <li key={s} className="rounded-xl2 bg-paper px-4 py-2 text-child-sm">
                🖼️ {s}
              </li>
            ))}
          </ul>
          {slides.length >= 2 && onDoneSafe('عرض بوربوينت', onDone)}
        </div>
      )}
    </div>
  );
}

function onDoneSafe(text: string, onDone: (t: string) => void) {
  return (
    <div className="text-center">
      <button
        type="button"
        onClick={() => onDone(`أحسنت! أنجزت التدريب (${text})`)}
        className="mt-2 min-h-touch rounded-xl2 bg-mint-100 px-5 text-child-sm font-bold text-mint-700"
      >
        ✓ انتهيت
      </button>
    </div>
  );
}

/* ————— 8) الرسام ————— */
function PaintTask({ payload, onDone, onHint }: TaskProps) {
  const [tool, setTool] = useState<'line' | 'shape' | 'fill'>('line');
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const tools = payload?.options ?? [
    { label: 'الخط', visual: { kind: 'emoji' as const, value: '✏️' } },
    { label: 'الشكل', visual: { kind: 'emoji' as const, value: '⬛' } },
    { label: 'التعبئة', visual: { kind: 'emoji' as const, value: '🪣' } },
  ];

  const pointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    c.setPointerCapture(e.pointerId);
    const { x, y } = pointer(e);
    drawing.current = true;
    if (tool === 'fill') {
      ctx.fillStyle = '#ffe087';
      ctx.fillRect(0, 0, c.width, c.height);
      onDone('جميل! استخدمت أداة التعبئة');
      drawing.current = false;
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#2172b0';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pointer(e);
    if (tool === 'shape') {
      ctx.fillStyle = '#b3e9cf';
      ctx.fillRect(x, y, 24, 24);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const up = () => {
    if (drawing.current) {
      drawing.current = false;
      audioService.chime('soft');
      onHint('رسمة جميلة! يمكنك تغيير الأداة أو المتابعة');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-center gap-2">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => {
              setTool(t.label === 'الشكل' ? 'shape' : t.label === 'التعبئة' ? 'fill' : 'line');
              audioService.speak(t.label);
            }}
            className={`min-h-touch rounded-xl2 px-4 text-child-sm font-semibold shadow-soft ${
              (t.label === 'الشكل' && tool === 'shape') || (t.label === 'التعبئة' && tool === 'fill') || (t.label === 'الخط' && tool === 'line')
                ? 'bg-mint-100 text-mint-700'
                : 'bg-white text-ink'
            }`}
          >
            <span aria-hidden className="me-2">
              {t.visual.value}
            </span>
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const c = ref.current;
            const ctx = c?.getContext('2d');
            if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
          }}
          className="min-h-touch rounded-xl2 bg-white px-4 text-child-sm font-semibold text-ink shadow-soft"
        >
          🗑️ امسح
        </button>
      </div>
      <canvas
        ref={ref}
        width={640}
        height={360}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        className="h-64 w-full touch-none rounded-xl2 bg-white shadow-inner md:h-80"
        aria-label="لوحة الرسم"
      />
    </div>
  );
}

interface TaskProps {
  payload?: ComputerSimActivity['payload'];
  onDone: (t: string) => void;
  onHint: (t: string) => void;
}
