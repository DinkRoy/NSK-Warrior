const APP_CACHE = 'nsk-warrior-cache-v' + new Date().getTime(); // Auto-versioning

const networkFirstFiles = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/scripts/auto-save-load/auto-save-load.js',
    '/scripts/auto-save-load/auto-save-load.css',
    '/booklet/booklet.css',
    '/booklet/booklet.js',
    '/scripts/gamepad.js',
    'https://nsk-warrior-kf-files.netlify.app/RPG Maker (USA).state'
];

// Core assets to pre-cache for offline functionality
const urlsToCache = [
    '/',
    '/booklet/panzoom.min.js',
    '/booklet/turn.min.js',
    '/booklet/jquery-3.7.1.min.js',
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
    'https://nsk-warrior-kf-files.netlify.app/scph5501.bin'
];

// --- INSTALL ---
self.addEventListener('install', event => {
    self.skipWaiting();
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(APP_CACHE)
        .then(cache => {
            console.log('Service Worker: Caching core assets');
            // Use Promise.all to handle individual cache failures gracefully
            return Promise.all(
                urlsToCache.map(url => {
                    return cache.add(url).catch(error => {
                        console.warn(`Service Worker: Failed to cache ${url}`, error);
                    });
                })
            );
        })
        .then(() => {
            console.log('Service Worker: Install completed');
        })
    );
});

// --- ACTIVATE ---
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== APP_CACHE) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Now controlling clients');
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
    
    // Check if this is a network-first file
    const isNetworkFirst = networkFirstFiles.some(path => {
        // More flexible matching for paths
        return requestUrl.pathname === path ||
            requestUrl.pathname.startsWith(path) ||
            (path === '/' && requestUrl.pathname === '/index.html');
    });
    
    if (isNetworkFirst) {
        console.log('Service Worker: Network-first strategy for', requestUrl.pathname);
        event.respondWith(
            fetch(event.request, {
                cache: 'no-cache'
            })
            .then(networkResponse => {
                // Only cache successful responses
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(APP_CACHE).then(cache => {
                        console.log('Service Worker: Updating cache for', requestUrl.pathname);
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(error => {
                console.warn('Service Worker: Network failed, falling back to cache for', requestUrl.pathname, error);
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // If no cache, return a fallback or error
                        return new Response('Network error and no cached version available', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
        );
        return;
    }
    
    // Stale-While-Revalidate for all other requests
    console.log('Service Worker: Stale-while-revalidate for', requestUrl.pathname);
    event.respondWith(
        caches.open(APP_CACHE).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                // Always fetch in background to update cache
                const fetchPromise = fetch(event.request, {
                        cache: 'no-cache'
                    })
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            console.log('Service Worker: Updating cache in background for', requestUrl.pathname);
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    })
                    .catch(error => {
                        console.warn('Service Worker: Background fetch failed for', requestUrl.pathname, error);
                    });
                
                // Return cached version immediately, or wait for network if no cache
                return cachedResponse || fetchPromise;
            });
        })
    );
});
