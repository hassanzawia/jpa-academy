# إعداد GitHub الخاص بك (hassanzawia) لمشروع jpa-academy
## دليل مخصص بالكامل لحسابك — انسخ والصق فقط

> بياناتك: **اسم المستخدم:** `hassanzawia` | **اسم المستودع:** `jpa-academy`
> كل الأوامر أدناه جاهزة بالضبط لحسابك، فقط انسخها والصقها في الطرفية بدون أي تعديل.

---

## الخطوة 1: إنشاء المستودع على GitHub (تنفّذها أنت بنفسك في المتصفح)

1. سجّل الدخول إلى https://github.com بحساب `hassanzawia`.
2. اذهب مباشرة إلى: **https://github.com/new**
3. املأ الحقول بالضبط كالتالي:

   | الحقل | القيمة |
   |---|---|
   | Repository name | `jpa-academy` |
   | Description (اختياري) | منصة الجودة للفارمسي أكاديمي |
   | Visibility | **Public** ✅ (ضروري لـ GitHub Pages المجاني) |
   | Add a README file | ☐ **اتركه غير محدد** |
   | Add .gitignore | ☐ **اتركه غير محدد** |
   | Choose a license | ☐ **اتركه غير محدد** |

4. اضغط الزر الأخضر **"Create repository"**.
5. ستظهر لك صفحة فارغة بعنوان "Quick setup" — **لا تفعل شيئاً هنا**، فقط انتقل للخطوة التالية في الطرفية على حاسوبك.

بعد هذه الخطوة، سيكون رابط مستودعك بالضبط:
```
https://github.com/hassanzawia/jpa-academy
```

---

## الخطوة 2: ربط ملفات مشروعك المحلية بالمستودع (انسخ والصق في الطرفية)

افتح الطرفية داخل مجلد `pharmacademy` (الذي فككت ضغطه من الملف المرسل)، ثم نفّذ هذه الأوامر **بالترتيب تماماً**:

```bash
cd ~/Desktop/pharmacademy

git init
git add .
git commit -m "Initial commit: JPA Academy"
git branch -M main
git remote add origin https://github.com/hassanzawia/jpa-academy.git
git push -u origin main
```

### ماذا تتوقع أن يحدث:
- إن كانت هذه أول مرة تستخدم Git من هذا الجهاز، سيفتح متصفحك تلقائياً طالباً تسجيل الدخول بحساب `hassanzawia` والموافقة (Authorize).
- إن طُلبت منك كلمة مرور مباشرة في الطرفية (نادراً ما يحدث الآن)، **لا تستخدم كلمة مرور حسابك العادية** — أنشئ Personal Access Token بدلاً منها (الخطوة 2.1 أدناه).

### الخطوة 2.1 (فقط إن طُلبت كلمة مرور): إنشاء Personal Access Token
1. اذهب إلى: **https://github.com/settings/tokens**
2. اضغط **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** اكتب `jpa-academy-deploy`
4. **Expiration:** اختر `90 days` أو `No expiration` حسب راحتك
5. حدد صلاحية ☑️ **repo** (المربع الرئيسي بالكامل)
6. اضغط **"Generate token"** أسفل الصفحة
7. **انسخ الرمز فوراً** (شكل مشابه لـ `ghp_xxxxxxxxxxxxxxxxxxxx`) — لن يظهر مرة أخرى
8. عند طلب كلمة المرور في الطرفية، الصق هذا الرمز بدلاً منها

### التحقق من نجاح الرفع
افتح في المتصفح:
```
https://github.com/hassanzawia/jpa-academy
```
يجب أن تشاهد كل ملفات مشروعك (`public/`, `firebase.json`, `README.md`, `.github/`, إلخ) ظاهرة في المستودع.

---

## الخطوة 3: تفعيل GitHub Pages من إعدادات حسابك (بناءً على الصورة التي أرسلتها)

بما أنك أرسلت لقطة شاشة لقائمة حسابك (تحتوي Profile, Repositories, Settings...)، إليك المسار **الأدق** بناءً على واجهتك الحالية:

### الطريقة أ: عبر صفحة المستودع مباشرة (الأسرع والموصى بها)
1. من نفس القائمة التي في صورتك، اضغط **"Repositories"**.
2. اضغط على مستودع **"jpa-academy"** من القائمة.
3. داخل صفحة المستودع، ابحث عن تبويب **"Settings"** (أعلى الصفحة، بجانب Insights — **هذا مختلف عن "Settings" الموجود في قائمة حسابك الشخصي بالصورة، فذاك خاص بإعدادات حسابك العامة وليس بمستودع معيّن**).
4. من القائمة الجانبية اليسرى داخل صفحة إعدادات المستودع، انزل لقسم **"Code and automation"** واضغط **"Pages"**.
5. تحت **"Build and deployment" → "Source"**، اختر **"GitHub Actions"** (وليس "Deploy from a branch").
6. لا يوجد زر حفظ منفصل — الاختيار يُحفظ فوراً بمجرد الاختيار.

### الخطوة 3.1: التأكد من وجود ملف الـ Workflow
مشروعك يحتوي بالفعل على الملف الجاهز:
```
.github/workflows/github-pages.yml
```
بما أنك رفعت المشروع كاملاً في الخطوة 2، هذا الملف موجود بالفعل في مستودعك على GitHub. لا حاجة لإنشائه يدوياً.

### الخطوة 3.2: تشغيل النشر الأول
النشر سيبدأ **تلقائياً** بمجرد اختيارك "GitHub Actions" كمصدر في الخطوة 3، لأن الملف موجود مسبقاً ومرتبط بحدث `push` على الفرع `main` (وقد حدث push بالفعل في الخطوة 2).

إن لم يبدأ تلقائياً، فعّله يدوياً:
1. اذهب إلى تبويب **"Actions"** في مستودعك: `https://github.com/hassanzawia/jpa-academy/actions`
2. من القائمة الجانبية اليسرى، اضغط على اسم الـ Workflow **"نشر على GitHub Pages"**.
3. اضغط الزر **"Run workflow"** (قائمة منسدلة أعلى يمين قائمة التشغيلات) → اختر الفرع `main` → اضغط **"Run workflow"** الأخضر.

### الخطوة 3.3: مراقبة النشر
1. في نفس صفحة **Actions**، ستشاهد تشغيلاً جديداً بدائرة صفراء 🟡 متحركة.
2. اضغط عليه لمشاهدة التفاصيل الحية.
3. عند الانتهاء بنجاح، ستتحول الدائرة إلى علامة ✅ خضراء (يستغرق عادة 30-90 ثانية).

### الخطوة 3.4: الحصول على رابط موقعك النهائي
1. ارجع إلى: `https://github.com/hassanzawia/jpa-academy/settings/pages`
2. أعلى الصفحة سيظهر شريط أخضر:
   > **"Your site is live at https://hassanzawia.github.io/jpa-academy/"**
3. رابط موقعك النهائي والدائم هو بالضبط:
   ```
   https://hassanzawia.github.io/jpa-academy/
   ```

---

## الخطوة 4: خطوة حرجة لا تنسها — ربط Firebase Authentication بهذا الرابط الجديد

بما أن موقعك يستخدم تسجيل دخول عبر Firebase، **يجب** إخبار Firebase أن هذا الرابط الجديد موثوق:

1. اذهب إلى https://console.firebase.google.com → اختر مشروعك.
2. من القائمة الجانبية: **Build → Authentication**.
3. اضغط تبويب **"Settings"** (أعلى الصفحة، بجانب Users وSign-in method).
4. انزل إلى قسم **"Authorized domains"**.
5. اضغط **"Add domain"**.
6. اكتب بالضبط:
   ```
   hassanzawia.github.io
   ```
7. اضغط **"Add"**.

> ⚠️ بدون هذه الخطوة، ستحصل على خطأ `auth/unauthorized-domain` عند محاولة تسجيل الدخول من رابط GitHub Pages الجديد، حتى لو كان كل شيء آخر صحيحاً.

---

## ✅ ملخص سريع لروابطك النهائية

| العنصر | الرابط/القيمة |
|---|---|
| مستودع GitHub | `https://github.com/hassanzawia/jpa-academy` |
| موقعك المباشر (GitHub Pages) | `https://hassanzawia.github.io/jpa-academy/` |
| صفحة تسجيل الدخول | `https://hassanzawia.github.io/jpa-academy/login.html` |
| إعدادات Pages | `https://github.com/hassanzawia/jpa-academy/settings/pages` |
| سجل عمليات النشر | `https://github.com/hassanzawia/jpa-academy/actions` |

---

## 🔄 كيف تُحدّث الموقع لاحقاً (بعد أي تعديل)

```bash
cd ~/Desktop/pharmacademy
git add .
git commit -m "وصف التعديل"
git push
```
انتظر دقيقة، راجع تبويب Actions، ثم حدّث الموقع في المتصفح (`Ctrl+Shift+R` لتفريغ الذاكرة المؤقتة إن لم تظهر التغييرات فوراً).

---

**« معايير الجودة في التعليم الصيدلي.. واحترافية الممارسة الإكلينيكية »**
