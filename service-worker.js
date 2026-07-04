const CACHE_NAME = 'number-forge-v1';
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
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});