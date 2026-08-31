# دليل النشر التفصيلي الموسّع (خطوة بخطوة، بالتفصيل الكامل)
## منصة الجودة للفارمسي أكاديمي (Al-Jawda Pharmacy Academy)
### GitHub + Firebase (مجاني بالكامل - Spark Plan)

> هذا الدليل مكتوب لشخص لم يسبق له استخدام Firebase أو Git من قبل. كل خطوة مشروحة بأدق التفاصيل: أين تضغط بالضبط، وماذا يجب أن تراه على الشاشة بعد كل إجراء، ولماذا نقوم بهذه الخطوة أصلاً.

---

## 📋 الجزء صفر: التحضير الكامل قبل البدء

### الخطوة 0.1: تثبيت Node.js
1. اذهب إلى https://nodejs.org
2. اضغط زر **LTS** لتحميل النسخة الأكثر استقراراً.
3. بعد التحميل:
   - **ويندوز:** شغّل ملف `.msi` واضغط "Next" في كل الشاشات حتى "Finish".
   - **ماك:** شغّل ملف `.pkg` واتبع التعليمات.
   - **لينكس (Ubuntu/Debian):**
     ```bash
     curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
     sudo apt-get install -y nodejs
     ```
4. أعد تشغيل الطرفية (Terminal) تماماً.
5. تحقق:
   ```bash
   node -v
   ```
   **النتيجة المتوقعة:** رقم يبدأ بـ `v18` أو `v20` أو أعلى.

### الخطوة 0.2: تثبيت Git
1. اذهب إلى https://git-scm.com/downloads
2. حمّل النسخة المناسبة لنظامك وثبّتها.
3. تحقق:
   ```bash
   git --version
   ```

### الخطوة 0.3: إعداد هوية Git (مرة واحدة فقط لكل جهاز)
```bash
git config --global user.name "Hassan Ibrahim Ali Zawia"
git config --global user.email "your-email@example.com"
```

### الخطوة 0.4: إنشاء حساب GitHub (إن لم يكن لديك)
1. اذهب إلى https://github.com/signup
2. أدخل بريدك الإلكتروني → **Continue**
3. أنشئ كلمة مرور قوية → **Continue**
4. اختر اسم مستخدم فريد → **Continue**
5. حل اختبار التحقق
6. تحقق من بريدك الإلكتروني وأدخل الرمز
7. اختر الخطة المجانية **Free**

### الخطوة 0.5: فك ضغط ملف المشروع
1. حمّل ملف `jpa-academy-firebase-deploy.zip`.
2. فك الضغط في مكان تتذكره، مثلاً سطح المكتب.
3. تأكد من ظهور مجلد `pharmacademy` بداخله: `public`, `firebase.json`, `.firebaserc`, `firestore.rules`, `scripts`, `README.md`, `.github`.

### الخطوة 0.6: فتح الطرفية داخل المجلد الصحيح
- **ويندوز:** افتح مجلد `pharmacademy`، في شريط العنوان اكتب `cmd` واضغط Enter.
- **ماك:** افتح Terminal، اكتب `cd ` واسحب المجلد وأفلته، ثم Enter.
- **لينكس:**
  ```bash
  cd ~/Desktop/pharmacademy
  ```

### الخطوة 0.7: التحقق النهائي
```bash
pwd
ls
```

---

## 🔥 الجزء الأول: إنشاء مشروع Firebase بالتفصيل الكامل

### الخطوة 1.1: الدخول إلى Firebase Console
1. افتح https://console.firebase.google.com
2. سجّل الدخول بحساب Google الخاص بك.

### الخطوة 1.2: بدء إنشاء مشروع جديد
اضغط **"Create a project"** أو **"Add project"**.

### الخطوة 1.3: تسمية المشروع
1. في حقل **"Project name"** اكتب: `jpa-academy`
2. **احفظ معرّف المشروع (Project ID)** الظاهر أسفل الحقل.
3. اضغط **Continue**.

### الخطوة 1.4: إعدادات Google Analytics
1. اضغط على المفتاح لتعطيله (اجعله رمادياً).
2. اضغط **Continue**.

### الخطوة 1.5: إنشاء المشروع فعلياً
1. اضغط **"Create project"**.
2. انتظر 15-30 ثانية.
3. اضغط **Continue**.

### الخطوة 1.6: التعرّف على لوحة تحكم Firebase
لاحظ القائمة الجانبية: **Build** (Authentication, Firestore Database, Hosting) و **Release & Monitor**.

---

## 🔐 الجزء الثاني: تفعيل Authentication بالتفصيل

### الخطوة 2.1: فتح قسم Authentication
القائمة الجانبية → **Build** → **Authentication**.

### الخطوة 2.2: بدء الإعداد
اضغط **"Get started"**.

### الخطوة 2.3: اختيار طريقة تسجيل الدخول
تبويب **"Sign-in method"** → اضغط **"Email/Password"**.

### الخطوة 2.4: تفعيل Email/Password
1. فعّل مفتاح **"Email/Password"** (اتركه معطّلاً لـ "Email link").
2. اضغط **"Save"**.

### الخطوة 2.5: (اختياري) ضبط قوالب البريد الإلكتروني
تبويب **"Templates"** — يمكن تخطيه الآن.

---

## 🗄️ الجزء الثالث: تفعيل Firestore Database بالتفصيل

### الخطوة 3.1: فتح قسم Firestore
القائمة الجانبية → **Build** → **Firestore Database**.

### الخطوة 3.2: بدء الإنشاء
اضغط **"Create database"**.

### الخطوة 3.3: اختيار وضع الأمان
اختر **"Start in production mode"** → **Next**.

### الخطوة 3.4: اختيار موقع الخادم
1. اختر أقرب منطقة، مثل `eur3 (europe-west)`.
2. ⚠️ **هذا الاختيار نهائي ولا يمكن تغييره لاحقاً**.
3. اضغط **Enable/Create**، انتظر 20-40 ثانية.

### الخطوة 3.5: التعرّف على واجهة Firestore
تبويبات: **Data**, **Rules**, **Indexes**, **Usage**.

---

## 🌐 الجزء الرابع: تفعيل Hosting والحصول على إعدادات التطبيق

### الخطوة 4.1: فتح قسم Hosting
**Build** → **Hosting** → **"Get started"** → اضغط Next 3 مرات ثم "Continue to console".

### الخطوة 4.2-4.3: تسجيل تطبيق ويب جديد
1. ⚙️ **Project settings** → قسم **"Your apps"**.
2. اضغط أيقونة الويب `</>`.

### الخطوة 4.4: تسمية تطبيق الويب
1. اكتب: `jpa-academy-web`
2. **لا تضع** علامة صح على "Also set up Firebase Hosting".
3. اضغط **"Register app"**.

### الخطوة 4.5: نسخ إعدادات Firebase Config
1. انسخ كائن `firebaseConfig` بالكامل.
2. احفظه مؤقتاً في ملف نصي.
3. اضغط **"Continue to console"**.

---

## ⚙️ الجزء الخامس: ربط ملفات المشروع بإعدادات Firebase

### الخطوة 5.1-5.2: تحديث firebase-config.js
✅ **تم إنجاز هذه الخطوة مسبقاً لمشروعك** — ملف `public/js/firebase-config.js` معبّأ بالكامل بإعدادات مشروع `pharmacyacadimy` الفعلية (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId). لا حاجة لأي تعديل يدوي هنا.

### الخطوة 5.3: حفظ الملف
احفظ بصيغة نص عادي (Plain Text على ماك).

### الخطوة 5.4: تحديث .firebaserc
```json
{
  "projects": {
    "default": "pharmacyacadimy"
  }
}
```

### الخطوة 5.5: تحديث ملف GitHub Actions (تجهيز مسبق)
حدّث `projectId` في `.github/workflows/firebase-hosting.yml`.

### الخطوة 5.6: تأكيد صحة التعديلات
```bash
node -c public/js/firebase-config.js
```

---

## 💻 الجزء السادس: تثبيت Firebase CLI والنشر اليدوي الأول

### الخطوة 6.1: تثبيت Firebase CLI
```bash
npm install -g firebase-tools
```

### الخطوة 6.2: التحقق
```bash
firebase --version
```

### الخطوة 6.3: تسجيل الدخول
```bash
firebase login
```
سيفتح متصفحك — اختر حساب Google واضغط **Allow**.

### الخطوة 6.4: ربط المجلد بمشروع Firebase
```bash
cd ~/Desktop/pharmacademy
firebase use --add
```
اختر مشروعك، ثم اكتب alias: `default`

### الخطوة 6.5: مراجعة نهائية
```bash
cat firebase.json
```

### الخطوة 6.6: تنفيذ النشر
```bash
firebase deploy --only hosting,firestore:rules
```

### الخطوة 6.7: فتح الموقع والتحقق
افتح رابط "Hosting URL" الظاهر في المخرجات، تحقق من ظهور الصفحة الرئيسية بشكل صحيح.

> ⚠️ تسجيل الدخول لن يعمل بعد حتى ننشئ الحسابات في الجزء التالي.

---

## 👥 الجزء السابع: إنشاء الحسابات التجريبية الخمسة بالتفصيل

### الخطوة 7.1: توليد مفتاح حساب الخدمة
⚙️ Project settings → **"Service accounts"** → **"Generate new private key"** → **"Generate key"**.

### الخطوة 7.2: نقل المفتاح
أعد تسمية الملف إلى `serviceAccountKey.json` وانقله إلى `pharmacademy/scripts/`.

> 🔒 لا تشارك هذا الملف مع أحد ولا ترفعه على GitHub.

### الخطوة 7.3: تثبيت مكتبة firebase-admin
```bash
cd scripts
npm install
```

### الخطوة 7.5: تشغيل السكربت
```bash
node seed-users.js
```

### الخطوة 7.6-7.7: التحقق من Authentication وFirestore
راجع Console → Authentication → Users (5 صفوف) وFirestore → Data → users (5 مستندات).

### الخطوة 7.8: اختبار تسجيل الدخول
افتح `/login.html` على الموقع المنشور، اضغط زر حساب تجريبي، تحقق من الدخول والانتقال لـ pilot.html.

---

## 📤 الجزء الثامن: رفع المشروع إلى GitHub بالتفصيل

### الخطوة 8.1: إنشاء مستودع جديد
https://github.com/new → اسم المستودع: `jpa-academy` → **لا تحدد** README/.gitignore/license → **"Create repository"**.

### الخطوة 8.2: نسخ رابط المستودع
```
https://github.com/hassanzawia/jpa-academy.git
```

### الخطوة 8.3-8.9: أوامر الرفع
```bash
cd ~/Desktop/pharmacademy
git init
git add .
git status
git commit -m "Initial commit: JPA Academy with Firebase sync"
git branch -M main
git remote add origin https://github.com/hassanzawia/jpa-academy.git
git push -u origin main
```

**إن طُلبت كلمة مرور:** أنشئ Personal Access Token من https://github.com/settings/tokens (صلاحية `repo` كاملة) واستخدمه بدلاً من كلمة المرور.

### الخطوة 8.10: التحقق النهائي
افتح صفحة مستودعك وتأكد من ظهور كل الملفات.

---

## 🔄 الجزء التاسع: تفعيل النشر التلقائي (CI/CD) بالتفصيل

### الخطوة 9.1: تشغيل أمر الربط الآلي
```bash
firebase init hosting:github
```

### الخطوة 9.2: الإجابة على الأسئلة
1. Repository: `hassanzawia/jpa-academy`
2. Build script؟ → `N`
3. Auto deploy on merge؟ → `Y`
4. Branch؟ → `main`

### الخطوة 9.4: إزالة التكرار
```bash
rm .github/workflows/firebase-hosting.yml
```
(فقط إن استخدمت الطريقة الآلية أعلاه بدلاً من الملف اليدوي المرفق)

### الخطوة 9.5-9.6: رفع ومراقبة
```bash
git add .
git commit -m "Enable automatic GitHub Actions deployment"
git push
```
راقب تبويب **Actions** في GitHub.

---

## 📱 الجزء العاشر: اختبار المزامنة الفورية بين جهازين

### الخطوة 10.1-10.2: تسجيل الدخول من جهازين
سجّل دخول بنفس الحساب من الحاسوب ثم الهاتف، شغّل الفيديو وأوقفه، تحقق من استئناف نفس النقطة على الجهاز الآخر.

### الخطوة 10.3: اختبار مزامنة المحاكي السريري
أجب على سؤال من الهاتف، تحقق من ظهور النتيجة فوراً في Firestore Console.

### الخطوة 10.4: إضافة الموقع كـ PWA
- **أندرويد:** ⋮ → "Add to Home screen"
- **آيفون:** مشاركة (□↑) → "Add to Home Screen"

---

## ✅ الجزء الحادي عشر: قائمة التحقق النهائية الشاملة

**التحضير:**
- [ ] Node.js وGit مثبّتان
- [ ] حساب GitHub جاهز

**Firebase:**
- [ ] مشروع Firebase تم إنشاؤه
- [ ] Authentication → Email/Password مفعّل
- [ ] Firestore Database تم إنشاؤها
- [ ] تطبيق ويب تم تسجيله ونُسخ `firebaseConfig`

**ربط الملفات:**
- [ ] `firebase-config.js` و `.firebaserc` محدَّثان

**النشر اليدوي:**
- [ ] `firebase deploy` نجح وظهر رابط `.web.app`

**الحسابات التجريبية:**
- [ ] `node seed-users.js` نجح، تسجيل الدخول يعمل

**GitHub:**
- [ ] المستودع تم إنشاؤه ورفعه بنجاح

**النشر التلقائي:**
- [ ] `firebase init hosting:github` تم، وActions ناجح

**الاختبار النهائي:**
- [ ] المزامنة بين حاسوب وهاتف تعمل

---

## 🛠️ الجزء الثاني عشر: حل المشاكل الشائعة بالتفصيل

| # | المشكلة | السبب المحتمل | الحل التفصيلي |
|---|---|---|---|
| 1 | `firebase: command not found` | لم يُثبّت firebase-tools بنجاح | أعد `npm install -g firebase-tools`، أغلق وأعد فتح الطرفية |
| 2 | `Failed to get Firebase project` | معرّف مشروع خاطئ | تحقق من `firebase projects:list` |
| 3 | الموقع أبيض تماماً | خطأ JS في firebase-config.js | افتح F12 → Console واقرأ الخطأ |
| 4 | `auth/user-not-found` | seed-users.js لم يُنفَّذ | راجع الجزء السابع بالكامل |
| 5 | `Missing or insufficient permissions` | قواعد Firestore لم تُنشر | `firebase deploy --only firestore:rules` |
| 6 | `git push` يرفض كلمة المرور | GitHub لا يقبل كلمات مرور عادية | استخدم Personal Access Token |
| 7 | GitHub Actions "Invalid service account" | السر لم يُحفظ صحيحاً | أعد `firebase init hosting:github` |
| 8 | البيانات لا تُزامن | حسابان مختلفان أو لا إنترنت | تأكد من نفس البريد الإلكتروني بالضبط |
| 9 | `Cannot find module 'firebase-admin'` | لم يُنفَّذ npm install | `cd scripts && npm install` |
| 10 | الفيديو لا يعمل | لم يُرفع ملف فيديو فعلي | ارفع mp4 حقيقي أو استخدم رابط خارجي |

---

**« معايير الجودة في التعليم الصيدلي.. واحترافية الممارسة الإكلينيكية »**
