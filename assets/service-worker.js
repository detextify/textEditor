self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/bundle.js',
                '/quill.snow.css',
            ])
        }).then(() => {
            return self.skipWaiting();
        }).then(() => {
            console.log('The service worker has taken control')
        })
    )
})

self.addEventListener('activate', function (event) {
    console.log('activating!!!')
    return self.clients.claim();
})

self.addEventListener('fetch', function (event) {
    console.log('fetching ', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('message', ({ data }) => {
    self.registration.sync.register(data)
})

self.addEventListener('sync', function (event) {
    console.log('syncing data ', event.tag)

});