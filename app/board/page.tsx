import Link from 'next/link';
import { CommunicationBoard } from '@/components/board/CommunicationBoard';
import { BOARD_GROUPS } from '@/data/board';

export const metadata = { title: 'لوحة التواصل — خطوتي' };

export default function BoardPage() {
  const total = BOARD_GROUPS.reduce((n, g) => n + g.cards.length, 0);

  return (
    <div className="space-y-8">
      <header className="rounded-xl3 bg-paper-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-4xl font-bold text-ink">
          <span aria-hidden className="me-3">
            🗣️
          </span>
          لوحة التواصل بالصور
        </h1>
        <p className="mt-3 max-w-3xl text-child-base text-ink-soft">
          بطاقات كبيرة للنطق والتعبير عن الاحتياجات والمشاعر ({total} بطاقة في {BOARD_GROUPS.length} مجموعات). اضغط البطاقة
          لتسمع العبارة، ويمكنك التكرار بلا حد. لا يوجد تشغيل تلقائي.
        </p>

        <aside className="mt-5 rounded-xl2 border border-sun-200 bg-sun-50 p-4 text-child-sm text-sun-700" role="note">
          <p className="font-bold">تنبيه مهم للأهل والأخصائي</p>
          <p className="mt-2">
            هذه اللوحة <strong>تعليمية</strong> للتدريب على التعبير عن الاحتياجات وتوسيع المفردات، وليست أداة «تواصل معزّز
            وبديل» المعتمدة سريرياً، ولا تُستخدم بديلاً عن تقييم أو توصيات أخصائي النطق والتواصل. تُستخدم مع شخص بالغ،
            وبالطريقة التي تناسب طريقة تواصل الطفل — الكلام أو الإشارة أو الصورة أو غيرها.
          </p>
        </aside>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/category/language"
            className="inline-flex min-h-touch items-center gap-2 rounded-xl2 bg-sky-100 px-6 text-child-base font-bold text-sky-800 shadow-soft"
          >
            <span aria-hidden>💬</span> مهارات التواصل
          </Link>
          <Link
            href="/skills"
            className="inline-flex min-h-touch items-center gap-2 rounded-xl2 bg-paper px-6 text-child-base font-semibold text-ink-soft shadow-soft"
          >
            <span aria-hidden>🗂️</span> كل المهارات
          </Link>
        </div>
      </header>

      <CommunicationBoard />

      <section className="rounded-xl2 bg-mint-50 p-5 text-child-sm text-mint-700">
        <p className="font-bold">🌿 كيف نستخدمها بهدوء؟</p>
        <ul className="mt-2 space-y-1">
          <li>• نجلس مع الطفل في مكان هادئ، ونعرض مجموعة واحدة فقط (٦–٨ بطاقات).</li>
          <li>• نسمّي البطاقة وننطقها معه، وننتظر مدة كافية قبل تكرارها.</li>
          <li>• لا نصحّح بالقول «خطأ»، بل نكرّر العبارة الصحيحة بلطف ونشجّع المحاولة.</li>
          <li>• نطبّقها في مواقف حقيقية بسيطة: وقت الطعام، وقت الحمام، وقت اللعب.</li>
          <li>• يتوقف النشاط إذا ظهر تعب أو انزعاج — «وقت هادئ 🌿» متاح دائماً.</li>
        </ul>
      </section>
    </div>
  );
}
