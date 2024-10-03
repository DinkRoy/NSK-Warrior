const APP_CACHE = 'nsk-warrior-cache-v1';
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
    '/booklet/pages/1.jpg',
    '/booklet/pages/2.jpg',
    '/booklet/pages/3.jpg',
    '/booklet/pages/4.jpg',
    '/booklet/pages/5.jpg',
    '/booklet/pages/6.jpg',
    '/booklet/pages/7.jpg',
    '/booklet/pages/8.jpg',
    '/booklet/pages/9.jpg',
    '/booklet/pages/10.jpg',
    '/booklet/pages/11.jpg',
    '/booklet/pages/12.jpg',
    '/booklet/pages/13.jpg',
    '/booklet/pages/14.jpg',
    '/booklet/pages/15.jpg',
    '/booklet/pages/16.jpg',
    '/booklet/pages/17.jpg',
    '/booklet/pages/18.jpg',
    '/booklet/pages/19.jpg',
    '/booklet/pages/20.jpg',
    '/booket/booklet.js',
    '/booklet/panzoom.min.js',
    '/booklet/turn.min.js',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js', 
    'https://cdn.emulatorjs.org/4.0.9/data/emulator.min.js',
    'https://cdn.emulatorjs.org/4.0.9/data/loader.js',
    'https://cdn.emulatorjs.org/4.0.9/data/emulator.min.css',
];

self.addEventListener('install', event => {
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
