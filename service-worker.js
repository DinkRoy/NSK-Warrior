const APP_CACHE = 'nsk-warrior-cache-v6';

const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/RPG Maker (USA).zip',
    '/RPG Maker (USA).state',
    '/scph5501.bin',
    '/images/manual_icon_sm.png',
    '/images/title.webp',
    '/sound/page-turn.mp3',
    '/sound/slide-in.mp3',
    '/sound/slide-out.mp3',
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

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== APP_CACHE)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim(); 
});

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
