'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { TracingActivity } from '@/data/types';
import { audioService } from '@/lib/audio/service';
import { Feedback, GameTitle } from './parts';

/**
 * Tracing Canvas — يعمل باللمس على الهاتف والتابلت وبالفأرة.
 * أزرار: 🗑️ امسح، ↩️ حاول من جديد، 🔊 استمع. مساحة الرسم كبيرة.
 */
export function TracingGame({ activity }: { activity: TracingActivity }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  const drawGuide = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // خطوط إرشادية خفيفة
    ctx.strokeStyle = '#dceffa';
    ctx.lineWidth = 2;
    const baseline = rect.height * 0.72;
    ctx.beginPath();
    ctx.moveTo(24, baseline);
    ctx.lineTo(rect.width - 24, baseline);
    ctx.stroke();

    ctx.setLineDash([10, 12]);
    ctx.strokeStyle = '#bde0f5';
    ctx.lineWidth = 3;

    if (activity.mode === 'lines') {
      for (let i = 1; i <= 3; i++) {
        const y = (rect.height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(rect.width - 30, y);
        ctx.stroke();
      }
    } else if (activity.mode === 'dots') {
      const n = 7;
      const pts: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        pts.push([60 + t * (rect.width - 120), rect.height / 2 + Math.sin(t * Math.PI) * -rect.height * 0.22]);
      }
      ctx.setLineDash([]);
      pts.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#8ecbee';
        ctx.fill();
      });
    } else if (activity.guide) {
      ctx.setLineDash([]);
      ctx.fillStyle = '#dceffa';
      ctx.font = `${Math.min(rect.height * 0.62, rect.width / Math.max(activity.guide.length, 3) * 1.6)}px var(--font-tajawal), sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(activity.guide, rect.width / 2, rect.height * 0.42);
      ctx.setLineDash([6, 10]);
      ctx.strokeStyle = '#8ecbee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rect.width / 2, rect.height * 0.42, rect.height * 0.32, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  useEffect(() => {
    drawGuide();
    const onResize = () => {
      drawGuide();
      setHasDrawn(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity.mode, activity.guide]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    canvasRef.current?.setPointerCapture(e.pointerId);
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#2172b0';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setDrawing(true);
    setHasDrawn(true);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing) return;
    setDrawing(false);
    audioService.chime('soft');
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    snapshot && setSnapshot(null);
  };

  const retry = () => {
    drawGuide();
    setHasDrawn(false);
    audioService.say('repeat');
  };

  return (
    <section className="space-y-5">
      <GameTitle title={activity.title} instruction={activity.instruction} />

      <div ref={wrapperRef} className="rounded-xl2 border border-paper-line bg-white p-2 shadow-soft">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="h-[22rem] w-full touch-none rounded-xl2 md:h-[26rem]"
          aria-label={`مساحة الكتابة — ${activity.instruction}`}
          role="img"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={clear}
          className="min-h-touch rounded-xl2 bg-paper-card px-5 text-child-base font-semibold text-ink shadow-soft hover:bg-sky-50"
        >
          🗑️ امسح
        </button>
        <button
          type="button"
          onClick={retry}
          className="min-h-touch rounded-xl2 bg-paper-card px-5 text-child-base font-semibold text-ink shadow-soft hover:bg-sky-50"
        >
          ↩️ حاول من جديد
        </button>
        <button
          type="button"
          onClick={() => audioService.speak(activity.guideLabel ?? activity.instruction)}
          className="min-h-touch rounded-xl2 bg-sky-100 px-5 text-child-base font-semibold text-sky-800 hover:bg-sky-200"
        >
          🔊 استمع
        </button>
      </div>

      {hasDrawn && !drawing && <Feedback kind="correct" message="أحسنت! جرّب مرة أخرى إن أحببت" />}
      <p className="text-center text-child-sm text-ink-mute">
        يمكنك الرسم بالإصبع على الشاشة، أو باستخدام القلم على الورق مع الشخص الذي يساعدك.
      </p>
    </section>
  );
}
