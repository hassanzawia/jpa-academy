# إصلاح: اختفاء بطاقات الدورات ورصيد المحفظة عند أول تحميل

## 🐛 وصف المشكلة
بعد رفع تحديث كتالوج الدورات، لاحظت أن صفحة `courses.html` تظهر فارغة تماماً (بدون بطاقات دورات، ورصيد المحفظة يظهر "0 د.ل" باستمرار)، رغم أن الحسابات لديها رصيد فعلي في Firestore.

## 🔍 السبب الجذري (Race Condition)

الكود القديم كان يستدعي `listenToWallet()` مباشرة عند تحميل الصفحة:

```javascript
listenToWallet((balance, enrolled) => {
  // ...
  renderCourses(); // لا يُستدعى إلا من هنا!
});
```

وداخل `listenToWallet` في `sync.js`، كان الكود يتحقق من `auth.currentUser` **فوراً**:

```javascript
function listenToWallet(onUpdate) {
  const user = auth.currentUser;   // ⚠️ قد يكون null هنا!
  if (!user) return () => {};       // يتوقف فوراً بدون فعل أي شيء
  // ...
}
```

**المشكلة:** Firebase Authentication يحتاج جزءاً من الثانية (غير متزامن/asynchronous) للتحقق من جلسة تسجيل الدخول المحفوظة محلياً عند تحميل الصفحة. عندما يُنفَّذ الكود أعلاه، غالباً لا يكون `auth.currentUser` قد تعيّن بعد، فتتوقف الدالة دون تفعيل أي مستمع (`onSnapshot`)، وبالتالي **لا تُستدعى `renderCourses()` أبداً**.

---

## ✅ الإصلاح المُطبّق (نسخة v2/v3)

### 1. إصلاح جذري في `sync.js`
جميع دوال `listenTo...` أصبحت تنتظر تأكيد حالة تسجيل الدخول عبر `auth.onAuthStateChanged` بدلاً من الاعتماد على `auth.currentUser` مباشرة:

```javascript
function listenToWallet(onUpdate) {
  let unsubDoc = () => {};
  const unsubAuth = auth.onAuthStateChanged((user) => {
    unsubDoc();
    if (!user) return;
    unsubDoc = db.collection("users").doc(user.uid).onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        onUpdate(data.walletBalance || 0, data.enrolledCourses || []);
      }
    });
  });
  return () => { unsubDoc(); unsubAuth(); };
}
```

### 2. حماية إضافية (Defense-in-Depth) في `courses.html`
بالإضافة للإصلاح أعلاه، أضفت استدعاءً فورياً لـ `renderCourses()` عند تحميل الصفحة (بقيم افتراضية: رصيد 0، بدون اشتراكات)، بحيث **تظهر بطاقات الدورات فوراً دائماً**، حتى لو تأخر اتصال Firebase لأي سبب:

```javascript
// رسم أولي فوري - لا ينتظر Firebase إطلاقاً
renderCategoryFilters();
renderCourses();

// تحديث حي بمجرد جاهزية البيانات الحقيقية
listenToWallet((balance, enrolled) => {
  currentBalance = balance;
  currentEnrolled = enrolled;
  renderCourses(); // يُعاد الرسم بالقيم الصحيحة
});
```

### 3. حماية مشابهة في `course-player.html`
أُضيفت بطاقة "⏳ جارٍ التحقق من اشتراكك..." تظهر مؤقتاً حتى تصل بيانات Firestore، بدلاً من ترك المستخدم أمام صفحة فارغة تماماً دون أي مؤشر.

### 4. تحسين Service Worker (منع مشاكل تخزين مؤقت مستقبلية)
غيّرت استراتيجية التخزين المؤقت لصفحات HTML من "Cache First" إلى **"Network First"** — أي أن المتصفح يحاول دائماً جلب أحدث نسخة من الشبكة أولاً، ولا يلجأ للنسخة المخزّنة إلا عند انعدام الاتصال بالإنترنت فقط. هذا يمنع تكرار مشاكل ظهور محتوى قديم عالق بعد التحديثات المستقبلية.

---

## 🚀 كيف تُطبّق هذا الإصلاح على مشروعك

الملفات المُصلحة جاهزة في هذه الحزمة الجديدة:
- `public/js/sync.js` (الإصلاح الجذري)
- `public/courses.html` (الحماية الإضافية)
- `public/course-player.html` (بطاقة التحميل المؤقتة)
- `public/service-worker.js` (نسخة v3، استراتيجية Network First)

```powershell
cd "C:\Users\HP\OneDrive - Hatif Libya\Desktop\pharmacademy"
git add .
git commit -m "Fix: courses and wallet not rendering due to auth race condition"
git push
```

بعد اكتمال النشر (تحقق من تبويب Actions)، **امسح ذاكرة التخزين المؤقت للمتصفح بالكامل** قبل الاختبار:
1. اضغط **F12** لفتح أدوات المطوّر.
2. اضغط تبويب **"Application"**.
3. من القائمة الجانبية، اضغط **"Service Workers"**.
4. اضغط **"Unregister"** بجانب أي service worker مسجّل لموقعك.
5. اضغط **"Clear storage"** من نفس القائمة الجانبية، ثم **"Clear site data"**.
6. أغلق التبويب تماماً وافتح رابط الموقع من جديد.

هذا يضمن عدم وجود أي نسخة قديمة عالقة من الملفات (خصوصاً `service-worker.js` القديم الذي كان يستخدم استراتيجية Cache First).

---

**« معايير الجودة في التعليم الصيدلي.. واحترافية الممارسة الإكلينيكية »**
