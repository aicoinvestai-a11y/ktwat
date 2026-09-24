'use client';

import { useEffect, useState } from 'react';

/**
 * تنبيه هادئ عند غياب صوت عربي على الجهاز — خطوتي 🎧
 *
 * السبب: بعض الأجهزة لا تحتوي على صوت عربي في محرّك النطق، فكان النص العربي يُقرأ بصوت أعجمي
 * فيُسمع كلاماً غير مفهوم (يبدو «إنجليزياً»). القاعدة في المشروع: لا نُشغّل نطقاً غير مفهوم أبداً.
 *
 * السلوك: كل جملة لها تسجيل مسجّل تعمل طبيعياً بلا هذا التنبيه؛ والتنبيه يظهر مرّة واحدة فقط،
 * بلغة بسيطة، ويقدّم بديلاً عملياً (المتابعة بصريّاً مع الشخص الذي يساعدك).
 */
export function VoiceNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onMissing = () => setShow(true);
    window.addEventListener('khatwati:no-arabic-voice', onMissing as EventListener);
    return () => window.removeEventListener('khatwati:no-arabic-voice', onMissing as EventListener);
  }, []);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl rounded-xl2 border border-sky-200 bg-paper-card p-4 shadow-lift"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-2xl leading-none">
          🔊
        </span>
        <div className="flex-1">
          <p className="font-display text-child-base font-bold text-ink">صوت جهازك لا ينطق العربية</p>
          <p className="mt-1 text-child-sm text-ink-soft">
            بعض الجمل في الموقع لها تسجيل مسجّل وتعمل طبيعياً. وما زال بلا تسجيل لا نُشغّله بصوت غير عربي حتى لا
            تسمع كلاماً غير مفهوم — تقدّم في النشاط بصريّاً مع الشخص الذي يساعدك 🌱
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShow(false)}
          className="min-h-touch rounded-xl2 bg-sky-100 px-3 font-semibold text-sky-800"
        >
          حسناً
        </button>
      </div>
    </div>
  );
}
