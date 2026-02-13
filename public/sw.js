// Self-destructing Service Worker
// This ensures that any old service worker is replaced, and we do NOT cache anything.

const CACHE_NAME = 'pagie-cleanup-v1';

self.addEventListener('install', (event) => {
    // Force this new SW to become the active one immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Claim any clients immediately, so they are controlled by this new, empty SW
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Clear any old caches we might have missed
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((name) => {
                        console.log('SW: Deleting cache', name);
                        return caches.delete(name);
                    })
                );
            }),
        ])
    );
});

// Fetch event: Network only
self.addEventListener('fetch', (event) => {
    // Do not cache anything. Just pass the request through.
    // If we want to be absolutely sure, we can just not add a fetch listener,
    // but adding one that does nothing (or just returns fetch) ensures we override any old behavior if it somehow persists (unlikely if 'activate' works).
    // Actually, simply NOT having a fetch listener causes the browser to go to network by default for everything.
    // However, to be explicit and safe against weird browser behaviors during transition:
    // We will NOT call event.respondWith(), letting the browser handle it naturally (Network).
    // Or we can explicitly respond with fetch(event.request) if we wanted to intercept.
    // Defaulting to "do nothing" in fetch allows standard browser network behavior.
});
