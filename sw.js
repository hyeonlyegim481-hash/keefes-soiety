importScripts("/app-version.js");

const APP_VERSION = String(self.KEEFES_APP_VERSION || "dev");
const CACHE_NAME = `keefes-society-v${APP_VERSION}`;
const RESOURCE_TIMEOUT_MS = 10_000;
const CORE_SHELL = [
  "/",
  "/index.html",
  "/app-version.js",
  "/runtime-loader.js",
  "/styles.css",
  "/app.js",
  "/economic-narrative.js",
  "/economic-graph.js",
  "/market-data.js",
  "/manifest.json",
  "/assets/econest-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        CORE_SHELL.map(async (asset) => {
          const response = await fetch(asset, { cache: "reload" });
          if (!response.ok) {
            throw new Error(`Core asset failed: ${asset} (${response.status})`);
          }
          await cache.put(asset, response);
        })
      );
      await self.skipWaiting();
    })().catch((error) => {
      console.error("[service-worker] install failed", error);
      throw error;
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })().catch((error) => {
      console.error("[service-worker] activation failed", error);
      throw error;
    })
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith("/api/")) return;
  if (requestUrl.origin !== location.origin || event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetchNavigation(event.request));
    return;
  }

  const networkFirst = ["script", "style", "worker", "manifest"].includes(
    event.request.destination
  );
  event.respondWith(
    networkFirst
      ? fetchAndCache(event.request)
      : caches.match(event.request).then(
          (cached) => cached || fetchAndCache(event.request)
        )
  );
});

async function fetchNavigation(request) {
  try {
    const response = await fetch(request, {
      signal: AbortSignal.timeout(3_500)
    });
    if (!response.ok) throw new Error(`Navigation failed: ${response.status}`);
    await cacheResponse("/index.html", response.clone());
    return response;
  } catch (error) {
    console.warn("[service-worker] using navigation fallback", error);
    const cached =
      (await caches.match(request)) ||
      (await caches.match("/index.html")) ||
      (await caches.match("/"));
    if (cached) return cached;
    throw error;
  }
}

async function fetchAndCache(request) {
  try {
    const response = await fetch(request, {
      signal: AbortSignal.timeout(RESOURCE_TIMEOUT_MS)
    });
    if (!response.ok) {
      throw new Error(`Resource failed: ${request.url} (${response.status})`);
    }
    await cacheResponse(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      console.warn("[service-worker] using cached resource", request.url, error);
      return cached;
    }
    console.error("[service-worker] resource unavailable", request.url, error);
    throw error;
  }
}

async function cacheResponse(request, response) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
  } catch (error) {
    console.warn("[service-worker] cache write failed", error);
  }
}
