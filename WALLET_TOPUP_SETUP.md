# تفعيل ميزة شحن الرصيد من لوحة المدير — دليل التركيب

## 📦 الملفات المُحدَّثة في هذه الحزمة

| الملف | التغيير |
|---|---|
| `firestore.rules` | 🔄 إضافة صلاحية كتابة **محدودة** للمدير على حقل `walletBalance` فقط + قواعد سجل التدقيق `walletTransactions` |
| `public/js/sync.js` | 🔄 إضافة دالة `topUpWalletForUser(targetUid, amount, note)` |
| `public/js/admin.js` | 🔄 إضافة منطق نافذة الشحن (فتح/إغلاق/تنفيذ) + عمود "إجراء" في جدول الطلاب |
| `public/admin.html` | 🔄 إضافة نافذة منبثقة (Modal) للشحن + إشعار نجاح مؤقت (Toast) |
| `public/css/style.css` | 🔄 إضافة تنسيقات النافذة المنبثقة والإشعار |

---

## 🔐 كيف تعمل الحماية؟

### القاعدة الجديدة في `firestore.rules`:
```javascript
allow update: if request.auth != null
              && request.auth.token.admin == true
              && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['walletBalance']);
```

هذا يعني أن حساب المدير **يستطيع فقط** تعديل حقل `walletBalance` لأي مستخدم — **لا يستطيع** تعديل البريد الإلكتروني، الدور، الدورات المشترك بها، أو أي حقل آخر عبر هذه الصلاحية. أي محاولة لتعديل أكثر من هذا الحقل سترفضها Firestore تلقائياً.

### سجل التدقيق (Audit Trail):
كل عملية شحن تُسجَّل في `users/{uid}/walletTransactions/{id}` وتحتوي:
- المبلغ (`amount`)
- بريد المدير الذي نفّذ العملية (`adminEmail`)
- ملاحظة اختيارية (`note`)
- الطابع الزمني (`createdAt`)

هذا يوفّر شفافية كاملة لاحقاً إن احتجت مراجعة من قام بشحن أي رصيد ومتى.

---

## ⚠️ خطوة حرجة يجب تنفيذها: نشر قواعد Firestore الجديدة

بما أننا لا نستخدم Firebase Hosting (بل GitHub Pages)، **يجب نشر `firestore.rules` يدوياً** عبر Firebase Console — تماماً كما فعلنا سابقاً عند حل مشكلة "Missing or insufficient permissions".

### الخطوات:
1. اذهب إلى https://console.firebase.google.com → مشروع `pharmacyacadimy`
2. من القائمة الجانبية: **Firestore Database**
3. اضغط تبويب **"Rules"**
4. احذف كل المحتوى الحالي (`Ctrl+A` ثم Delete)
5. الصق المحتوى الكامل التالي:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;

      allow update: if request.auth != null
                    && request.auth.token.admin == true
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['walletBalance']);

      match /clinicalCases/{caseId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /walletTransactions/{transactionId} {
        allow read: if request.auth != null
                    && (request.auth.uid == userId || request.auth.token.admin == true);
        allow create: if request.auth != null && request.auth.token.admin == true;
        allow update, delete: if false;
      }
    }

    match /{document=**} {
      allow read: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

6. اضغط **"Publish"**
7. انتظر رسالة "Rules published successfully"

> 🔒 **بدون تنفيذ هذه الخطوة، ستحصل على خطأ `Missing or insufficient permissions` عند محاولة الشحن** — تماماً كما حدث سابقاً مع مشكلة عرض الدورات.

---

## 🚀 خطوات النسخ والرفع

### الخطوة 1: انسخ الملفات المُحدَّثة إلى مشروعك
انسخ كل ملف من هذه الحزمة إلى نفس المسار المطابق:
```
firestore.rules              (استبدال)
public/js/sync.js            (استبدال)
public/js/admin.js           (استبدال)
public/admin.html            (استبدال)
public/css/style.css         (استبدال)
```

### الخطوة 2: انشر قواعد Firestore يدوياً (الخطوة أعلاه) — **قبل** الرفع أو بعده، لا فرق

### الخطوة 3: ارفع التحديث إلى GitHub
```powershell
cd "C:\Users\HP\OneDrive - Hatif Libya\Desktop\pharmacademy"
git add .
git commit -m "Enable manual wallet top-up from admin dashboard"
git push
```

---

## 🧪 الاختبار الكامل

1. **امسح ذاكرة التخزين المؤقت أولاً** (F12 → Application → Storage → Clear site data) لتجنب أي مشاكل ترميز أو كاش سابقة.
2. سجّل الدخول بحساب `admin_jawda@jpa-academy.com`.
3. اضغط رابط **"👑 الإدارة"** → تبويب **"👥 الطلاب"**.
4. اضغط زر **"💰 شحن"** أمام أي مستخدم (مثلاً `nour_intern`).
5. في النافذة المنبثقة:
   - أدخل مبلغاً مثل `50`
   - أدخل ملاحظة اختيارية مثل "مكافأة نشاط"
   - اضغط **"تأكيد الشحن"**
6. **يجب أن تشاهد:**
   - إشعار أخضر مؤقت (Toast) أسفل الشاشة: "✅ تم شحن 50 د.ل بنجاح لحساب nour_intern@..."
   - الجدول يتحدّث فوراً ليعرض الرصيد الجديد
   - بطاقة "إجمالي أرصدة المحافظ" في تبويب نظرة عامة تتحدّث تلقائياً أيضاً

### اختبار الخصم (رقم سالب):
جرّب إدخال `-20` كمبلغ — يجب أن يعمل بنفس الطريقة، ويظهر الإشعار بصيغة "✅ تم خصم 20 د.ل بنجاح".

### اختبار الأمان (اختياري للمطمئنين):
افتح Firebase Console → Firestore Database → Data → users → [أي مستخدم] → تحقق من وجود مجموعة فرعية جديدة `walletTransactions` تحتوي سجل العملية التي نفّذتها.

---

## 🛠️ حل المشاكل الشائعة

| المشكلة | السبب | الحل |
|---|---|---|
| `Missing or insufficient permissions` عند الشحن | لم تُنشر قواعد Firestore الجديدة بعد | ارجع لخطوة "نشر قواعد Firestore" أعلاه |
| النافذة المنبثقة لا تظهر | ذاكرة تخزين مؤقت قديمة | امسح Cache بـ F12 → Application → Clear site data |
| الرصيد لا يتحدّث فوراً في الجدول | طبيعي أحياناً لثانية واحدة (يُعاد تحميل البيانات كاملة بعد كل عملية) | انتظر ثانية أو اضغط زر "🔄 تحديث" يدوياً |

---

**« معايير الجودة في التعليم الصيدلي.. واحترافية الممارسة الإكلينيكية »**
