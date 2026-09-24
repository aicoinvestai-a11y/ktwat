# النشر على GitHub — خطوتي 🚀

**المستودع:** <https://github.com/aicoinvestai-a11y/ktwat> — **عام** • الفرع الافتراضي: `main`

## حالة النشر (مؤكَّدة)

| البند | القيمة |
| --- | --- |
| عدد الملفات | **١٢٤٥** ملفاً |
| الحجم على GitHub | **٦٣٫٢ م.ب** |
| آخر إيداع | `18c4c79` — «توثيق: رابط المستودع في package.json وREADME» |
| الإيداع الأول | `9c52d60` — «موقع «خطوتي» 🌱 — نسخة كاملة جاهزة للتشغيل» |
| تطابق الفرع | نسخة GitHub `main` = نسخة المشروع المحلية ✓ |

**المستثنى من الرفع:** `node_modules` و`.next` و`tsconfig.tsbuildinfo` (تُبنى عند التشغيل) — بحسب `.gitignore`.
**المشمول:** الكود والبيانات والملفات الصوتية (٨٠٩ في `public/audio/voice`) والتلاوات (١٨) والصور والخطوط والوثائق (`docs/` وتشمل ورقة المراجعة وتقارير التغطية والوصول).

## تشغيل المستودع على أي جهاز

```bash
git clone https://github.com/aicoinvestai-a11y/ktwat.git
cd ktwat
npm ci && npm run build && npm run start   # ثم افتح http://localhost:3000
```

فحوص ما قبل النشر (بعد التشغيل):
```bash
npm run verify      # المحتوى + الصوت + التراخيص
npm run coverage    # تقرير التغطية (٢٤٥/٢٤٥)
npm run a11y        # تدقيق وصول آلي على كل الصفحات (يتطلب خادماً يعمل)
```

## لإجراء رفع جديد لاحقاً

```bash
cd khatwati
git config user.name "فريق خطوتي"
git config user.email "khatwati@users.noreply.github.com"
git remote add origin https://github.com/aicoinvestai-a11y/ktwat.git
git add -A && git commit -m "وصف التغيير"
git push origin main        # سيطلب اسم المستخدم والرمز (الرمز ككلمة مرور)
```

> **ملاحظة فنية:** إعدادات git المحلية (اسم المستخدم والـremote) لا تُحفظ بين جلسات الساندبوكس، لذلك تُعاد كتابتها كل جلسة — أما المستودع المرفوع فلا يتأثّر بذلك إطلاقاً.

## أمان الرموز

- رمز الوصول يُستخدم في أمر الرفع فقط، ولا يُكتب في أي ملف داخل المشروع ولا في إعدادات git.
- **بعد كل عملية رفع: أبطِل الرمز** من <https://github.com/settings/personal-access-tokens> (Revoke).
- الأفضل استخدام رمز مُخصَّص لمستودع `ktwat` وحده بصلاحية `Contents: Read and write` وتاريخ انتهاء قصير.
