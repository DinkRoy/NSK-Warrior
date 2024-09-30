const CACHE_NAME = 'game-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/RPG Maker (USA).zip',
    '/*.state',
    '/images/*',
    '/sound/*',
    '/booklet/pages/*',
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
                return response || fetch(event.request);
            })
    );
});
