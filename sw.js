"use strict";

if ("serviceWorker" in navigator) {
    console.log("[Service Worker] Installing service worker ...");
    navigator.serviceWorker.register("sw.js").then(function(registration) {
        console.log("[Service Worker] ... done  (" + registration + ")");
    }).catch(function(error) {
        console.log("[Service Worker] ... failed (" + error + ")");
    });
} else {
    console.log("[Service Worker] Service workers are not supported (don't listen to me, I'm usually wrong on this one)");
}

self.addEventListener("fetch", function(e){

});