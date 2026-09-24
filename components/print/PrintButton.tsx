'use client';

/** زر الطباعة — لا يعمل إلا عند وجود المتصفح، لذلك في مكوّن عميل صغير. */
export function PrintButton({ label = 'اطبع البطاقة' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-touch rounded-xl2 bg-mint-500 px-5 py-3 text-child-base font-bold text-white shadow-lift focus-visible:outline focus-visible:outline-4 focus-visible:outline-mint-300"
    >
      <span aria-hidden>🖨️ </span>
      {label}
    </button>
  );
}
