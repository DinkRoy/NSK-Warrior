const APP_CACHE = 'nsk-warrior-cache-v06';

// Files that should always be fresh (Network-First)
const networkFirstFiles = [
    '/index.html',
    '/app.js',
    '/scripts/auto-save-load.js',
    '/manifest.json',
    '/scripts/gamepad.js'
];

// Core assets to pre-cache for offline functionality (Stale-While-Revalidate)
const urlsToCache = [
    '/',
    '/booklet/booklet.css',
    '/booklet/booklet.js',
    '/booklet/panzoom.min.js',
    '/booklet/turn.min.js',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js',
    // It's better to let large files be cached on-demand rather than pre-caching.
    // '/RPG Maker (USA).zip', 
    // '/RPG Maker (USA).state'
];

// --- INSTALL ---
// Use a cleaner, more robust install process
self.addEventListener('install', event => {
    self.skipWaiting(); // Make the new SW active immediately
    event.waitUntil(
        caches.open(APP_CACHE)
        .then(cache => {
            console.log('Opened cache. Caching core assets.');
            return cache.addAll(urlsToCache); // addAll() is atomic. If one file fails, the whole operation fails.
        })
        .catch(error => {
            console.error('Failed to cache core assets during install:', error);
        })
    );
});

// --- ACTIVATE ---
// Your activate event is perfect, no changes needed here.
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

// --- FETCH ---
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);

    // Network-First strategy for specific, critical files
    if (networkFirstFiles.includes(requestUrl.pathname)) {
        event.respondWith(
            fetch(event.request)
            .then(networkResponse => {
                // If the fetch is successful, cache the new response
                if (networkResponse && networkResponse.status === 200) {
                    let responseClone = networkResponse.clone();
                    caches.open(APP_CACHE).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // If the network fails, serve from the cache as a fallback
                return caches.match(event.request);
            })
        );
        return; // End execution here for this strategy
    }

    // Stale-While-Revalidate strategy for all other requests
    event.respondWith(
        caches.open(APP_CACHE).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                // Fetch from the network in the background to update the cache
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // Check for a valid response
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(error => {
                  console.warn('Fetch failed; returning cached response if available.', error);
                });

                // Return the cached response immediately if it exists, otherwise wait for the network
                return cachedResponse || fetchPromise;
            });
        })
    );
});
