if ("serviceWorker" in navigator) {
    console.log("[Service Worker] Installing service worker ...");
    navigator.serviceWorker.register("js/sw.js").then(function(registration) {
        console.log("[Service Worker]  ... done  (" + registration + ")");
    }).catch(function(error) {
        console.log("[Service Worker] ... failed (" + error + ")");
    });
} else {
    console.log("[Service Worker] Service workers are not supported");
}

self.addEventListener("fetch", function(e){

});