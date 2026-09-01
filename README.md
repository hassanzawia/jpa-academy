# منصة الجودة للفارمسي أكاديمي (Al-Jawda Pharmacy Academy - JPA)

منصة تعليمية بمعمارية **PWA** مبنية بـ HTML/CSS/JS خالص، مربوطة بـ **Firebase (مجاني - Spark Plan)**، ومستوحاة من ميزات منصة **إيضاح (Edah)** التعليمية الليبية.

## ✨ الميزات

- **Authentication** (تسجيل دخول حقيقي عبر Firebase)
- **Cloud Firestore** (مزامنة فورية للبيانات بين الهاتف والويب)
- **📚 كتالوج دورات مصنّف** (طب، لغات، مناهج ثانوية، حرف مهنية) — مثل إيضاح
- **💰 نظام محفظة رصيد** للاشتراك في الدورات
- **📖 فصول (Chapters)** منظّمة لكل دورة، مع مدرّس مخصص لكل مادة
- **🎥 فيديوهات مستضافة على Google Drive** (بدلاً من الرفع المباشر لـ GitHub)
- **GitHub Pages / Firebase Hosting** (استضافة مجانية + SSL + CDN)
- **GitHub Actions** (نشر تلقائي عند كل `push`)

---

## 📁 هيكل المشروع

```
pharmacademy/
├─ public/
│  ├─ index.html              ← الصفحة الرئيسية
│  ├─ login.html               ← تسجيل الدخول + حسابات تجريبية
│  ├─ courses.html              ← كتالوج الدورات (تصنيفات + محفظة رصيد)
│  ├─ course-player.html        ← مشغّل الدورة (فصول + فيديو Google Drive)
│  ├─ pilot.html                ← إعادة توجيه تلقائي إلى courses.html (توافق سابق)
│  ├─ manifest.json / service-worker.js
│  ├─ css/style.css
│  ├─ js/firebase-config.js    ← إعدادات Firebase (مكتملة لمشروع pharmacyacadimy)
│  ├─ js/auth.js                ← منطق الدخول/الخروج
│  ├─ js/sync.js                ← مزامنة المحفظة، الاشتراكات، والتقدّم
│  ├─ js/courses-data.js        ← بيانات الدورات والفصول (عدّل هنا لإضافة دورات)
│  └─ assets/                   ← صور الدورات، أيقونات PWA، ملفات PDF
├─ firebase.json / .firebaserc / firestore.rules / firestore.indexes.json
├─ scripts/seed-users.js        ← إنشاء الحسابات التجريبية + رصيد محفظة ابتدائي
├─ .github/workflows/           ← نشر تلقائي (GitHub Pages + Firebase Hosting)
├─ DEPLOYMENT_GUIDE.md          ← دليل نشر Firebase التفصيلي
├─ GITHUB_PAGES_GUIDE.md        ← دليل استضافة GitHub Pages
├─ GITHUB_SETUP_HASSANZAWIA.md  ← دليل مخصص لحسابك (hassanzawia/jpa-academy)
├─ GOOGLE_DRIVE_VIDEOS_GUIDE.md ← 🆕 كيفية رفع وربط فيديوهات Google Drive
└─ .gitignore
```

---

## 👥 الحسابات التجريبية (مع رصيد محفظة ابتدائي)

| الدور | البريد | كلمة المرور | الرصيد الابتدائي |
|---|---|---|---|
| صيدلي إكلينيكي | dr_sarah@jpa-academy.com | sarah@2026 | 200 د.ل |
| طالب صيدلة | ahmed_pharma@jpa-academy.com | ahmed@123 | 150 د.ل |
| صيدلي امتياز متدرب | nour_intern@jpa-academy.com | nour@pass | 100 د.ل |
| طبيب بشري مراجع سريري | dr_tariq@jpa-academy.com | tariq@med26 | 200 د.ل |
| مدير الأكاديمية (Admin) | admin_jawda@jpa-academy.com | admin@jawda2026 | غير محدود |

> ملاحظة: إن كنت قد شغّلت `seed-users.js` من قبل، شغّله مرة أخرى لإضافة حقول `walletBalance` و`enrolledCourses` الجديدة (لن يؤثر على الحسابات الموجودة، فقط يضيف الحقول الناقصة).

---

## 🎥 إضافة فيديوهات الدورات (Google Drive)

بدلاً من رفع الفيديوهات إلى GitHub، ارفعها على Google Drive واربطها بمعرّف الملف فقط. الطريقة الكاملة موضحة في **`GOOGLE_DRIVE_VIDEOS_GUIDE.md`**.

خطوات سريعة:
1. ارفع الفيديو إلى Google Drive.
2. اضبط المشاركة على "Anyone with the link" (Viewer).
3. انسخ معرّف الملف (File ID) من رابط المشاركة.
4. الصقه في `public/js/courses-data.js` ضمن حقل `driveId` للفصل المناسب.
5. ادفع (`git push`) — سيُنشر تلقائياً.

---

## 📚 إضافة دورة أو فصل جديد

عدّل `public/js/courses-data.js` مباشرة — أضف كائناً جديداً في مصفوفة `COURSES` أو `chapters`. لا حاجة لتعديل أي ملف HTML، الموقع يقرأ البيانات ديناميكياً.

---

## 💰 حدود الباقات المجانية

| الخدمة | الحد المجاني |
|---|---|
| Firebase Hosting | 10 GB نقل بيانات / 360 MB تخزين شهرياً |
| Firestore | 50K قراءة / 20K كتابة / 20K حذف يومياً |
| GitHub Pages | استخدام معقول غير محدود عملياً |
| Google Drive | 15 GB تخزين مجاني للفيديوهات |

---

**« معايير الجودة في التعليم الصيدلي.. واحترافية الممارسة الإكلينيكية »**
