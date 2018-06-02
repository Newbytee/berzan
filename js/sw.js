if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register('js/worker.js').then(function(registration) {
        console.log('Service worker registration succeeded: ', registration);
    }).catch(function(error) {
        console.log('Service worker registration failed: ', error);
    });

} else {

    console.log('Service workers are not supported');

}

self.addEventListener('fetch', function(e){

});