"use strict";

const cacheName = "v1";
const cacheFiles = [
    "../index.html",
    "../html/about.html",
    "../html/browsers.html",
    "../html/etc.html",
    "../html/lunch.html",
    "../html/schedule.html",
    "../html/settings.html",
    "../html/script3.js",
    "../css/reset.css",
    "../css/style.css",
    "../manifest.json"
];

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log("[Service Worker] Caching files ...");
            return cache.addAll(cacheFiles);
        })
    );
    console.log("... done");
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        // Get all the cache keys (cacheName)
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(thisCacheName) {

                // If a cached item is saved under a previous cacheName
                if (thisCacheName !== cacheName) {

                    // Delete that cached file
                    console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }));
        })
    );
});