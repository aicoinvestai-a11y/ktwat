'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { siteConfig } from '@/config/site.config';
import { AudioSettings, BreakButton, QuietToggle } from '@/components/accessibility/Controls';

const NAV = [
  { href: '/', label: 'الرئيسية', icon: '🏠' },
  { href: '/skills', label: 'كل المهارات', icon: '🗂️' },
  { href: '/my-skills', label: 'مهاراتي', icon: '⭐' },
  { href: '/board', label: 'لوحة التواصل', icon: '🗣️' },
  { href: '/faith', label: 'ديني الجميل', icon: '🕌' },
  { href: '/about', label: 'عن الموقع', icon: 'ℹ️' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-paper-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400">
          <span aria-hidden className="text-3xl">
            🌱
          </span>
          <span className="font-display text-child-lg font-bold text-mint-700">{siteConfig.name}</span>
        </Link>

        <form onSubmit={submit} role="search" className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
          <label htmlFor="site-search" className="sr-only">
            ابحث عن مهارة
          </label>
          <input
            id="site-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="ابحث عن مهارة..."
            className="min-h-touch w-full rounded-xl2 border border-paper-line bg-white px-4 text-child-sm text-ink placeholder:text-ink-mute focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <QuietToggle />
          <AudioSettings />
          <BreakButton />
        </div>
      </div>

      <nav aria-label="التنقل الرئيسي" className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
        {NAV.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-touch items-center gap-2 whitespace-nowrap rounded-xl2 px-4 text-child-sm font-semibold transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-400 ${
                active ? 'bg-mint-100 text-mint-700' : 'text-ink-soft hover:bg-mint-50'
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
