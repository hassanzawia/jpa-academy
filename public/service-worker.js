// Service Worker بسيط للعمل دون اتصال (Offline-first shell)
const CACHE_NAME = "jpa-academy-v2";
const ASSETS = [
  "index.html",
  "login.html",
  "courses.html",
  "course-player.html",
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
  // لا نُخزّن مؤقتاً طلبات Firebase أو Google Drive حتى تبقى البيانات والفيديوهات محدّثة دائماً
  if (event.request.url.includes("firestore.googleapis.com") ||
      event.request.url.includes("identitytoolkit.googleapis.com") ||
      event.request.url.includes("drive.google.com")) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
