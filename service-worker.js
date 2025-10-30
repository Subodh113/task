self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  event.waitUntil(
    caches.open("ehs-cache").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./styles/main.css",
        "./scripts/firebase-config.js",
        "./scripts/auth.js"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});