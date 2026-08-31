# منصة الجودة للفارمسي أكاديمي (Al-Jawda Pharmacy Academy - JPA)

منصة تعليمية بمعمارية **PWA** مبنية بـ HTML/CSS/JS خالص، مربوطة بـ **Firebase (مجاني - Spark Plan)** لتوفير:
- **Authentication** (تسجيل دخول حقيقي بدل localStorage)
- **Cloud Firestore** (مزامنة فورية للبيانات بين الهاتف والويب - Realtime Sync)
- **Firebase Hosting** و/أو **GitHub Pages** (استضافة مجانية + SSL + CDN)
- **GitHub Actions** (نشر تلقائي عند كل `push` إلى `main`)

---

## 📁 هيكل المشروع

```
pharmacademy/
├─ public/                 ← جذر الاستضافة (كل ما يُنشر فعلياً)
│  ├─ index.html           ← الصفحة الرئيسية
│  ├─ login.html           ← تسجيل الدخول + حسابات تجريبية
│  ├─ pilot.html           ← المحاضرات + المحاكي السريري (محمي بالدخول)
│  ├─ manifest.json        ← إعدادات PWA
│  ├─ service-worker.js    ← عمل بدون اتصال
│  ├─ css/style.css
│  ├─ js/firebase-config.js← إعدادات مشروعك في Firebase (يجب تعديلها)
│  ├─ js/auth.js           ← منطق الدخول/الخروج
│  ├─ js/sync.js           ← مزامنة التقدم والحالات السريرية
│  └─ assets/              ← ضع هنا الشعار والفيديوهات والأيقونات
├─ firebase.json           ← إعداد Firebase Hosting + Firestore
├─ .firebaserc             ← اسم مشروع Firebase
├─ firestore.rules         ← قواعد الأمان (كل مستخدم يرى بياناته فقط)
├─ firestore.indexes.json
├─ scripts/
│  ├─ seed-users.js        ← إنشاء الحسابات التجريبية الخمسة تلقائياً
│  └─ package.json
├─ .github/workflows/
│  ├─ firebase-hosting.yml     ← نشر تلقائي إلى Firebase Hosting
│  └─ github-pages.yml         ← نشر تلقائي إلى GitHub Pages
├─ DEPLOYMENT_GUIDE.md     ← دليل نشر Firebase التفصيلي (30 خطوة)
├─ GITHUB_PAGES_GUIDE.md   ← دليل استضافة GitHub Pages التفصيلي
└─ .gitignore
```

---

## 🚀 من أين أبدأ؟

1. اقرأ **`DEPLOYMENT_GUIDE.md`** للنشر عبر **Firebase Hosting** (الطريقة الأساسية، تتضمن كل خطوات إعداد Firebase نفسه).
2. اقرأ **`GITHUB_PAGES_GUIDE.md`** إن أردت استضافة إضافية أو بديلة عبر **GitHub Pages** (يعمل مع نفس مشروع Firebase للـ Auth/Firestore).

كلا الدليلين مكتوبان بالعربية بتفصيل كامل خطوة بخطوة، بدون افتراض أي خبرة تقنية مسبقة.

---

## 👥 الحسابات التجريبية الخمسة

| الدور | البريد | كلمة المرور |
|---|---|---|
| صيدلي إكلينيكي | dr_sarah@jpa-academy.com | sarah@2026 |
| طالب صيدلة | ahmed_pharma@jpa-academy.com | ahmed@123 |
| صيدلي امتياز متدرب | nour_intern@jpa-academy.com | nour@pass |
| طبيب بشري مراجع سريري | dr_tariq@jpa-academy.com | tariq@med26 |
| مدير الأكاديمية (Admin) | admin_jawda@jpa-academy.com | admin@jawda2026 |

تُنشأ هذه الحسابات فعلياً عبر تشغيل `scripts/seed-users.js` (موضّح بالتفصيل في `DEPLOYMENT_GUIDE.md`).

---

## 🔄 كيف تعمل المزامنة الكاملة (Full Sync)؟

- عند تسجيل الدخول، يُنشأ مستند للمستخدم في `users/{uid}` على Firestore.
- أي تقدّم في المحاضرات (`saveProgress`) أو نتائج الحالات السريرية (`saveClinicalCaseResult`) يُكتب فوراً في Firestore.
- صفحة `pilot.html` تستمع (`onSnapshot`) لتغييرات المستند لحظياً؛ فإن فتحت الحساب من الهاتف بعد الويب (أو العكس) ستجد آخر نقطة توقف والنتائج محدّثة تلقائياً دون تحديث يدوي.
- تم تفعيل **Offline Persistence**، لذا التطبيق يعمل حتى بدون إنترنت ويُزامن تلقائياً عند عودة الاتصال.

---

## 💰 حدود الباقة المجانية (Spark Plan)

| الخدمة | الحد المجاني الشهري |
|---|---|
| Firebase Hosting | 10 GB نقل بيانات / 360 MB تخزين |
| Firestore | 50K قراءة / 20K كتابة / 20K حذف يومياً |
| Authentication | غير محدود عملياً للاستخدام العادي |
| GitHub Pages | غير محدود عملياً للمواقع الثابتة (استخدام معقول) |

هذا كافٍ تماماً لمرحلة MVP والتجربة التجريبية (Pilot) الحالية.

---

**« معايير الجودة في التعليم الصيدلي.. واحترافية الممارسة الإكلينيكية »**
