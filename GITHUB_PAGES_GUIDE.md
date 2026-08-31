# دليل استضافة الموقع على GitHub Pages (خطوة بخطوة بالتفصيل الكامل)
## منصة الجودة للفارمسي أكاديمي (Al-Jawda Pharmacy Academy)

> **GitHub Pages** هي خدمة استضافة **مجانية 100%** للمواقع الثابتة (Static Sites) مباشرة من مستودع GitHub، مع شهادة **HTTPS مجانية** وشبكة توزيع محتوى (CDN) عالمية. بما أن مشروعنا (HTML/CSS/JS + Firebase Auth/Firestore عبر SDK من طرف العميل) هو موقع ثابت بالكامل، فهو **متوافق تماماً** مع GitHub Pages — Firebase تبقى تعمل بنفس الطريقة لأن كل استدعاءاتها تتم من داخل المتصفح.<cite>turn6search11</cite><cite>turn6search8</cite>

### 🆚 GitHub Pages مقابل Firebase Hosting — أيهما تختار؟

| المعيار | GitHub Pages | Firebase Hosting |
|---|---|---|
| التكلفة | مجاني بالكامل دائماً | مجاني ضمن حدود Spark Plan |
| السرعة/CDN | شبكة GitHub العالمية | شبكة Google العالمية (أسرع غالباً) |
| ربط Firestore/Auth | يعمل تماماً (client-side SDK) | يعمل تماماً (نفس الطريقة) |
| النطاق المخصص (Custom Domain) | مدعوم مجاناً مع HTTPS | مدعوم مجاناً مع HTTPS |
| النشر التلقائي من GitHub | مدمج أصلاً (GitHub Actions) | يحتاج ربط إضافي |
| الأنسب لـ | مواقع ثابتة بسيطة مثل مشروعنا | مشاريع تستخدم أيضاً Cloud Functions |

💡 **يمكنك استخدام الاثنين معاً بدون تعارض** — كلاهما يقرأ من نفس مستودع GitHub وكلاهما يتصل بنفس مشروع Firebase (Auth + Firestore)، فقط الرابط النهائي يختلف.

---

## 📋 قبل البدء: المتطلبات

| المتطلب | التحقق |
|---|---|
| حساب GitHub | https://github.com/signup |
| مستودع يحتوي ملفات موقعك | تم إنشاؤه مسبقاً في الجزء الثامن من دليل Firebase (`jpa-academy`) |
| Git مثبّت محلياً | `git --version` |
| ملفات الموقع الثابتة جاهزة | مجلد `public/` بداخل مشروع `pharmacademy` |

---

## 🗂️ الجزء الأول: فهم بنية GitHub Pages قبل التنفيذ

### الخطوة 1.1: نوعا مواقع GitHub Pages
هناك نوعان أساسيان يجب أن تفهم الفرق بينهما قبل البدء:<cite>turn6search8</cite><cite>turn6search11</cite>

**النوع الأول — موقع المستخدم (User Site):**
- اسم المستودع يجب أن يكون **بالضبط**: `hassanzawia.github.io` (حيث `hassanzawia` هو اسم مستخدمك الفعلي على GitHub)
- الرابط النهائي: `https://hassanzawia.github.io/` (بدون أي اسم مشروع في النهاية)
- مستودع واحد فقط من هذا النوع مسموح لكل حساب

**النوع الثاني — موقع مشروع (Project Site):**
- اسم المستودع يكون أي اسم تختاره، مثلاً `jpa-academy`
- الرابط النهائي: `https://hassanzawia.github.io/jpa-academy/` (مع اسم المشروع في النهاية)
- يمكنك إنشاء عدد غير محدود من هذه المواقع

**التوصية لمشروعك:** استخدم **موقع مشروع (Project Site)** باسم `jpa-academy` لأنك على الأرجح تريد استضافة أكثر من مشروع مستقبلاً على نفس حسابك.

### الخطوة 1.2: بنية الملفات المطلوبة
GitHub Pages يبحث عن ملف `index.html` في **جذر** المجلد الذي تحدده كمصدر (Source). بما أن ملفاتك موجودة داخل `public/`، لدينا خياران:
- **الخيار أ (الأبسط):** نقل محتوى `public/` بالكامل إلى جذر المستودع.
- **الخيار ب (الأدق تقنياً):** إبقاء البنية كما هي واستخدام GitHub Actions لنشر مجلد `public/` تحديداً كمصدر (هذا ما سنعتمده لأنه يُبقي مشروعك منظّماً ومتوافقاً أيضاً مع Firebase Hosting في نفس الوقت).

---

## 🚀 الجزء الثاني: الطريقة الموصى بها — النشر عبر GitHub Actions

> هذه هي **الطريقة الافتراضية الحديثة** التي توصي بها GitHub نفسها للمستودعات الجديدة، لأنها تسمح بتحديد أي مجلد فرعي كمصدر (مثل `public/`) دون الحاجة لنقل الملفات.<cite>turn6search8</cite><cite>turn6search9</cite>

### الخطوة 2.1: التأكد من رفع المشروع على GitHub أولاً
إن لم تكن قد نفّذت هذا بعد (راجع الجزء الثامن من دليل Firebase):
```bash
cd ~/Desktop/pharmacademy
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/hassanzawia/jpa-academy.git
git push -u origin main
```

### الخطوة 2.2: إنشاء ملف GitHub Actions مخصص لـ GitHub Pages
هذا الملف سيبني وينشر مجلد `public/` تلقائياً في كل مرة تدفع (push) تعديلات إلى الفرع `main`. الملف جاهز مسبقاً في مشروعك على المسار:
```
pharmacademy/.github/workflows/github-pages.yml
```
(سنُنشئه في الخطوة القادمة إن لم يكن موجوداً)

### الخطوة 2.3: محتوى ملف الـ Workflow
تأكد أن الملف يحتوي بالضبط على:
```yaml
name: نشر على GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
هذا الملف موجود جاهزاً لك ضمن الحزمة المرفقة (راجع قسم "الملفات الجاهزة" أسفل الدليل).

### الخطوة 2.4: تفعيل GitHub Pages من إعدادات المستودع
1. اذهب إلى صفحة مستودعك: `https://github.com/hassanzawia/jpa-academy`
2. اضغط تبويب **"Settings"** (أعلى يمين الصفحة، بجانب Insights).
3. من القائمة الجانبية اليسرى، انزل إلى قسم **"Code and automation"** واضغط **"Pages"**.
4. تحت عنوان **"Build and deployment"**، ستجد قائمة منسدلة باسم **"Source"**.
5. **هذه هي الخطوة الأهم:** غيّر القيمة من "Deploy from a branch" إلى **"GitHub Actions"**.<cite>turn6search9</cite>
6. لن يظهر زر "Save" منفصل هنا — بمجرد اختيار "GitHub Actions" يُحفظ الإعداد فوراً.

### الخطوة 2.5: رفع ملف الـ Workflow وتشغيل أول نشر
```bash
git add .
git commit -m "Add GitHub Pages deployment workflow"
git push
```

### الخطوة 2.6: مراقبة عملية النشر
1. اذهب إلى تبويب **"Actions"** أعلى صفحة المستودع.
2. سترى تشغيلاً جديداً بعنوان "Add GitHub Pages deployment workflow" مع دائرة صفراء 🟡 متحركة تدل على أنه قيد التنفيذ.
3. اضغط عليه لمشاهدة التفاصيل الحية؛ سترى خطوتين رئيسيتين:
   - **build** (أو **deploy** حسب تسمية jobs) — تجهيز الملفات
   - **Deploy to GitHub Pages** — النشر الفعلي
4. عند اكتمال كل خطوة بنجاح تظهر علامة ✅ خضراء. تستغرق العملية عادة 30-90 ثانية.

### الخطوة 2.7: الحصول على رابط الموقع والتحقق
1. ارجع إلى **Settings → Pages**.
2. أعلى الصفحة سيظهر شريط أخضر مكتوب فيه: **"Your site is live at https://hassanzawia.github.io/jpa-academy/"** مع زر **"Visit site"**.<cite>turn6search11</cite>
3. اضغط الزر أو انسخ الرابط وافتحه في نافذة متصفح جديدة.
4. **يجب أن تشاهد** نفس الصفحة الرئيسية لمنصة الجودة للفارمسي أكاديمي التي رأيتها على رابط Firebase.
5. جرّب الانتقال إلى `/login.html` والتحقق أن تسجيل الدخول بالحسابات التجريبية يعمل (سيعمل لأن نفس مشروع Firebase مربوط في `firebase-config.js`).

> ⏱️ **ملاحظة توقيت:** أول نشر قد يستغرق حتى 10 دقائق ليظهر فعلياً حتى بعد ظهور علامة ✅ في Actions، بسبب انتشار إعدادات DNS الداخلية لـ GitHub.<cite>turn6search11</cite>

---

## 🔁 الطريقة البديلة الأبسط: النشر المباشر من فرع (Deploy from a branch)

> استخدم هذه الطريقة فقط إذا أردت تبسيطاً أكبر بدون GitHub Actions، لكنها تتطلب نقل الملفات فعلياً إلى الجذر أو استخدام مجلد `/docs`.

### الخطوة ب.1: نقل الملفات (إن أردت هذه الطريقة بدلاً من Actions)
```bash
cd ~/Desktop/pharmacademy
mkdir -p docs
cp -r public/* docs/
git add docs
git commit -m "Add docs folder for GitHub Pages"
git push
```

### الخطوة ب.2: تفعيل GitHub Pages من الإعدادات
1. **Settings → Pages**
2. تحت "Source" اختر **"Deploy from a branch"**
3. من القائمة المنسدلة الأولى (Branch) اختر: **main**
4. من القائمة المنسدلة الثانية (Folder) اختر: **/docs**
5. اضغط **Save**<cite>turn6search10</cite><cite>turn6search14</cite>

### الخطوة ب.3: التحقق
انتظر 1-2 دقيقة، ثم حدّث صفحة Settings → Pages وستشاهد رابط الموقع الأخضر كما في الطريقة الأولى.

> ⚠️ عيب هذه الطريقة: تحتاج تكرار أمر `cp -r public/* docs/` يدوياً بعد كل تعديل، وهذا سبب رئيسي لتفضيل طريقة GitHub Actions أعلاه التي تُحدّث تلقائياً.

---

## 🌍 الجزء الثالث: ربط نطاق مخصص (Custom Domain) — اختياري

إن كان لديك نطاق مسجّل مسبقاً (مثل `jpa-academy.com`) وتريد استخدامه بدلاً من رابط `github.io`:

### الخطوة 3.1: إضافة النطاق في إعدادات GitHub
1. **Settings → Pages**
2. في حقل **"Custom domain"** اكتب نطاقك، مثلاً:
   ```
   www.jpa-academy.com
   ```
3. اضغط **Save**. سيُنشئ GitHub تلقائياً ملف `CNAME` في مستودعك يحتوي هذا النطاق.<cite>turn6search13</cite>

### الخطوة 3.2: إعداد سجلات DNS لدى مزوّد النطاق
اذهب إلى لوحة تحكم DNS لدى الشركة التي اشتريت منها النطاق (Namecheap, GoDaddy, Cloudflare، إلخ) وأضف:

**للنطاق مع www (الأكثر شيوعاً):**
| النوع (Type) | الاسم (Name) | القيمة (Value) |
|---|---|---|
| CNAME | www | `hassanzawia.github.io` |

**للنطاق الجذري (Apex Domain بدون www):**
| النوع (Type) | الاسم (Name) | القيمة (Value) |
|---|---|---|
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |

هذه هي عناوين IP الرسمية الأربعة لخوادم GitHub Pages.<cite>turn6search13</cite>

### الخطوة 3.3: الانتظار وتفعيل HTTPS
1. تغييرات DNS قد تستغرق حتى **24 ساعة** للانتشار الكامل (عادة أقل بكثير، أحياناً دقائق).<cite>turn6search13</cite>
2. ارجع إلى **Settings → Pages** بعد ذلك.
3. عندما يتعرّف GitHub على النطاق بنجاح، سيظهر مربع اختيار **"Enforce HTTPS"** — فعّله لإجبار كل الزوار على الاتصال المُشفّر.<cite>turn6search15</cite>
4. قد يستغرق إصدار شهادة SSL المجانية من GitHub بضع دقائق إضافية بعد ذلك.

---

## 🔄 الجزء الرابع: كيف تُحدّث الموقع لاحقاً

بما أنك تستخدم طريقة GitHub Actions، **أي تعديل تدفعه إلى `main` سيُنشر تلقائياً**:

```bash
# بعد أي تعديل على ملفات public/
git add .
git commit -m "وصف التعديل الذي قمت به"
git push
```
انتظر دقيقة واحدة، ثم راجع تبويب **Actions** للتأكد من نجاح النشر التلقائي، وحدّث الموقع في المتصفح (قد تحتاج `Ctrl+Shift+R` لتفريغ الذاكرة المؤقتة/Cache).

---

## 🛠️ حل المشاكل الشائعة الخاصة بـ GitHub Pages

| # | المشكلة | السبب | الحل |
|---|---|---|---|
| 1 | خطأ **404** عند فتح الرابط | المستودع خاص (Private) على خطة مجانية شخصية، أو لم يكتمل النشر بعد | تأكد أن المستودع **Public**، أو ترقية لخطة GitHub Pro لدعم المستودعات الخاصة<cite>turn6search12</cite> |
| 2 | الصفحة تظهر لكن بدون تنسيق (CSS مفقود) | مسارات نسبية خاطئة بسبب اختلاف جذر الموقع (`/jpa-academy/` بدل `/`) | تأكد أن جميع الروابط في HTML تستخدم مسارات نسبية مثل `css/style.css` وليس `/css/style.css` |
| 3 | تسجيل الدخول (Firebase Auth) يعطي خطأ `auth/unauthorized-domain` | نطاق GitHub Pages الجديد غير مُصرّح له في Firebase | في Firebase Console → Authentication → Settings → Authorized domains → أضف `hassanzawia.github.io` |
| 4 | التغييرات لا تظهر رغم نجاح الـ Workflow | ذاكرة تخزين المتصفح المؤقتة (Cache) | اضغط `Ctrl+Shift+R` (ويندوز/لينكس) أو `Cmd+Shift+R` (ماك) لإعادة التحميل الكامل |
| 5 | خطأ "Get Pages site failed" في تبويب Actions | لم يتم تفعيل "GitHub Actions" كمصدر بعد في Settings → Pages | ارجع للخطوة 2.4 وتأكد من اختيار "GitHub Actions" وليس "Deploy from a branch" |
| 6 | النطاق المخصص يظهر تحذير أمني | لم تُفعّل "Enforce HTTPS" بعد أو DNS لم ينتشر بالكامل | انتظر ساعة إضافية، وتأكد من صحة سجلات DNS عبر أداة `dig www.jpa-academy.com` |

> 💡 **مهم بخصوص المشكلة #3:** بما أن مشروعك يستخدم Firebase Authentication، **يجب** إضافة نطاق GitHub Pages الجديد (`hassanzawia.github.io`) إلى قائمة "Authorized domains" في Firebase Console حتى يعمل تسجيل الدخول من هذا الرابط الجديد. اذهب إلى: **Firebase Console → Authentication → Settings (تبويب) → Authorized domains → Add domain**.

---

## ✅ قائمة تحقق نهائية لـ GitHub Pages

- [ ] المستودع مرفوع على GitHub وهو **Public**
- [ ] ملف `.github/workflows/github-pages.yml` تم إنشاؤه ورفعه
- [ ] في Settings → Pages، تم اختيار **"GitHub Actions"** كمصدر
- [ ] تشغيل Actions الأول نجح (✅ خضراء)
- [ ] رابط `https://hassanzawia.github.io/jpa-academy/` يعمل ويعرض الموقع
- [ ] نطاق GitHub Pages تمت إضافته إلى **Authorized domains** في Firebase Authentication
- [ ] تسجيل الدخول التجريبي يعمل من رابط GitHub Pages نفسه
- [ ] (اختياري) نطاق مخصص تم ربطه وتفعيل HTTPS عليه

---

**« معايير الجودة في التعليم الصيدلي.. واحترافية الممارسة الإكلينيكية »**
