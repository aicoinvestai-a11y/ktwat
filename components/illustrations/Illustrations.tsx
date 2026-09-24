/**
 * رسوم أصلية — خطوتي (SVG مبني يدوياً، أسلوب flat ناعم غير مخيف)
 * تُستخدم في الصفحة الرئيسية وبطاقات المحاور، ويمكن استبدالها برسوم أدق لاحقاً.
 */

export function HeroScene({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 360"
      role="img"
      aria-label="رسمة أصلية: طفل وطفلة يقفان وسط عالم صغير فيه بيت وشجرة ومدرسة ومتجر وحاسوب"
      className={className}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9f6fd" />
          <stop offset="100%" stopColor="#fbfaf7" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" rx="28" fill="url(#skyGrad)" />
      <circle cx="540" cy="70" r="34" fill="#ffe087" />
      <circle cx="540" cy="70" r="46" fill="#ffe087" opacity="0.35" />

      {/* أرضية */}
      <path d="M0 288h640v44a28 28 0 0 1-28 28H28A28 28 0 0 1 0 332z" fill="#d9f5e7" />
      <path d="M0 300c120-22 240-22 360 0s200 18 280 6v54H0z" fill="#b3e9cf" opacity="0.6" />

      {/* بيت */}
      <g transform="translate(60 168)">
        <rect x="0" y="34" width="96" height="70" rx="8" fill="#fff6f1" stroke="#ffd2b8" strokeWidth="3" />
        <path d="M-10 36 48 -6l58 42z" fill="#fb8f57" />
        <rect x="36" y="62" width="26" height="42" rx="4" fill="#ffd2b8" />
        <rect x="12" y="50" width="16" height="16" rx="3" fill="#bde0f5" />
      </g>

      {/* مدرسة */}
      <g transform="translate(478 172)">
        <rect x="0" y="24" width="102" height="78" rx="10" fill="#f1f8fd" stroke="#bde0f5" strokeWidth="3" />
        <rect x="16" y="6" width="70" height="22" rx="6" fill="#8ecbee" />
        <rect x="22" y="46" width="20" height="20" rx="4" fill="#bde0f5" />
        <rect x="58" y="46" width="20" height="20" rx="4" fill="#bde0f5" />
        <rect x="40" y="74" width="22" height="28" rx="4" fill="#57ade2" />
      </g>

      {/* شجرة */}
      <g transform="translate(180 160)">
        <rect x="18" y="60" width="14" height="52" rx="6" fill="#c65520" opacity="0.5" />
        <circle cx="26" cy="46" r="34" fill="#4dbc8e" />
        <circle cx="4" cy="60" r="22" fill="#2ba273" />
        <circle cx="48" cy="62" r="20" fill="#82d7b1" />
      </g>

      {/* سلة/بسطة منتجات صغيرة */}
      <g transform="translate(376 200)">
        <rect x="0" y="34" width="78" height="42" rx="8" fill="#fff1c6" stroke="#ffcb48" strokeWidth="3" />
        <circle cx="18" cy="30" r="10" fill="#fb8f57" />
        <circle cx="40" cy="28" r="11" fill="#4dbc8e" />
        <circle cx="60" cy="30" r="9" fill="#ffe087" />
      </g>

      {/* حاسوب صغير */}
      <g transform="translate(300 236)">
        <rect x="0" y="0" width="52" height="34" rx="6" fill="#eeebff" stroke="#c5b8ff" strokeWidth="3" />
        <rect x="6" y="6" width="40" height="22" rx="4" fill="#ded8ff" />
        <rect x="16" y="38" width="20" height="6" rx="3" fill="#c5b8ff" />
      </g>

      {/* الطفل والطفلة في المنتصف */}
      <g transform="translate(232 96)">
        {/* طفلة */}
        <g transform="translate(0 0)">
          <circle cx="34" cy="30" r="26" fill="#ffe9c9" />
          <path d="M8 26c0-16 12-26 26-26s26 10 26 26c0-8-10-12-26-12S8 18 8 26z" fill="#6d51c4" />
          <circle cx="26" cy="30" r="3.2" fill="#26313d" />
          <circle cx="43" cy="30" r="3.2" fill="#26313d" />
          <path d="M27 41c4 4 10 4 14 0" stroke="#c65520" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="16" y="58" width="36" height="58" rx="14" fill="#a893f8" />
          <rect x="4" y="66" width="12" height="40" rx="6" fill="#ffe9c9" />
          <rect x="52" y="66" width="12" height="40" rx="6" fill="#ffe9c9" />
          <rect x="18" y="116" width="14" height="42" rx="7" fill="#318fd0" />
          <rect x="36" y="116" width="14" height="42" rx="7" fill="#318fd0" />
        </g>
        {/* طفل */}
        <g transform="translate(96 6)">
          <circle cx="34" cy="30" r="26" fill="#ffe9c9" />
          <path d="M8 28c0-16 12-26 26-26s26 10 26 26c0 0-6-10-26-10S8 28 8 28z" fill="#4c5b6b" />
          <circle cx="26" cy="32" r="3.2" fill="#26313d" />
          <circle cx="43" cy="32" r="3.2" fill="#26313d" />
          <path d="M27 43c4 4 10 4 14 0" stroke="#c65520" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="16" y="58" width="36" height="58" rx="14" fill="#4dbc8e" />
          <rect x="4" y="66" width="12" height="40" rx="6" fill="#ffe9c9" />
          <rect x="52" y="66" width="12" height="40" rx="6" fill="#ffe9c9" />
          <rect x="18" y="116" width="14" height="42" rx="7" fill="#c65520" opacity="0.75" />
          <rect x="36" y="116" width="14" height="42" rx="7" fill="#c65520" opacity="0.75" />
        </g>
      </g>

      {/* ديكورات صغيرة: نجوم وقلوب */}
      <circle cx="120" cy="60" r="6" fill="#ffcb48" />
      <circle cx="420" cy="46" r="5" fill="#8c72e6" opacity="0.7" />
      <circle cx="600" cy="180" r="7" fill="#4dbc8e" opacity="0.6" />
    </svg>
  );
}

export function WorldScene({ id, className = '' }: { id: 'self-care' | 'cognitive' | 'motor' | 'vocational'; className?: string }) {
  const palette: Record<string, { a: string; b: string; c: string }> = {
    'self-care': { a: '#d9f5e7', b: '#4dbc8e', c: '#fff6f1' },
    cognitive: { a: '#dceffa', b: '#318fd0', c: '#f7f5ff' },
    motor: { a: '#fff1c6', b: '#f9b520', c: '#fff6f1' },
    vocational: { a: '#eeebff', b: '#8c72e6', c: '#f1f8fd' },
  };
  const p = palette[id];
  return (
    <svg viewBox="0 0 200 140" role="img" aria-hidden className={className}>
      <rect width="200" height="140" rx="20" fill={p.a} />
      <circle cx="164" cy="34" r="20" fill={p.c} />
      {id === 'self-care' && (
        <g>
          <path d="M50 104V74l30-22 30 22v30z" fill={p.c} stroke={p.b} strokeWidth="3" />
          <rect x="70" y="86" width="20" height="18" fill={p.b} opacity="0.6" />
          <circle cx="42" cy="70" r="12" fill={p.b} opacity="0.4" />
        </g>
      )}
      {id === 'cognitive' && (
        <g>
          <circle cx="76" cy="76" r="30" fill={p.c} stroke={p.b} strokeWidth="4" />
          <path d="M60 76h32M76 60v32" stroke={p.b} strokeWidth="3" />
          <circle cx="140" cy="96" r="12" fill={p.b} opacity="0.5" />
        </g>
      )}
      {id === 'motor' && (
        <g>
          <circle cx="84" cy="52" r="16" fill="#26313d" opacity="0.8" />
          <rect x="74" y="68" width="20" height="34" rx="9" fill={p.b} />
          <rect x="52" y="70" width="22" height="9" rx="4" fill={p.b} />
          <rect x="94" y="70" width="22" height="9" rx="4" fill={p.b} />
          <rect x="76" y="100" width="9" height="26" rx="4" fill="#26313d" opacity="0.7" />
          <rect x="88" y="100" width="9" height="26" rx="4" fill="#26313d" opacity="0.7" />
        </g>
      )}
      {id === 'vocational' && (
        <g>
          <rect x="46" y="60" width="66" height="46" rx="8" fill={p.c} stroke={p.b} strokeWidth="3" />
          <rect x="58" y="44" width="42" height="16" rx="6" fill={p.b} opacity="0.7" />
          <circle cx="132" cy="86" r="14" fill={p.b} opacity="0.5" />
          <path d="M124 74l20 24" stroke={p.c} strokeWidth="4" />
        </g>
      )}
      <rect x="0" y="118" width="200" height="22" rx="11" fill={p.b} opacity="0.35" />
    </svg>
  );
}

/** أيقونات مناطق الخريطة */
export function SpotIllustration({ spot, className = '' }: { spot: string; className?: string }) {
  const shapes: Record<string, { bg: string; draw: React.ReactNode }> = {
    home: { bg: '#d9f5e7', draw: <path d="M22 46V30l18-13 18 13v16z" fill="#4dbc8e" /> },
    kitchen: { bg: '#fff1c6', draw: <><circle cx="40" cy="38" r="12" fill="#f9b520" /><rect x="22" y="46" width="36" height="6" rx="3" fill="#fb8f57" /></> },
    bathroom: { bg: '#dceffa', draw: <><rect x="24" y="26" width="34" height="26" rx="8" fill="#57ade2" /><circle cx="34" cy="38" r="3" fill="#fff" /><circle cx="48" cy="38" r="3" fill="#fff" /></> },
    wardrobe: { bg: '#eeebff', draw: <><rect x="26" y="22" width="30" height="34" rx="6" fill="#8c72e6" /><path d="M41 22v34" stroke="#fff" strokeWidth="2" /></> },
    street: { bg: '#ffe9dd', draw: <><rect x="38" y="18" width="10" height="42" rx="5" fill="#26313d" opacity="0.8" /><circle cx="43" cy="24" r="5" fill="#ee7132" /><circle cx="43" cy="40" r="5" fill="#f9b520" /><circle cx="43" cy="56" r="5" fill="#4dbc8e" /></> },
    market: { bg: '#fff6f1', draw: <><rect x="22" y="30" width="42" height="28" rx="6" fill="#fb8f57" opacity="0.7" /><path d="M18 30h50l-6-10H24z" fill="#ee7132" /></> },
    talk: { bg: '#dceffa', draw: <><rect x="20" y="24" width="40" height="26" rx="10" fill="#318fd0" /><path d="M30 50l-4 10 12-10z" fill="#318fd0" /><circle cx="32" cy="37" r="3" fill="#fff" /><circle cx="42" cy="37" r="3" fill="#fff" /><circle cx="52" cy="37" r="3" fill="#fff" /></> },
    community: { bg: '#d9f5e7', draw: <><circle cx="34" cy="32" r="8" fill="#2ba273" /><circle cx="52" cy="32" r="8" fill="#4dbc8e" /><rect x="24" y="42" width="20" height="16" rx="7" fill="#2ba273" /><rect x="42" y="42" width="20" height="16" rx="7" fill="#4dbc8e" /></> },
  };
  const s = shapes[spot] ?? shapes.home;
  return (
    <svg viewBox="0 0 80 80" role="img" aria-hidden className={className}>
      <circle cx="40" cy="40" r="38" fill={s.bg} />
      {s.draw}
    </svg>
  );
}
