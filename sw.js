const CACHE_NAME = "keefes-society-v87";
const CORE_SHELL = [
  "/",
  "/index.html",
  "/styles.css?v=87",
  "/future-industry.css?v=87",
  "/future-outlook.css?v=87",
  "/future-outlook-ui.js?v=87",
  "/future-outlook-data.js?v=87",
  "/politics.css?v=87",
  "/app.js?v=87",
  "/politics-ui.js?v=87",
  "/politics-data.js?v=87",
  "/economic-narrative.js?v=87",
  "/manifest.json?v=87",
  "/assets/econest-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(CORE_SHELL.map((asset) => cache.add(asset)))
    )
  );
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

  if (event.request.mode === "navigate") {
    event.respondWith(fetchNavigation(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetchAndCache(event.request))
  );
});

async function fetchNavigation(request) {
  try {
    const response = await fetch(request, { signal: AbortSignal.timeout(3_500) });
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put("/index.html", response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return (
      (await caches.match(request)) ||
      (await caches.match("/index.html")) ||
      (await caches.match("/"))
    );
  }
}

async function fetchAndCache(request) {
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}
