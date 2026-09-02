# إصلاح: تجمّد صامت عند أول عملية كتابة على Firestore بعد الدخول

## 🎯 السجل الذي قاد للتشخيص

بفضل أداة `debug-logger.js`، حصلنا على دليل قاطع:
```
✅ signInWithEmailAndPassword SUCCESS
✅ ensureUserProfile: doc.exists = true
❌ (لا شيء بعد ذلك - توقف تام)
```

العملية تتجمّد بالضبط عند أول استدعاء لـ:
```javascript
await ref.update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() });
```

## 🔍 السبب الأرجح: `enablePersistence()` (تخزين Firestore دون اتصال عبر IndexedDB)

كان `firebase-config.js` يُفعّل:
```javascript
db.enablePersistence({ synchronizeTabs: true })
```

هذه الميزة تعتمد على **IndexedDB** في المتصفح لتخزين البيانات محلياً. من المعروف أن IndexedDB يتصرف بشكل غير موثوق على بعض متصفحات الهواتف تحت ظروف معيّنة (وضع التصفح الخاص، قيود تخزين صارمة من نظام التشغيل، تعارض بين عدة تبويبات/صفحات مفتوحة لنفس الموقع)، مما قد يُسبب "تجمّد صامت" لعمليات القراءة/الكتابة **دون أي رسالة خطأ على الإطلاق** — وهذا يُطابق تماماً ما شاهدناه في السجل.

---

## ✅ إصلاحان مُطبَّقان معاً

### 1. تعطيل `enablePersistence()` مؤقتاً
في `firebase-config.js`، عطّلنا استدعاء هذه الميزة بالكامل (معلَّقة بتعليق واضح، وليست محذوفة، تحسباً لإعادة تفعيلها لاحقاً بعد التأكد الكامل من أنها كانت السبب).

**الأثر الجانبي المقبول:** الموقع لن يعمل بدون اتصال إنترنت بعد الآن (فقدنا جزءاً من ميزة PWA)، لكن هذا مقبول تماماً مقابل ضمان عدم تجمّد أي عملية بصمت.

### 2. إضافة مهلة زمنية وقائية (`withTimeout`) على كل عملية Firestore حرجة
أضفنا دالة `withTimeout()` في `auth.js` تُطبَّق الآن على:
- `ensureUserProfile` بالكامل (10 ثوانٍ)
- `ref.get()`, `ref.set()`, `ref.update()` داخلها (8 ثوانٍ لكل واحدة)
- `startNewSession` بالكامل (10 ثوانٍ)
- كتابة الجلسة داخل `session-guard.js` (8 ثوانٍ)

**النتيجة:** حتى لو تجمّدت أي عملية Firestore لأي سبب مستقبلي (شبكة، متصفح، إلخ)، **لن تتجمّد الصفحة للأبد بصمت** — ستظهر رسالة خطأ واضحة في السجل والواجهة خلال 8-10 ثوانٍ كحد أقصى، مثل:
```
🔴 ensureUserProfile() FAILED/TIMEOUT: TIMEOUT (8000ms): ensureUserProfile.update()
```

---

## 📦 الملفات المُحدَّثة

| الملف | التغيير |
|---|---|
| `public/js/firebase-config.js` | 🔄 تعطيل `enablePersistence()` (معلَّقة بالكود) |
| `public/js/auth.js` | 🔄 إضافة `withTimeout()` وتطبيقها على كل عمليات Firestore |
| `public/js/session-guard.js` | 🔄 تطبيق `withTimeout()` على كتابة الجلسة |

---

## 🚀 خطوات النسخ والرفع

```powershell
cd "C:\Users\HP\OneDrive - Hatif Libya\Desktop\pharmacademy"
```
انسخ الملفات الثلاثة (استبدال).

```powershell
git add .
git commit -m "Fix silent Firestore hang: disable persistence + add operation timeouts"
git push
```

---

## 🧪 خطوات الاختبار (لا حاجة لمسح كاش هذه المرة، فقط انتظر النشر)

1. تحقق من: `https://github.com/jawda-edu/jawda-edu.github.io/actions` (✅ خضراء)
2. على هاتفك، افتح `https://jawda-edu.github.io/login.html`
3. اضغط على حساب `dr_sarah`
4. **النتيجة المتوقعة الآن:** إما نجاح كامل خلال ثوانٍ قليلة (انتقال فعلي لصفحة `courses.html`)، أو **رسالة خطأ واضحة** بدلاً من التجمّد الصامت السابق.
5. **بغض النظر عن النتيجة، اضغط "📋 Copy log" وأرسل لي السجل الكامل** — إن نجح الدخول، سنتأكد من حل المشكلة نهائياً؛ وإن ظهرت رسالة TIMEOUT، سنعرف بدقة أي عملية بالضبط لا تزال تتجمّد ونُعالجها بشكل أعمق (مثل التحقق من قواعد `firestore.rules` أو مشكلة شبكة محددة).

---

**« معايير الجودة في التعليم الصيدلي.. واحترافية الممارسة الإكلينيكية »**
