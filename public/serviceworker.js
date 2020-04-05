const filesCacheList = [
    "/",
    "/budgetdb.js",
    "/index.html",
    "/index.js",
    "/manifest.json",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
  ];
  
  const CACHEV1 = "cache-v1";
  const DATACACHEV1 = "datacache-v1";
  
  //set up cache
  self.addEventListener("install", event => {
    event.waitUntil(
      caches.open(CACHEV1)
        .then(cache => cache.addAll(filesCacheList))
        .then(self.skipWaiting())
    );
  });
  
  // Clean up old cache(s)
  self.addEventListener("activate", event => {
    const currentCaches = [CACHEV1, DATACACHEV1];
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      }).then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          return caches.delete(cacheToDelete);
        }));
      }).then(() => self.clients.claim())
    );
  });
  
  //fetch from cache
  self.addEventListener("fetch", event => {
    if (event.request.url.startsWith("/api/")) {
      event.respondWith(
        caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
  
          return caches.open(DATACACHEV1).then(cache => {
            return fetch(event.request).then(response => {
              return cache.put(event.request, response.clone()).then(() => {
                return response;
              });
            });
          });
        })
      );
    }
  });