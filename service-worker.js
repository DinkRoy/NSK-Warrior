const CACHE_NAME = 'game-app-cache-v1';
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
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request).then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
    );
});
