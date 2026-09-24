import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import { allSkills, supervisedSkills, safetySensitiveSkills, categoriesWithCounts } from '@/data/skills';
import { ALL_BOARD_CARDS, BOARD_GROUPS } from '@/data/board';
import { DOMAINS } from '@/data/taxonomy';
import { PrintButton } from '@/components/print/PrintButton';

export const metadata = { title: 'دليل الاستخدام للأسرة والأخصائي — خطوتي' };

const JOURNEY = [
  {
    icon: '👀',
    title: 'أشاهد',
    body: 'صور توضيحية كبيرة تُظهر المهارة خطوة خطوة، بلا قراءة ولا ضغط.',
  },
  {
    icon: '🔊',
    title: 'أستمع',
    body: 'الجملة تُقال بصوت عربي واضح، مع زر إعادة بلا حد، وبلا تشغيل تلقائي أبداً.',
  },
  {
    icon: '💡',
    title: 'أتعلم',
    body: 'شرح مبسّط بجمل قصيرة، مع تنبيه واضح للمهارات التي تحتاج شخصاً بالغاً.',
  },
  {
    icon: '🎮',
    title: 'ألعب',
    body: 'نشاط تفاعلي من اختيار الصورة والمطابقة والترتيب والذاكرة والعدّ والمحاكاة وغيرها.',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'جرّب مع المشرف',
    body: 'نشاط واقعي أو محاكاة آمنة، مع قائمة أدوات وخطوات، وتنبيه سلامة عند الحاجة.',
  },
];

const SESSION = [
  {
    title: 'قبل الجلسة',
    items: [
      'اختر جلسة قصيرة (٥–١٥ دقيقة) في وقت هادئ.',
      'جهّز المكان: بلا ضجيج، ومع إضاءة مريحة.',
      'افتح الموقع على الجوال أو التابلت، وارفع الصوت لمستوى لطيف.',
    ],
  },
  {
    title: 'أثناء الجلسة',
    items: [
      'ابدأ بالمهارة التي اختارها الطفل إن أمكن — الاختيار يزيد الدافعية.',
      'استخدم 🌿 «وقت هادئ» إذا لاحظت انزعاجاً أو تعباً.',
      'لا تُصرّ على إكمال كل المراحل؛ يمكن إيقاف الرحلة في أي لحظة والعودة إليها.',
    ],
  },
  {
    title: 'بعد الجلسة',
    items: [
      'أضف المهارة إلى ⭐ «مهاراتي» لتعود إليها بسهولة.',
      'إن كانت المهارة واقعية، كرّر الخطوة نفسها في البيت أو المركز.',
      'احتفل بمحاولة الطفل، لا بنتيجته.',
    ],
  },
];

export default function GuidePage() {
  const categories = categoriesWithCounts();
  const supervised = supervisedSkills.length;
  const sensitive = safetySensitiveSkills.length;

  return (
    <div className="space-y-8">
      <header className="rounded-xl3 bg-paper-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-4xl font-bold text-ink">
          <span aria-hidden className="me-3">📘</span>
          دليل الاستخدام للأسرة والأخصائي
        </h1>
        <p className="mt-3 max-w-3xl text-child-base text-ink-soft">
          هذا الدليل موجَّه إلى الشخص البالغ الذي يرافق الطفل. الموقع يفترض وجودك مع الطفل،
          ولا يُقصد به استخدام الطفل له وحده.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <PrintButton label="اطبع هذا الدليل" />
          <Link
            href="/skills"
            className="flex min-h-touch items-center gap-2 rounded-xl2 bg-white px-5 text-child-base font-semibold text-ink shadow-soft transition hover:bg-sky-50"
          >
            <span aria-hidden>🗂️</span> كل المهارات
          </Link>
          <Link
            href="/board"
            className="flex min-h-touch items-center gap-2 rounded-xl2 bg-white px-5 text-child-base font-semibold text-ink shadow-soft transition hover:bg-sky-50"
          >
            <span aria-hidden>🗣️</span> لوحة التواصل
          </Link>
        </div>
      </header>

      <section aria-labelledby="what-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="what-title" className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>🧭</span> ما هذا الموقع؟ وما ليس؟
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl2 bg-mint-50 p-4">
            <p className="font-semibold text-mint-700">هو</p>
            <ul className="mt-2 space-y-1 text-child-sm text-ink-soft">
              <li>• محتوى تعليمي وتدريبي يُستخدم تحت إشراف الأسرة أو الأخصائي.</li>
              <li>• بطاقة تدريب لكل بند من بنود الاستمارة الأصلية: {allSkills.length} بطاقة.</li>
              <li>• أنشطة تفاعلية وأصوات عربية وقصص مصوّرة وأنشطة واقعية موجّهة.</li>
              <li>• مرجع بصري وأدوات يمكن تكرارها في البيت أو المركز.</li>
            </ul>
          </div>
          <div className="rounded-xl2 bg-sun-50 p-4">
            <p className="font-semibold text-sun-700">وليس</p>
            <ul className="mt-2 space-y-1 text-child-sm text-ink-soft">
              <li>• ليس أداة تشخيص، ولا اختباراً نفسياً، ولا تقييماً طبياً.</li>
              <li>• ليس علاجاً طبياً ولا بديلاً عن الخطة التربوية الفردية.</li>
              <li>• لا درجات، ولا نسب نجاح، ولا مقارنة بين الأطفال، ولا تقارير.</li>
              <li>• لا يجمع بيانات الطفل ولا يرسلها إلى أي جهة.</li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="journey-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="journey-title" className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>🌱</span> رحلة المهارة: خمسة أزرار
        </h2>
        <p className="mt-2 text-child-sm text-ink-soft">
          كل بطاقة مهارة فيها خمس مراحل. لا يُشترط الترتيب، ولا يُشترط إكمالها كلها في جلسة واحدة.
        </p>
        <ol className="mt-4 space-y-3">
          {JOURNEY.map((step, i) => (
            <li key={step.title} className="flex gap-4 rounded-xl2 bg-white p-4 shadow-soft">
              <span aria-hidden className="text-3xl">{step.icon}</span>
              <div>
                <p className="font-display text-child-base font-bold text-ink">
                  {i + 1}. {step.title}
                </p>
                <p className="mt-1 text-child-sm text-ink-soft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="session-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="session-title" className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>⏱️</span> جلسة قصيرة ناجحة
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {SESSION.map((block) => (
            <div key={block.title} className="rounded-xl2 bg-white p-4 shadow-soft">
              <p className="font-semibold text-ink">{block.title}</p>
              <ul className="mt-2 space-y-1 text-child-sm text-ink-soft">
                {block.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl2 bg-sky-50 p-4 text-child-sm text-ink-soft">
          <strong className="font-semibold">قاعدة ذهبية:</strong> الجلسة القصيرة المتكرّرة أفضل من جلسة طويلة متعبة.
          التوقف قبل الإرهاق يجعل الطفل يعود غداً بحماس.
        </p>
      </section>

      <section aria-labelledby="tools-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="tools-title" className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>🎛️</span> المؤثرات وأدوات التحكم
        </h2>
        <ul className="mt-3 space-y-2 text-child-sm text-ink-soft">
          <li>
            • <strong>🌿 وقت هادئ:</strong> يوقف الموسيقى ويخفّف المؤثرات ويُبطئ الحركة، مع مؤقّت اختياري (١ أو ٢ أو ٥ دقائق).
          </li>
          <li>
            • <strong>إعدادات الصوت:</strong> تشغيل/إيقاف، وسرعة النطق (بطيء أو عادي)، مع احترام إعداد تقليل الحركة في الجهاز.
          </li>
          <li>
            • <strong>⏸️ استراحة:</strong> شاشة هادئة تُطمئن الطفل وتُتيح له الاستعداد للمتابعة.
          </li>
          <li>• لا موسيقى صاخبة، ولا أضواء وامضة، ولا أصوات مفاجئة، ولا تشغيل تلقائي في أي نشاط.</li>
        </ul>
      </section>

      <section aria-labelledby="safety-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="safety-title" className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>⚠️</span> السلامة والإشراف
        </h2>
        <ul className="mt-3 space-y-2 text-child-sm text-ink-soft">
          <li>• {supervised} مهارة تظهر عليها ملاحظة أنها تحتاج وجود شخص بالغ.</li>
          <li>
            • {sensitive} مهارة حساسة للسلامة (مثل السكين والمقص والكهرباء وعبور الشارع) تحمل وسم{' '}
            <strong>⚠️ بإشراف مباشر</strong>.
          </li>
          <li>• المواقف الخطرة (مثل عبور الشارع والتعامل مع الأدوات) تُقدَّم في الموقع كمحاكاة أو ترتيب خطوات، لا كتعليمات للتنفيذ الفردي.</li>
          <li>• إن كان الطفل لا يستطيع أداء خطوة واقعية، فالمحاكاة والتكرار بصرياً هدفٌ بحد ذاته.</li>
        </ul>
      </section>

      <section aria-labelledby="board-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="board-title" className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>🗣️</span> لوحة التواصل بالصور
        </h2>
        <p className="mt-2 text-child-sm text-ink-soft">
          تضم اللوحة {ALL_BOARD_CARDS.length} بطاقة في {BOARD_GROUPS.length} مجموعات (أحتاج، أشعر، لا أريد، أشخاص، أماكن، أفعل، آداب وكلمات لطيفة).
          النقر على البطاقة ينطق العبارة بصوت واضح.
        </p>
        <ul className="mt-3 space-y-2 text-child-sm text-ink-soft">
          <li>• اللوحة أداة تعليمية للتعبير بالصور، وليست بديلاً عن نظام التواصل المعزّز والبديل المعتمد للطفل.</li>
          <li>• ليست تشخيصاً لقدرات الكلام، ولا يُطلب من الطفل النطق إجباراً.</li>
          <li>• احترم طريقة التواصل التي اختارها الطفل، سواء بالكلمة أو بالصورة أو بالإشارة.</li>
        </ul>
      </section>

      <section aria-labelledby="mine-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="mine-title" className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>⭐</span> «مهاراتي» والخصوصية
        </h2>
        <ul className="mt-3 space-y-2 text-child-sm text-ink-soft">
          <li>• زر ♡ «أضف إلى مهاراتي» يحفظ المهارة في جهازك فقط، لتجدها في صفحة ⭐ «مهاراتي».</li>
          <li>• لا حساب ولا تسجيل ولا بريد ولا اسم طفل، ولا تُرسل أي بيانات إلى أي سيرفر.</li>
          <li>• يمكنك حذف كل التفضيلات والتاريخ المحلي بنقرة واحدة من صفحة «مهاراتي».</li>
          <li>• لا يوجد تتبّع ولا إعلانات، ولا عملة رقمية، ولا أي اتصال بالطفل إلكترونياً.</li>
        </ul>
      </section>

      <section aria-labelledby="find-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="find-title" className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>🔎</span> كيف أجد المهارة المناسبة؟
        </h2>
        <ul className="mt-3 space-y-2 text-child-sm text-ink-soft">
          <li>• من العوالم الأربعة: {DOMAINS.map((d) => d.childTitle).join(' • ')}.</li>
          <li>• من الأقسام السبعة عشر ({categories.length} قسماً) داخل كل محور.</li>
          <li>• من البحث العربي في الأعلى، ويبحث في نص البند الأصلي والعنوان المبسّط والكلمات المفتاحية.</li>
          <li>• من صفحة «كل المهارات» مع فلاتر المحور والقسم ونوع النشاط.</li>
        </ul>
      </section>

      <section aria-labelledby="wrong-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="wrong-title" className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>💛</span> ماذا يحدث عند إجابة غير دقيقة؟
        </h2>
        <ul className="mt-3 space-y-2 text-child-sm text-ink-soft">
          <li>• تظهر رسالة «حاول مرة أخرى» بلطف، ثم يظهر تلميح بصري هادئ يوجّه الطفل.</li>
          <li>• لا صوت خطأ حاد، ولا إشارة حمراء قوية، ولا اهتزاز، ولا عبارات لوم عموماً.</li>
          <li>• عند النجاح: ⭐ وتشجيع كلامي هادئ، بلا صراخ ولا موسيقى احتفالية ولا إفراط في المؤثرات.</li>
          <li>• المحاولة الخطأ جزء من التدريب، والتكرار هو الطريق إلى الإتقان.</li>
        </ul>
      </section>

      <section aria-labelledby="offline-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="offline-title" className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>📶</span> بدون إنترنت، وعلى أجهزة أخرى
        </h2>
        <ul className="mt-3 space-y-2 text-child-sm text-ink-soft">
          <li>• يمكن تثبيت الموقع على الشاشة الرئيسية للجوال أو التابلت، ويفتح بعد ذلك كتطبيق.</li>
          <li>• الجمل الصوتية الأساسية تُحمَّل مسبقاً، ويعمل الموقع مع اتصال ضعيف.</li>
          <li>• يمكن فتح الموقع على أكثر من جهاز؛ كل جهاز يحفظ تفضيلاته الخاصة به.</li>
        </ul>
      </section>

      <section aria-labelledby="print-title" className="no-print rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="print-title" className="font-display text-child-lg font-bold text-ink">
          <span aria-hidden>🖨️</span> للاستخدام بعيداً عن الشاشة
        </h2>
        <p className="mt-2 text-child-sm text-ink-soft">
          يمكنك طباعة هذا الدليل ليبقى في المركز أو البيت، وطباعة بطاقة أي مهارة من صفحتها
          (زر «اطبع البطاقة») لتُستخدم كوسيلة تدريب ورقية.
        </p>
        <div className="mt-4">
          <PrintButton label="اطبع هذا الدليل" />
        </div>
      </section>

      <p className="rounded-xl2 bg-sun-50 p-4 text-child-sm text-ink-soft">
        {siteConfig.disclaimer} يُنصح بمراجعة الأخصائي المسؤول عن الطفل عند اختيار المهارات
        المناسبة لمرحلته، خصوصاً المهارات الحساسة للسلامة.
      </p>
    </div>
  );
}
