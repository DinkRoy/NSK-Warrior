const APP_CACHE = 'nsk-warrior-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/RPG Maker (USA).zip',
    '/RPG Maker (USA).state',
    '/scph5501.bin',
    '/images/manual_icon_sm.png',
    '/images/title.gif',
    '/sound/page-turn.mp3',
    '/sound/slide-in.mp3',
    '/sound/slide-out.mp3',
    '/booklet/pages1/1.webp',
    '/booklet/pages1/2.webp',
    '/booklet/pages1/3.webp',
    '/booklet/pages1/4.webp',
    '/booklet/pages1/5.webp',
    '/booklet/pages1/6.webp',
    '/booklet/pages1/7.webp',
    '/booklet/pages1/8.webp',
    '/booklet/pages1/9.webp',
    '/booklet/pages1/10.webp',
    '/booklet/pages1/11.webp',
    '/booklet/pages1/12.webp',
    '/booklet/pages1/13.webp',
    '/booklet/pages1/14.webp',
    '/booklet/pages1/15.webp',
    '/booklet/pages1/16.webp',
    '/booklet/pages1/17.webp',
    '/booklet/pages1/18.webp',
    '/booklet/pages1/19.webp',
    '/booklet/pages1/20.webp',
    '/booket/booklet.js',
    '/booklet/panzoom.min.js',
    '/booklet/turn.min.js',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js', 
    'https://cdn.emulatorjs.org/4.0.9/data/emulator.min.js',
    'https://cdn.emulatorjs.org/4.0.9/data/loader.js',
    'https://cdn.emulatorjs.org/4.0.9/data/emulator.min.css',
    'https://cdn.emulatorjs.org/4.0.9/data/cores/mednafen_psx_hw-wasm.data',
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(APP_CACHE)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate the service worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [APP_CACHE];
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (!cacheWhitelist.includes(key)) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

// Fetch event to handle caching and partial responses
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(APP_CACHE)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return networkResponse;
                }).catch(() => {
                    return caches.match(event.request);
                });
            })
    );
});
