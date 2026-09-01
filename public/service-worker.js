// Service Worker - نسخة v3
// 🔧 إصلاح مهم: تحويل استراتيجية تحميل صفحات HTML إلى "الشبكة أولاً" (Network First)
// بدلاً من "التخزين المؤقت أولاً" (Cache First)، لمنع ظهور نسخ قديمة عالقة من الصفحة
// بعد كل تحديث (مثل المشكلة التي حدثت سابقاً مع courses.html).
const CACHE_NAME = "jpa-academy-v3";
const ASSETS = [
  "css/style.css",
  "js/firebase-config.js",
  "js/auth.js",
  "js/sync.js",
  "js/courses-data.js",
  "manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // لا نتدخل إطلاقاً في طلبات Firebase أو Google Drive - يجب أن تصل الشبكة دائماً
  if (url.includes("firestore.googleapis.com") ||
      url.includes("identitytoolkit.googleapis.com") ||
      url.includes("drive.google.com") ||
      url.includes("googleapis.com")) {
    return;
  }

  // لصفحات HTML (التنقل بين الصفحات): الشبكة أولاً، ثم التخزين المؤقت كخطة بديلة فقط
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // لباقي الملفات الثابتة (CSS/JS): التخزين المؤقت أولاً لسرعة أعلى
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
