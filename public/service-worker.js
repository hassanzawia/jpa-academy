// Service Worker بسيط للعمل دون اتصال (Offline-first shell)
const CACHE_NAME = "jpa-academy-v1";
const ASSETS = [
  "index.html",
  "login.html",
  "pilot.html",
  "css/style.css",
  "js/firebase-config.js",
  "js/auth.js",
  "js/sync.js",
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
  if (event.request.url.includes("firestore.googleapis.com") ||
      event.request.url.includes("identitytoolkit.googleapis.com")) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
