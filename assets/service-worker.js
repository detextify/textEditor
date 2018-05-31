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
    const cachePromise = caches.match(event.request)
    log('attempting to fetch ', url)

    const fetchPromise = new Promise((resolve, reject) => {
        const timeoutID = setTimeout(() => (log('timeout fetching ', url), reject('request timed out')), SERVER_TIMEOUT)

        fetch(event.request)
            .then(response => {
                clearTimeout(timeoutID)
                log('fetched ', url)
                resolve(response.clone())
                caches.open('app').then(cache => (log('caching ', url), cache.put(url, response.clone())))
                return
            }).catch(() => {
                log('fetching failed for ', url)
                return 'failure'
                // return self.registration.sync.register('sync app')
            })
    })

    fetchPromise.then(
        (response) => {
            //update cache
            return response
        },

        () => {
            log('loading cached asset ', cachePromise)
            return true
            return cachePromise.then(
                response => (log(response ? `found response in cache ${JSON.stringify(response)}` : 'no response cached'), response),
                (err) => log('could not load from cache ', err)
            )
        }
    )

    event.respondWith(fetchPromise);
});

self.addEventListener('message', ({ data }) => {
    //add to cache
    self.registration.sync.register(data)
})

self.addEventListener('sync', function (event) {
    console.log('syncing data ', event.tag)
    caches.open('app').then(cache => cache.add(event.request))

});