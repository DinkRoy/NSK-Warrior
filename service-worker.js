const APP_CACHE = 'nsk-warrior-cache-v118';
const networkFirstFiles = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/booklet/booklet.css',
    '/booklet/booklet.js',
    '/booklet/pages/2.webp',
    '/versions/v1.1/v1-1-save-selector.html',
    '/versions/original/original-save-selector.html',
    '/versions/original/og-save-1.html',
    '/versions/original/og-save-2.html',
    '/versions/original/og-save-3.html',
    '/versions/original/og-save-4.html',
    '/versions/v1.1/v1-1-save-1.html',
    '/versions/v1.1/v1-1-save-2.html',
    '/versions/v1.1/v1-1-save-3.html',
    '/versions/v1.1/v1-1-save-4.html',
    '/scripts/auto-save-load/auto-save-load.js'
];
const urlsToCache = [
    '/',
    '/images/title.avif',
    '/booklet/booklet.css',
    '/booklet/booklet.js',
    '/booklet/jquery-3.7.1.min.js',
    '/booklet/panzoom.min.js',
    '/booklet/turn.min.js',
    '/booklet/manual_icon.webp',
    '/booklet/sounds/page_turn.mp3',
    '/booklet/sounds/slide_in.mp3',
    '/booklet/sounds/slide_out.mp3',
    '/booklet/pages/1.webp',
    '/booklet/pages/2.webp',
    '/booklet/pages/3.webp',
    '/booklet/pages/4.webp',
    '/booklet/pages/5.webp',
    '/booklet/pages/6.webp',
    '/booklet/pages/7.webp',
    '/booklet/pages/8.webp',
    '/booklet/pages/9.webp',
    '/booklet/pages/10.webp',
    '/booklet/pages/11.webp',
    '/booklet/pages/12.webp',
    '/booklet/pages/13.webp',
    '/booklet/pages/14.webp',
    '/booklet/pages/15.webp',
    '/booklet/pages/16.webp',
    '/booklet/pages/17.webp',
    '/booklet/pages/18.webp',
    '/booklet/pages/19.webp',
    '/booklet/pages/20.webp',
    'https://nsk-warrior-files.netlify.app/RPG Maker (USA).zip'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(APP_CACHE).then(cache => {
            return Promise.all(
                urlsToCache.map(url => {
                    return fetch(url).then(response => {
                        if (!response || !response.ok) {
                            throw new TypeError('Bad response status for ' + url);
                        }
                        // store the response in the cache
                        return cache.put(url, response);
                    }).catch(error => {
                        console.error('Failed to cache:', url, error);
                    });
                })
            );
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
    const requestUrl = new URL(event.request.url);
    
    if (networkFirstFiles.includes(requestUrl.pathname)) {
        // Network-first strategy for specific files
        event.respondWith(
            fetch(event.request, { cache: 'reload' })
            .then(networkResponse => {
                // If we got a valid response, cache it (only for GET)
                if (networkResponse && networkResponse.ok && event.request.method === 'GET') {
                    const responseClone = networkResponse.clone();
                    caches.open(APP_CACHE).then(cache => {
                        cache.put(event.request, responseClone).catch(err => {
                            // Some responses (opaque, cross-origin) may fail to be stored; handle gracefully
                            console.warn('Cache put failed for', event.request.url, err);
                        });
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // On failure, try the cache
                return caches.match(event.request);
            })
        );
    } else {
        // Cache-first strategy for all other files
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || event.request.method !== 'GET') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(APP_CACHE).then(cache => {
                        cache.put(event.request, responseToCache).catch(err => {
                            console.warn('Cache put failed for', event.request.url, err);
                        });
                    });
                    return networkResponse;
                }).catch(() => {
                    return caches.match(event.request);
                });
            })
        );
    }
});
