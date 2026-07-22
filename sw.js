const CACHE_NAME = "keefes-soiety-v77";
const CORE_SHELL = [
  "/",
  "/index.html",
  "/styles.css?v=77",
  "/resource-library.css?v=77",
  "/app.js?v=77",
  "/relationship-data.js?v=77",
  "/future-industry-ui.js?v=77",
  "/future-industry-data.js?v=77",
  "/climate-business-data.js?v=77",
  "/resource-library-ui.js?v=77",
  "/resource-library-data.js?v=77",
  "/glossary-master-data.js?v=77",
  "/manifest.json?v=77",
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
