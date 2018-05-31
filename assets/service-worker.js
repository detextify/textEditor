const log = console.log

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('app')
            .then((cache) => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/bundle.js',
                    '/quill.snow.css',
                    '/textEditor.css'
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
    event.waitUntil(() => self.clients.claim())
})

self.addEventListener('fetch', function (event) {
    // console.log('fetching ', event.request.url);
    const SERVER_TIMEOUT = 400
    const url = event.request.url
    const cachePromise = caches.match(event.request).catch(() => log('could find in cache ', url))
    log('attempting to fetch ', url)

    const fetchPromise = new Promise((resolve, reject) => {
        const timeoutID = setTimeout(() => (log('timeout fetching ', url), reject('request timed out')), SERVER_TIMEOUT)

        fetch(event.request)
            .then(response => {
                clearTimeout(timeoutID)
                // log('fetched ', url)
                resolve(response.clone())
                caches.open('app').then(cache => (log('fetched and cached', url), cache.put(url, response.clone())))
                return
            }).catch(() => {
                log('fetching failed for ', url, '\nscheduling sync')
                self.registration.sync.register(url)
                // console.log(registration)
            })
    }).catch(() => {
        log('loading from cache ', url)
        return cachePromise
    })

    event.respondWith(fetchPromise);
});


self.addEventListener('sync', function (event) {
    console.log('syncing ', event.tag)
    event.waitUntil(syncTest(event.tag));
});

function syncTest(url) {
    return caches.open('app')
        .then(cache => {
            return cache.add(url);
        })
        .catch(() => {
            log(`unable to sync ${url} `)
            return Promise.reject('fail promise')
        })
}