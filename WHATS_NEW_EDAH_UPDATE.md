# ما الجديد: التحديث المستوحى من منصة إيضاح (Edah)

## 🔍 ما هي منصة إيضاح؟
بحثت عن منصة **إيضاح التعليمية** (edah.ly / edahplatform.com) وهي منصة ليبية حقيقية تُقدّم دورات في الطب، اللغات، المناهج الثانوية، والحرف المهنية، بنظام اشتراكات ودفع، ومدرّسين متعددين لكل مادة مقسّمة إلى "شابترات" (فصول).

## ✅ الميزات الجديدة المضافة لمشروعك

| الميزة | الوصف | أين تجدها |
|---|---|---|
| **كتالوج دورات مصنّف** | تصفح الدورات حسب 4 تصنيفات: طب/صيدلة، لغات، مناهج ثانوية، حرف مهنية | `courses.html` |
| **بطاقات دورة (Course Cards)** | كل دورة تعرض: اسم المدرّس وتخصصه، السعر، وصف مختصر | `courses.html` |
| **محفظة رصيد (Wallet)** | كل مستخدم له رصيد مالي، يُخصم منه عند الاشتراك في دورة | `courses.html`, `js/sync.js` |
| **فصول (Chapters)** | كل دورة مقسّمة لفصول منفصلة، كل فصل له فيديو ومدة ومخلّص PDF | `course-player.html` |
| **قفل المحتوى** | الدورة تظهر مقفلة حتى الاشتراك فيها من المحفظة | `course-player.html` |
| **🆕 فيديوهات Google Drive** | استبدال الرفع المباشر بفيديوهات مستضافة على Google Drive (مجاني 15GB، بدون حدود حجم الملف) | `js/courses-data.js`, `GOOGLE_DRIVE_VIDEOS_GUIDE.md` |

---

## 🗂️ الملفات الجديدة/المُحدّثة

| الملف | الحالة |
|---|---|
| `public/courses.html` | 🆕 جديد بالكامل |
| `public/course-player.html` | 🆕 جديد بالكامل (يحل محل الاستخدام السابق لـ pilot.html) |
| `public/pilot.html` | 🔄 محوّل الآن إلى إعادة توجيه تلقائي لـ courses.html |
| `public/js/courses-data.js` | 🆕 جديد - يحتوي كل بيانات الدورات والفصول |
| `public/js/sync.js` | 🔄 محدّث - أُضيفت دوال المحفظة والاشتراك |
| `public/js/auth.js` | 🔄 محدّث - التوجيه الافتراضي بعد الدخول أصبح courses.html |
| `public/css/style.css` | 🔄 محدّث - أُضيفت تنسيقات البطاقات والمحفظة والفصول |
| `scripts/seed-users.js` | 🔄 محدّث - كل حساب تجريبي له رصيد محفظة ابتدائي |
| `GOOGLE_DRIVE_VIDEOS_GUIDE.md` | 🆕 دليل جديد كامل لربط فيديوهات Google Drive |

---

## 🚀 الخطوات التالية المطلوبة منك

### 1. رفع التحديثات إلى GitHub
```powershell
cd "C:\Users\HP\OneDrive - Hatif Libya\Desktop\pharmacademy"
git add .
git commit -m "Add Edah-inspired course catalog, wallet system, and Google Drive video hosting"
git push
```

### 2. تحديث الحسابات التجريبية برصيد المحفظة
```powershell
cd scripts
node seed-users.js
```
(آمن لإعادة التشغيل — لن يكرر الحسابات، فقط يضيف حقل `walletBalance` الجديد لكل حساب)

### 3. ربط فيديوهاتك الفعلية
اتبع `GOOGLE_DRIVE_VIDEOS_GUIDE.md` لرفع فيديوهاتك على Google Drive واستبدال قيم `YOUR_DRIVE_ID_1`, `YOUR_DRIVE_ID_2`, إلخ داخل `public/js/courses-data.js` بمعرّفات فيديوهاتك الحقيقية.

### 4. (اختياري) تخصيص الدورات
عدّل `public/js/courses-data.js` لإضافة/حذف/تعديل الدورات والفصول والأسعار حسب احتياجك الفعلي.

---

**« معايير الجودة في التعليم الصيدلي.. واحترافية الممارسة الإكلينيكية »**
