// =====================================================================
// إعدادات Firebase - منصة الجودة للفارمسي أكاديمي
// Firebase Configuration - Al-Jawda Pharmacy Academy (JPA)
// Project: pharmacyacadimy ✅ مكتمل بالكامل
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

// تهيئة Firebase (Compat SDK - يعمل مباشرة عبر <script> بدون bundler)
firebase.initializeApp(firebaseConfig);

// تفعيل Google Analytics (اختياري - يعمل تلقائياً إن كانت مكتبة firebase-analytics-compat محمّلة في الصفحة)
if (typeof firebase.analytics === "function") {
  try { firebase.analytics(); } catch (e) { /* Analytics غير محمّلة في هذه الصفحة، لا مشكلة */ }
}

// خدمات يُعاد استخدامها في كل الصفحات
const auth = firebase.auth();
const db = firebase.firestore();

// تفعيل التخزين المحلي (Offline Persistence) حتى يعمل التطبيق
// ويُزامن تلقائياً عند عودة الاتصال بالإنترنت (مهم لتزامن الهاتف/الويب)
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Persistence: تبويبات متعددة مفتوحة، التخزين المؤقت معطل في هذه النافذة.");
  } else if (err.code === "unimplemented") {
    console.warn("Persistence: المتصفح لا يدعم هذه الميزة.");
  }
});
