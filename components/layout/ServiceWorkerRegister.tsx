'use client';

import { useEffect } from 'react';

/** تسجيل Service Worker لدعم العمل دون اتصال (PWA) — بلا أي تتبّع */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* قد يكون الموقع في وضع معاينة لا يسمح بالتسجيل — نتجاهل بصمت */
      });
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
