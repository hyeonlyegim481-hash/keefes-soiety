const CACHE_NAME = "keefes-soiety-v42";
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/news-content.js",
  "/glossary-data.js",
  "/glossary-extra-data.js",
  "/glossary-more-data.js",
  "/glossary-pro-data.js",
  "/quiz-data.js",
  "/quiz-scenario-extra-data.js",
  "/manifest.json",
  "/assets/econest-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith("/api/")) return;
  if (requestUrl.origin !== location.origin || event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
  );
});

