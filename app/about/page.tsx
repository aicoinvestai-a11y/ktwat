import Link from 'next/link';
import { siteConfig } from '@/config/site.config';
import { allPhotos, PHOTO_NOTE, PHOTO_RETRIEVED } from '@/data/photos';
import { allSkills, supervisedSkills, safetySensitiveSkills, needsReviewSkills } from '@/data/skills';
import licenses from '@/data/audio-licenses.json';
import { licenseArabic } from '@/lib/licenses';

export const metadata = { title: 'عن الموقع والمصادر — خطوتي' };

export default function AboutPage() {
  const env = licenses.environmentSounds;

  return (
    <div className="space-y-8">
      <header className="rounded-xl3 bg-paper-card p-6 shadow-soft md:p-8">
        <h1 className="font-display text-4xl font-bold text-ink">
          <span aria-hidden className="me-3">
            ℹ️
          </span>
          عن الموقع والمصادر
        </h1>
        <p className="mt-3 max-w-3xl text-child-base text-ink-soft">{siteConfig.disclaimer}</p>
        <Link
          href="/guide"
          className="mt-4 inline-flex min-h-touch items-center gap-2 rounded-xl2 bg-white px-5 text-child-sm font-semibold text-sky-700 shadow-soft transition hover:bg-sky-50"
        >
          <span aria-hidden>📘</span> دليل الاستخدام للأسرة والأخصائي
        </Link>
      </header>

      <section aria-labelledby="privacy-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="privacy-title" className="font-display text-child-lg font-bold text-ink">
          🔒 الخصوصية
        </h2>
        <ul className="mt-3 space-y-2 text-child-sm text-ink-soft">
          <li>• لا تسجيل، ولا حساب، ولا كلمة مرور، ولا بريد إلكتروني، ولا رقم هاتف.</li>
          <li>• لا نطلب اسم الطفل ولا اسم ولي الأمر، ولا أي بيانات صحية.</li>
          <li>• لا أدوات تحليل ولا تتبّع ولا إعلانات، ولا يُرسل أي شيء إلى أي سيرفر.</li>
          <li>• لا كاميرا، ولا ميكروفون، ولا موقع جغرافي (مُعطَّلة على مستوى المتصفح).</li>
          <li>• التفضيلات (المفضلة، الصوت، الوضع الهادئ، الأنشطة المُزارة) تُخزَّن في متصفح جهازك فقط، ويمكنك حذفها كاملة من صفحة «مهاراتي».</li>
        </ul>
      </section>

      <section aria-labelledby="a11y-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="a11y-title" className="font-display text-child-lg font-bold text-ink">
          ♿ إمكانية الوصول
        </h2>
        <p className="mt-3 text-child-sm text-ink-soft">{siteConfig.a11yStatement}</p>
        <ul className="mt-3 space-y-2 text-child-sm text-ink-soft">
          <li>• دعم كامل للكتابة من اليمين إلى اليسار، وخطوط عربية مكبّرة، وتباين عالٍ.</li>
          <li>• تنقّل كامل بلوحة المفاتيح مع مؤشر تركيز واضح (4 بكسل).</li>
          <li>• أهداف لمس كبيرة (لا تقل عن 52 بكسل) تناسب الموبايل والتابلت.</li>
          <li>• لا اعتماد على اللون وحده، ولا وميض، ولا تشغيل صوتي تلقائي.</li>
          <li>• الوضع الهادئ 🌿 وزر «وقت هادئ»، واحترام تفضيل تقليل الحركة في النظام.</li>
          <li>• كل زر صوتي يحمل نصاً بديلاً واضحاً لقارئات الشاشة، وكل صورة لها وصف نصي.</li>
        </ul>
      </section>

      <section aria-labelledby="source-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="source-title" className="font-display text-child-lg font-bold text-ink">
          📚 المصدر التعليمي
        </h2>
        <p className="mt-3 text-child-sm text-ink-soft">
          محتوى الموقع مبني على «{siteConfig.sourceDocument.title}» ({siteConfig.sourceDocument.pages} صفحة) —{' '}
          {siteConfig.sourceDocument.owner}. إعداد وتنفيذ: {siteConfig.sourceDocument.preparedBy}.
        </p>
        <p className="mt-3 text-child-sm text-ink-soft">
          كل بند في الاستمارة له بطاقة مهارة تحفظ نصه الأصلي حرفياً دون أي تعديل، مع
          النص المبسّط للطفل بشكل منفصل. عدد البنود المحوّلة إلى أنشطة: <strong>{allSkills.length}</strong>.
        </p>
        <ul className="mt-3 space-y-2 text-child-sm text-ink-soft">
          <li>• بنود تحتاج إشراف شخص بالغ: {supervisedSkills.length}</li>
          <li>• بنود حساسة للسلامة (تُعلَّم بوسم ⚠️): {safetySensitiveSkills.length}</li>
          <li>• بنود وُسمت لمراجعة نصية بسبب غموض في المصدر: {needsReviewSkills.length} — ولم يُحذف أي منها.</li>
        </ul>
        <p className="mt-3 text-sm text-ink-mute">
          ملاحظة النشر: يُراجَع النص الأصلي لكل بند مقابل الاستمارة المطبوعة قبل الإطلاق العام، وتُثبَّت أي ملاحظة في
          ملاحظة المراجعة الخاصة به، مع إبقاء البند ظاهراً في الموقع.
        </p>
      </section>

      <section aria-labelledby="audio-title" className="rounded-xl2 bg-paper-card p-6 shadow-soft">
        <h2 id="audio-title" className="font-display text-child-lg font-bold text-ink">
          🔊 الأصوات وتراخيصها
        </h2>
        <p className="mt-3 text-child-sm text-ink-soft">
          أصوات البيئة في هذا الموقع ملفات حقيقية من مكتبة ويكيميديا كومنز بتراخيص حرّة، والتراخيص الكاملة محفوظة مع ملفات المشروع.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-start text-sm">
            <caption className="sr-only">تراخيص أصوات البيئة</caption>
            <thead>
              <tr className="text-ink">
                <th scope="col" className="p-2 text-start">الصوت</th>
                <th scope="col" className="p-2 text-start">المؤلف</th>
                <th scope="col" className="p-2 text-start">الترخيص</th>
              </tr>
            </thead>
            <tbody>
              {env.map((s) => (
                <tr key={s.key} className="border-t border-paper-line">
                  <td className="p-2">{s.label}</td>
                  <td className="p-2 text-ink-soft">
                    <details>
                      <summary className="cursor-pointer">تفاصيل المصدر (للكبار)</summary>
                      <p className="mt-1 text-xs">
                        {s.author} — {s.license}
                      </p>
                    </details>
                  </td>
                  <td className="p-2 text-ink-soft">
                    <a href={s.sourceUrl} className="underline" rel="noreferrer noopener" target="_blank">
                      {licenseArabic(s.license)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8">
          <h3 className="font-display text-child-base font-bold text-ink">🖼️ الصور الحقيقية وتراخيصها</h3>
          <p className="mt-2 text-child-sm text-ink-soft">
            {PHOTO_NOTE} عددها {allPhotos.length} صورة، بتاريخ {PHOTO_RETRIEVED}. لا توجد أي صورة لأشخاص، ولا صور
            تُنتج انطباعاً مزعجاً. وتُعرض هذه الصور في مرحلة «جرّب مع المشرف» ليرى الطفل الشيء كما هو في الواقع.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allPhotos.map((photo) => (
              <li key={photo.key} className="flex gap-3 rounded-xl2 border border-paper-line bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-20 w-20 shrink-0 rounded-xl2 bg-white object-contain"
                />
                <div className="text-xs text-ink-soft">
                  <p className="font-semibold text-ink">{photo.alt}</p>
                  <p className="mt-1">
                    <a href={photo.sourceUrl} className="underline" rel="noreferrer noopener" target="_blank">
                      {licenseArabic(photo.license)}
                    </a>
                  </p>
                  <details className="mt-1">
                    <summary className="cursor-pointer">تفاصيل الاعتماد (للكبار)</summary>
                    <p className="mt-1">{photo.credit}</p>
                  </details>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-xl2 bg-sun-50 p-4 text-sm text-sun-700">
          <p className="font-bold">القرآن الكريم</p>
          <p className="mt-1">
            التلاوات: {licenses.quranRecitations.reciter} — {licenses.quranRecitations.source}. النص:{' '}
            {licenses.quranRecitations.scriptSource}. حالة المراجعة: {licenses.quranRecitations.reviewNote}
          </p>
        </div>
      </section>

      <section aria-labelledby="howto-title" className="rounded-xl2 bg-mint-50 p-6">
        <h2 id="howto-title" className="font-display text-child-lg font-bold text-mint-700">
          👨‍👩‍👧 كيف نستخدم الموقع؟
        </h2>
        <ol className="mt-3 space-y-2 text-child-sm text-ink-soft">
          <li>1. اختر عالماً من العوالم الأربعة، ثم مهارة واحدة فقط في الجلسة.</li>
          <li>2. امشِ مع الطفل في المراحل: 👀 شاهد، 🔊 استمع، 💡 تعلّم، 🎮 العب، 👨‍👩‍👧 جرّب مع المشرف — ويمكن القفز بينها.</li>
          <li>3. في الأنشطة الموسومة ⚠️ أو 👨‍👩‍👧 ابقَ مع الطفل: النشاط الحقيقي بأدوات حقيقية يحتاج إشرافاً مباشراً.</li>
          <li>4. لا يوجد تقييم ولا درجات: «تدربنا على هذا النشاط ✓» اختياري لمتابعتكم فقط.</li>
          <li>5. إن جاءت إجابة غير صحيحة، الموقع يقول «حاول مرة أخرى» ثم يقدّم تلميحاً بصرياً هادئاً — بلا أصوات خطأ ولا علامات حمراء.</li>
        </ol>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/skills" className="inline-flex min-h-touch items-center rounded-xl2 bg-white px-6 text-child-base font-bold text-mint-700 shadow-soft">
            كل المهارات
          </Link>
          <Link href="/my-skills" className="inline-flex min-h-touch items-center rounded-xl2 bg-white px-6 text-child-base font-bold text-mint-700 shadow-soft">
            ⭐ مهاراتي
          </Link>
        </div>
      </section>

      <p className="text-center text-sm text-ink-mute">
        خطوتي — {siteConfig.slogan} • لا يوجد أي تتبّع في هذا الموقع، وتعمل الأنشطة الأساسية بعد أول تحميل حتى مع اتصال
        ضعيف.
      </p>
    </div>
  );
}
