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
    "/views/about.html",
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
                    // TODO: refresh caches
                    /*
                    if (response.type === "cors" && evnt.clientId) {
                        refreshCacheEntry(evnt.request, evnt.clientId);
                    }

                     */
                    return response;
                }
                return fetch(evnt.request).then(
                    function(response) {
                        if (
                            !response ||
                            response.status !== 200 ||
                            (response.type !== "basic" &&
                            response.type !== "cors")
                        ) {
                            return response;
                        }

                        const RESPONSE_TO_CACHE = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(evnt.request, RESPONSE_TO_CACHE);
                            });
                        
                        return response;
                    }
                );
            })
    );
});

async function refreshCacheEntry(request, clientID) {
    fetch(request)
        .then(async response => {

            const client = await self.clients.get(clientID);

            client.postMessage({
                URL: request.url,
                response: response
            });
            //caches.match(request)
        })
}
