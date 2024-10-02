self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Return the cached response if found
                }
                return fetch(event.request).then(networkResponse => {
                    return caches.open('dynamic-cache').then(cache => {
                        cache.put(event.request, networkResponse.clone()); // Cache the new response
                        return networkResponse;
                    });
                });
            })
    );
});
