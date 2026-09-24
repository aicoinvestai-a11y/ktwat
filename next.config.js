/**
 * إعدادات Next.js — خطوتي
 *
 * وضعان:
 *  • تشغيل عادي: `npm run start` (سيرفر Node) — للتطوير والاستضافة.
 *  • تصدير ساكن: `npm run export:static` → مجلد `out/` فيه موقع كامل بلا سيرفر،
 *    صالح لـ GitHub Pages أو أي استضافة ملفات ثابتة.
 */
const isExport = process.env.STATIC_EXPORT === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // في التصدير الساكن: مسارات بمجلدات (/guide/) وهو ما تخدمه الاستضافات الثابتة
  ...(isExport
    ? {
        output: 'export',
        trailingSlash: true,
        images: { unoptimized: true },
        // للنشر على مسار فرعي (GitHub Pages: /ktwat) — يُضبط في وقت البناء فقط
        basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
      }
    : {}),
  // الخصوصية: لا أدوات تحليل ولا تتبّع ولا اتصال بأي خدمة خارجية.
  async headers() {
    if (isExport) return []; // الترويسات لا تُطبَّق في الاستضافة الثابتة
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          // إمكانية التضمين: الموقع بلا تسجيل ولا بيانات ولا إجراءات حساسة، لذا يُسمح بعرضه
          // داخل إطار (معاينات المنصات، ومواقع المدارس والمراكز). لا خطر انتحال نقرات هنا.
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' *" },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
