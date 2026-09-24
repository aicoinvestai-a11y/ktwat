import Link from 'next/link';
import rawSurahs from '@/data/quran/surahs.json';
import { QURAN_SURAHS } from '@/lib/audio/library';
import { QuranSurahList } from '@/components/audio/QuranSurahList';

export const metadata = { title: 'القرآن الكريم — خطوتي' };

interface RawSurah {
  number: number;
  name: string;
  ayahs: string[];
}

export default function QuranPage() {
  const map = (rawSurahs as { surahs: Record<string, RawSurah> }).surahs;
  const surahs = QURAN_SURAHS.map((meta) => {
    const raw = map[String(meta.number)];
    return raw ? { number: meta.number, name: meta.name, ayahs: raw.ayahs } : null;
  }).filter(Boolean) as { number: number; name: string; ayahs: string[] }[];

  return (
    <div className="space-y-8">
      <header className="rounded-xl3 bg-paper-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-4xl font-bold text-ink">
          <span aria-hidden className="me-3">
            📖
          </span>
          القرآن الكريم
        </h1>
        <p className="mt-3 max-w-3xl text-child-base text-ink-soft">
          نستمع إلى تلاوة حقيقية، ونقرأ النص العثماني، ونردّد مع المشرف — بهدوء وبلا أي زخرفة مشتّتة.
        </p>
        <ul className="mt-4 space-y-2 text-child-sm text-ink-soft">
          <li>• التلاوة تسجيل صوتي حقيقي بصوت الشيخ مشاري راشد العفاسي.</li>
          <li>• لا يوجد نطق آلي للقرآن في هذا الموقع إطلاقاً — التلاوة المسموعة هنا تسجيلات كاملة لقارئ معروف.</li>
          <li>• يُراجَع المحتوى الديني نصاً وصوتاً من مصدر موثوق قبل النشر الموسّع.</li>
          <li>• الاستماع يكون مع شخص بالغ، وبلا تشغيل تلقائي.</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/faith"
            className="inline-flex min-h-touch items-center gap-2 rounded-xl2 bg-grape-100 px-6 text-child-base font-bold text-grape-700 shadow-soft"
          >
            <span aria-hidden>🕌</span> دروس ديني الجميل
          </Link>
          <Link
            href="/about"
            className="inline-flex min-h-touch items-center gap-2 rounded-xl2 bg-paper px-6 text-child-base font-semibold text-ink-soft shadow-soft"
          >
            <span aria-hidden>ℹ️</span> المصادر والتراخيص
          </Link>
        </div>
      </header>

      <section aria-labelledby="surahs-title" className="space-y-5">
        <h2 id="surahs-title" className="font-display text-child-lg font-bold text-ink">
          اختر سورة لتستمع إليها
        </h2>
        <QuranSurahList surahs={surahs} />
      </section>

      <p className="rounded-xl2 bg-mint-50 p-5 text-child-sm text-mint-700">
        عدد السور المتوفرة حالياً: {surahs.length}. باقي السور ستُضاف بنفس البنية (ملف صوتي حقيقي + نص من مصدر مراجَع)،
        دون أي قراءة آلية.
      </p>
    </div>
  );
}
