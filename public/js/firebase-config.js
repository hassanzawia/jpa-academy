// =====================================================================
// إعدادات Firebase - منصة الجودة للفارمسي أكاديمي
// Firebase Configuration - Al-Jawda Pharmacy Academy (JPA)
// Project: pharmacyacadimy
//
// 🔧 إصلاح مهم (بناءً على تشخيص فعلي عبر debug-logger):
// تم تعطيل enablePersistence() مؤقتاً. اكتشفنا أن عملية تسجيل الدخول
// كانت "تتجمّد" بصمت تحديداً بعد نجاح المصادقة، عند أول عملية كتابة
// (update) على Firestore - وهذا يتطابق مع مشاكل معروفة لـ IndexedDB
// Persistence على بعض متصفحات الهواتف (خصوصاً في وضع التصفح الخاص،
// أو تحت قيود تخزين معيّنة، أو تعارض بين عدة تبويبات). تعطيل هذه
// الميزة يعني فقدان العمل بدون اتصال إنترنت، لكنه يضمن عدم تجمّد أي
// عملية كتابة/قراءة بصمت بدون أي رسالة خطأ.
// =====================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAhqeuGr5jN69TfyeQnDxRiQ-dQvieNxdg",
  authDomain: "pharmacyacadimy.firebaseapp.com",
  projectId: "pharmacyacadimy",
  storageBucket: "pharmacyacadimy.firebasestorage.app",
  messagingSenderId: "78419011632",
  appId: "1:78419011632:web:1432df05befac9dccfe5f5",
  measurementId: "G-XZWTZ2EN5D"
};

firebase.initializeApp(firebaseConfig);

if (typeof firebase.analytics === "function") {
  try { firebase.analytics(); } catch (e) { /* لا مشكلة إن لم تكن محمّلة */ }
}

const auth = firebase.auth();
const db = firebase.firestore();

// 🔧 تم تعطيل enablePersistence() مؤقتاً - كانت السبب المُشتبه به الأول
// في تجمّد عمليات الكتابة على بعض متصفحات الهواتف. إن أُكِّد أنها السبب
// الفعلي، يمكن حذف هذا التعليق نهائياً في تحديث لاحق.
//
// db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
//   if (err.code === "failed-precondition") {
//     console.warn("Persistence: تبويبات متعددة مفتوحة.");
//   } else if (err.code === "unimplemented") {
//     console.warn("Persistence: المتصفح لا يدعم هذه الميزة.");
//   }
// });

if (typeof dlog === "function") {
  dlog("firebase-config.js: initializeApp + auth + db ready (persistence DISABLED for diagnosis)");
}
