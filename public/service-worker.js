const FILES_TO_CACHE = [
"/",
 "/index.html",
 "/styles.css",
 "/index.js",
 "/offlineIndex.js",
 "/icons/icon-192x192.png",
 "/icons/icon-512x512.png",
 "/manifest.webmanifest",
];


const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// TODO: add listener and handler to retrieve static assets from the Cache Storage in the browser 
// install
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
    evt.waitUntil(
    caches.keys().then(keyList => {
    return Promise.all(
        keyList.map(key => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
        console.log("Removing old cache data", key);
         return caches.delete(key);
        }
        })
        );
    })
    );

    self.clients.claim();
});


self.addEventListener("fetch", function (evt) {
    // cache successful requests to the API
    if (evt.request.url.includes("/api/")) {
    evt.respondWith(
    caches.open(DATA_CACHE_NAME).then(cache => {
      return fetch(evt.request)
        .then(response => {
        // Check for response..
        if (response.status === 200) {
        cache.put(evt.request.url, response.clone());
        }

                        return response;
                    })
                    .catch(err => {
                        // Network request failed, try to get it from the cache.
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );

        return;
    }

    // Checking for event response.
    evt.respondWith(
    caches.match(evt.request).then(function (response) {
    return response || fetch(evt.request);
        })
    );
});
