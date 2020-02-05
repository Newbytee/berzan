"use strict";

const CACHE_NAME = "berzanjs-cache-v1";
const URLS_TO_CACHE = [
    "/",
    "/css/style.css",
    "/js/index.js",
    "/js/settings.js",
    "/js/utils.js",
    "/views/neoschedule.html",
    "/views/etc.html",
    "/views/settings.html",
    "/manifest.json",
    "/img/logo/logo-512.png",
    "https://cdnjs.cloudflare.com/ajax/libs/slideout/1.0.1/slideout.js"
];

self.addEventListener("install", function(evnt) {
    evnt.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log("Opened cache");
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

self.addEventListener("fetch", function(evnt){
    evnt.respondWith(
        caches.match(evnt.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(evnt.request);
            })
    );
});
