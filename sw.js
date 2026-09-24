/*
 * Service Worker — خطوتي (PWA)
 * تخزين مؤقت للموارد الأساسية (الصفحات، الخطوط، الأصوات، الصور) ليعمل الموقع مع اتصال ضعيف.
 * لا تتبّع، ولا إرسال أي بيانات إلى أي جهة.
 */
const VERSION = 'khatwati-v4';
const CORE = [
  '/ktwat/',
  '/ktwat/guide',
  '/ktwat/offline',
  '/ktwat/manifest.webmanifest',
  '/ktwat/icons/icon.svg',
  '/ktwat/fonts/tajawal-400.ttf',
  '/ktwat/fonts/tajawal-700.ttf',
  '/ktwat/fonts/kufi-500.ttf',
  '/ktwat/fonts/kufi-700.ttf',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      await cache.addAll(CORE).catch(() => undefined);
      // تخزين مسبق للجمل الصوتية المسجّلة (فهرس مولَّد) ليعمل الاستماع بلا إنترنت
      try {
        const res = await fetch('/ktwat/audio/voice/index.json', { cache: 'no-store' });
        if (!res.ok) return;
        // الأساسي فقط (الثابت + اللوحة) — البقية تُخزَّن عند أول تشغيل فعلي عبر مسار fetch
        const { core = [], files = [] } = await res.json();
        const pre = Array.isArray(core) && core.length ? core : files.slice(0, 40);
        if (pre.length) await cache.addAll(pre).catch(() => undefined);
      } catch {
        /* بلا شبكة عند التثبيت — لا مشكلة */
      }
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // الأصوات والخطوط والأيقونات: من المخزن أولاً
  const isAsset = /\.(mp3|ogg|wav|ttf|svg|png|jpg|jpeg|webp|webmanifest|json)$/.test(url.pathname);
  if (isAsset) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(request, copy)).catch(() => undefined);
            return res;
          }),
      ),
    );
    return;
  }

  // الصفحات: الشبكة أولاً ثم المخزن ثم صفحة بلا اتصال
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(request, copy)).catch(() => undefined);
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match('/ktwat/offline'))),
  );
});
