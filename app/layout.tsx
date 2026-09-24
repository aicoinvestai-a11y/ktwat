import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { siteConfig } from '@/config/site.config';
import { PrefsProvider } from '@/lib/prefs';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister';
import { VoiceNotice } from '@/components/audio/VoiceNotice';

/** خطوط عربية محلية (بلا أي طلب خارجي) — Tajawal + Noto Kufi Arabic */
const tajawal = localFont({
  src: [
    { path: '../public/fonts/tajawal-400.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/tajawal-700.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-tajawal',
  display: 'swap',
});

const kufi = localFont({
  src: [
    { path: '../public/fonts/kufi-500.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/kufi-700.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-kufi',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.slogan}`,
  description: `${siteConfig.heroSubtitle}. محتوى تعليمي وتدريبي عربي للأطفال والأشخاص ذوي الإعاقة الذهنية واضطراب طيف التوحد، بإشراف الأسرة أو الأخصائي. بدون تسجيل وبدون جمع أي بيانات شخصية.`,
  applicationName: siteConfig.name,
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
  other: { 'color-scheme': 'light' },
};

export const viewport: Viewport = {
  themeColor: '#fbfaf7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${kufi.variable}`}>
      <body className="min-h-screen bg-paper">
        <a href="#main" className="sr-only sr-only-focusable absolute start-2 top-2 z-50 rounded-xl2 bg-white px-4 py-2 font-bold text-sky-800 shadow-lift">
          تخطَّ إلى المحتوى
        </a>
        <PrefsProvider>
          <SiteHeader />
          <main id="main" className="mx-auto max-w-6xl px-4 py-6">
            {children}
          </main>
          <SiteFooter />
          <VoiceNotice />
          <ServiceWorkerRegister />
        </PrefsProvider>
      </body>
    </html>
  );
}
