import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allSkills, skillById } from '@/data/skills';
import { categoryById, domainById } from '@/data/taxonomy';
import { PICTOGRAMS } from '@/components/illustrations/Pictograms';
import { PrintButton } from '@/components/print/PrintButton';
import { siteConfig } from '@/config/site.config';
import { REAL_PHOTOS, photoCreditText, photoCreditFull } from '@/data/photos';

export function generateStaticParams() {
  return allSkills.map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const skill = skillById[params.id];
  if (!skill) return { title: `بطاقة نشاط — ${siteConfig.name}` };
  return { title: `بطاقة نشاط: ${skill.childFriendlyTitle} — ${siteConfig.name}` };
}

/** رسم أيقونة المهارة من مكتبة الرسوم الأصلية (بدون أي جافاسكربت) */
function IconArt({ skill }: { skill: NonNullable<(typeof allSkills)[number]> }) {
  if (skill.icon.kind === 'letter') {
    return (
      <span className="font-display text-6xl font-bold text-sky-700" aria-hidden>
        {skill.icon.value}
      </span>
    );
  }
  if (skill.icon.kind === 'image') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={skill.icon.value} alt="" className="h-20 w-20 object-contain" />;
  }
  const art = PICTOGRAMS[skill.icon.value];
  return (
    <span className="inline-block h-20 w-20 align-middle" aria-hidden>
      {art ?? <span className="text-5xl">{skill.icon.value}</span>}
    </span>
  );
}

const DEFAULT_STEPS = [
  'اقرأ العنوان والتعليمات بصوت هادئ، واعرض الرسمة على الطفل.',
  'اسأل سؤالاً واحداً فقط، وانتظر بلا استعجال — الوقت ليس مهماً.',
  'العب النشاط الرقمي في الموقع معه على الجهاز أو التابلت.',
  'نفّذا الخطوة نفسها في الواقع (في البيت أو المركز) بمساعدتك.',
  'كرّرا المحاولة كلّما أحبّ الطفل، وتوقفا عندما يتعب — بلا ضغط.',
];

export default function ActivityCardPage({ params }: { params: { id: string } }) {
  const skill = skillById[params.id];
  if (!skill) notFound();

  const photo = skill.icon.kind === 'emoji' ? REAL_PHOTOS[skill.icon.value] : undefined;
  const domain = domainById[skill.domain];
  const category = categoryById[skill.category];
  const supervised = skill.activities.find((a) => a.type === 'supervised');
  const steps = supervised && supervised.type === 'supervised' ? supervised.steps : DEFAULT_STEPS;
  const tools = supervised && supervised.type === 'supervised' ? supervised.tools : [];
  const safety =
    (supervised && supervised.type === 'supervised' ? supervised.safetyNote : undefined) ??
    skill.safetyNote ??
    (skill.safetyLevel === 'safety-sensitive'
      ? '⚠️ حساسة للسلامة: تُنفَّذ بإشراف مباشر من شخص بالغ، ولا تُترك للطفل منفرداً.'
      : undefined);
  const adult =
    (supervised && supervised.type === 'supervised' ? supervised.adultNote : undefined) ?? skill.supervisorNote;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* شريط أعلى الصفحة — لا يُطبع */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href={`/skill/${skill.id}`} className="min-h-touch rounded-xl2 bg-paper-card px-5 py-3 text-child-sm font-semibold text-ink shadow-soft">
          ← رجوع إلى صفحة المهارة
        </Link>
        <PrintButton />
      </div>

      <article className="card-sheet space-y-5 rounded-xl3 border border-paper-line bg-white p-6 shadow-soft">
        <header className="flex items-start gap-4 border-b border-paper-line pb-4">
          <IconArt skill={skill} />
          <div className="space-y-1">
            <p className="text-child-sm font-semibold text-ink-mute">
              {siteConfig.name} — بطاقة نشاط للطباعة 🖨️
            </p>
            <h1 className="font-display text-child-xl font-bold text-ink">{skill.childFriendlyTitle}</h1>
            <p className="text-child-sm text-ink-soft">
              {domain?.childTitle} › {category?.childTitle}
            </p>
            <p className="flex flex-wrap gap-2 pt-1 text-child-sm">
              <span className="rounded-xl2 bg-sky-50 px-3 py-1 font-semibold text-sky-800">
                {skill.safetyLevel === 'digital' && 'نشاط رقمي داخل الموقع'}
                {skill.safetyLevel === 'supervised' && 'يُنفَّذ مع شخص بالغ'}
                {skill.safetyLevel === 'safety-sensitive' && 'إشراف مباشر إلزامي'}
              </span>
              {skill.supervisorRequired && (
                <span className="rounded-xl2 bg-grape-50 px-3 py-1 font-semibold text-grape-700">
                  يحتاج مرافقة المشرف
                </span>
              )}
            </p>
          </div>
        </header>

        <section className="card-block space-y-2 rounded-xl2 bg-sky-50 p-4">
          <h2 className="font-display text-child-lg font-bold text-ink">ماذا نتدرب اليوم؟</h2>
          <p className="text-child-base leading-relaxed text-ink">{skill.childFriendlyInstruction}</p>
          <p className="text-child-sm leading-relaxed text-ink-soft">{skill.description}</p>
        </section>

        {photo && (
          <section className="card-block flex items-center gap-4 rounded-xl2 bg-paper-card p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={photo.alt} className="h-32 w-32 shrink-0 rounded-xl2 bg-white object-contain" />
            <div className="text-child-sm text-ink-soft">
              <h2 className="font-display text-child-base font-bold text-ink">
                <span aria-hidden>👀 </span>
                كيف تبدو في الواقع؟
              </h2>
              <p className="mt-1">{photo.alt} — اعرضها على الطفل بجانب الشيء الحقيقي.</p>
              <p className="mt-1 text-xs text-ink-mute">{photoCreditText(photo)}</p>
              <details className="mt-1 text-xs text-ink-mute">
                <summary className="cursor-pointer">تفاصيل المصدر والاعتماد (للكبار)</summary>
                <p className="mt-1">{photoCreditFull(photo)}</p>
              </details>
            </div>
          </section>
        )}

        <section className="card-block space-y-2">
          <h2 className="font-display text-child-lg font-bold text-ink">خطوات النشاط (واحدة واحدة)</h2>
          <ol className="space-y-2 text-child-base leading-relaxed text-ink">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span
                  className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint-100 text-child-sm font-bold text-mint-700"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="card-block space-y-2">
          <h2 className="font-display text-child-lg font-bold text-ink">الأدوات التي نحتاجها</h2>
          {tools.length > 0 ? (
            <ul className="flex flex-wrap gap-2 text-child-sm">
              {tools.map((tool) => (
                <li key={tool} className="rounded-xl2 bg-paper-card px-3 py-2 font-semibold text-ink shadow-soft">
                  {tool}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-child-base text-ink-soft">
              لا نحتاج أدوات خاصة — فقط جهاز فيه الموقع، ويد المساعدة.
            </p>
          )}
        </section>

        <section className="card-block space-y-2 rounded-xl2 border border-sun-300 bg-sun-50 p-4">
          <h2 className="font-display text-child-lg font-bold text-sun-700">السلامة أولاً</h2>
          <p className="text-child-base font-semibold leading-relaxed text-sun-700">
            {safety ??
              'النشاط هادئ ولا يحتاج أدوات خطرة. ابقَ قريباً من الطفل، وشاركه الخطوات بحب.'}
          </p>
          {adult && <p className="text-child-sm leading-relaxed text-ink">{adult}</p>}
        </section>

        <section className="card-block space-y-2 rounded-xl2 bg-paper-card p-4">
          <h2 className="font-display text-child-lg font-bold text-ink">تدربنا معاً ✓</h2>
          <p className="text-child-base text-ink-soft">
            ضع علامة على المربعات كل مرة يتدرب فيها الطفل — بلا درجات وبلا مقارنة.
          </p>
          <div className="flex flex-wrap gap-3 pt-1" aria-hidden>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="inline-flex h-9 w-9 items-center justify-center rounded-xl2 border-2 border-paper-line bg-white" />
            ))}
          </div>
          <p className="pt-1 text-child-sm text-ink-soft">التاريخ: ............................</p>
        </section>

        <section className="card-block space-y-2 border-t border-paper-line pt-4">
          <h2 className="font-display text-child-base font-bold text-ink">للمشرف (الأهل أو الأخصائي)</h2>
          <dl className="grid gap-2 text-child-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-ink">رقم البند في الاستمارة</dt>
              <dd className="text-ink-soft">{skill.sourceItemNumber}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">صفحة المصدر</dt>
              <dd className="text-ink-soft">{skill.sourcePage}</dd>
            </div>
          </dl>
          <p className="text-child-sm font-semibold text-ink">النص الأصلي من الاستمارة (غير معدَّل)</p>
          <p className="text-child-sm leading-relaxed text-ink-soft" dir="rtl">
            «{skill.originalText}»
          </p>
          {skill.needsReview && (
            <p className="rounded-xl2 border border-peach-300 bg-peach-50 p-3 text-child-sm text-peach-600">
              ملاحظة توثيقية: {skill.needsReviewNote}
            </p>
          )}
          <p className="text-xs text-ink-mute">
            للعثور عليها في الموقع: افتح «كل المهارات» وابحث بعنوان المهارة أعلاه. محتوى تعليمي وتدريبي، وليس أداة تشخيص أو علاجاً طبياً.
          </p>
        </section>
      </article>

      <p className="no-print pb-6 text-center text-child-sm text-ink-mute">
        نصيحة: اطبع البطاقة وضعها قرب مكان النشاط، ودوّن عليها بخط اليد ما لاحظته من فرح الطفل 🌱
      </p>
    </div>
  );
}
