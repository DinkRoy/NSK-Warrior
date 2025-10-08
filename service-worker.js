const APP_CACHE = 'nsk-warrior-cache-v06';

const networkFirstFiles = [
    '/index.html',
    '/app.js',
    '/scripts/auto-save-load.js',
    '/manifest.json',
    '/scripts/gamepad.js'
];

const urlsToCache = [
    '/',
    '/booklet/booklet.css',
    '/booklet/booklet.js',
    '/booklet/panzoom.min.js',
    '/booklet/turn.min.js',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js'
];

self.addEventListener('install', event => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(APP_CACHE)
        .then(cache => {
            console.log('Opened cache. Caching core assets.');
            return cache.addAll(urlsToCache); 
        })
        .catch(error => {
            console.error('Failed to cache core assets during install:', error);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== APP_CACHE)
                .map(key => caches.delete(key))
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);

    if (networkFirstFiles.includes(requestUrl.pathname)) {
        event.respondWith(
            fetch(event.request)
            .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    let responseClone = networkResponse.clone();
                    caches.open(APP_CACHE).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request);
            })
        );
        return; 
    }

    // Stale-While-Revalidate
    event.respondWith(
        caches.open(APP_CACHE).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(error => {
                  console.warn('Fetch failed; returning cached response if available.', error);
                });
                return cachedResponse || fetchPromise;
            });
        })
    );
});
