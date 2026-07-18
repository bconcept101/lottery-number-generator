const PILOT_CACHE = "pilot-number-pwa-v1";
const CORE_ASSETS = [
  "/",
  "/about",
  "/disclaimer",
  "/support",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(PILOT_CACHE).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key !== PILOT_CACHE;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  const freshOnlyFiles = [
    "/latest-results.js",
    "/latest-results-display.js",
    "/analytics-tracker.js"
  ];

  if (freshOnlyFiles.includes(url.pathname) || url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          const copy = response.clone();
          caches.open(PILOT_CACHE).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match("/");
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      const fetchPromise = fetch(request).then(function (response) {
        const copy = response.clone();
        caches.open(PILOT_CACHE).then(function (cache) {
          cache.put(request, copy);
        });
        return response;
      });
      return cached || fetchPromise;
    })
  );
});
