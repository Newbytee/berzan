if ("serviceWorker" in navigator) {
    console.log("Installing service worker ...");
    navigator.serviceWorker.register('js/worker.js').then(function(registration) {
        console.log("... done  (" + registration + ")");
    }).catch(function(error) {
        console.log("... failed (" + error + ")");
    });
} else {
    console.log("Service workers are not supported");
}

self.addEventListener("fetch", function(e){

});