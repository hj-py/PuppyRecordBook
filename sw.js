const cacheName = "puppy-record-book-v109";
const appShell = ["./", "./index.html", "./styles.css", "./sync-core.js", "./record-editing.js", "./app.js", "./quick-widget.html", "./quick-widget.js", "./quick-widget.css", "./manifest.json", "./icon.svg", "./apple-touch-icon-v34.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(appShell)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(cacheName).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) {
            return cached;
          }
          return event.request.mode === "navigate" ? caches.match("./index.html") : Response.error();
        })
      )
  );
});
