// Hand-rolled service worker (no Workbox/Serwist — @serwist/next's webpack
// plugin doesn't support this project's Turbopack dev server, see plan notes).
// Strategy: cache-first for static assets, network-first for page navigations
// (so users get fresh, locale-correct HTML when online, and a last-known
// copy — or the precached /offline page — when they aren't), API requests
// pass through untouched (never cached, since they're mutation-heavy).

const APP_SHELL_CACHE = "app-shell-v1";
const RUNTIME_CACHE = "runtime-v1";

const APP_SHELL_URLS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/apple-touch-icon.png" ||
    url.pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|svg|webp|woff2?|ttf)$/.test(url.pathname)
  );
}

async function networkFirstNavigate(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const runtimeCache = await caches.open(RUNTIME_CACHE);
    const cached = await runtimeCache.match(request);
    if (cached) return cached;
    const shellCache = await caches.open(APP_SHELL_CACHE);
    const offline = await shellCache.match("/offline");
    return offline || new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("", { status: 504 });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigate(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
