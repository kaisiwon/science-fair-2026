const CACHE_NAME = 'mathquest-v2'; // Updated cache name
const URLS_TO_CACHE = [
    './index.html',
    './game-select.html',
    './number-forge.html',
    './lava-balance.html',
    './market-tycoon.html',
    './number-forge.css',
    './lava-balance.css',
    './market-tycoon.css',
    './login.css',
    './game-select.css',
    './login.js',
    './game-select.js',
    './number-forge.js',
    './lava-balance.js',
    './market-tycoon.js'
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
    // Force the waiting service worker to become the active service worker.
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(URLS_TO_CACHE);
            }).catch(err => console.error('Failed to cache', err))
    );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
    // We only want to handle GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    // We only want to handle http and https requests.
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Check if we received a valid response
                        // Only cache basic responses (same-origin). Opaque responses (cross-origin without CORS) have a status of 0, which we don't want to cache.
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                ).catch(err => {
                    // This is likely a network error, such as being offline.
                    // The request will fail, but we can't do much about it here.
                    console.log('Service Worker: Fetch failed:', err);
                    // Optionally, you could return a fallback offline page here.
                });
            })
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control of all open pages
    return self.clients.claim();
});