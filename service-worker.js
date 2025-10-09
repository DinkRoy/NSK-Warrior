const APP_CACHE = 'nsk-warrior-cache-v07';

const networkFirstFiles = [
    '/index.html',
    '/app.js',
    '/scripts/auto-save-load/auto-save-load.js',
    '/scripts/auto-save-load/auto-save-load.css',
    '/manifest.json',
    '/scripts/gamepad.js'
];

// Precache for offline
const urlsToCache = [
    '/',
    '/booklet/booklet.css',
    '/booklet/booklet.js',
    '/booklet/panzoom.min.js',
    '/booklet/turn.min.js',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js',
    '/booklet/manual_icon.webp',
    'https://nsk-warrior-kf-files.netlify.app/images/title.avif',
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
    '/emulatorjs/4.0.9/data/',
    '/emulatorjs/4.0.9/data/loader.js',
    'https://nsk-warrior-kf-files.netlify.app/RPG Maker (USA).zip',
    'https://nsk-warrior-kf-files.netlify.app/scph5501.bin',
    'https://nsk-warrior-kf-files.netlify.app/RPG Maker (USA).state'
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
