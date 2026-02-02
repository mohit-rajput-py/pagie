const CACHE_NAME = 'pagie-public-cache-v2';

// Install event: Skip waiting to activate immediately
self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

// Activate event: Claim clients to control them immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // cleanup old caches if any
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((name) => {
                        if (name !== CACHE_NAME) {
                            return caches.delete(name);
                        }
                    })
                );
            }),
        ])
    );
});

// Helper to check if URL is a public document
// Public docs format: /[slug]-[id] where ID is 24 hex chars
function isPublicDocumentUrl(url) {
    try {
        const { pathname } = new URL(url);
        // Exclude root (editor), internal paths, and non-document pages
        if (pathname === '/' || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
            return false;
        }
        // Match strict pattern for public docs: ending in 24 hex chars
        return /[0-9a-fA-F]{24}$/.test(pathname);
    } catch {
        return false;
    }
}

// Fetch event
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = request.url;

    // 1. Only handle GET requests
    if (request.method !== 'GET') return;

    // 2. Only handle Navigation requests (HTML pages)
    if (request.mode === 'navigate') {
        // 3. Filter for Public Documents ONLY
        if (!isPublicDocumentUrl(url)) {
            return;
        }

        // "Network-first on first visit, then cache-first"
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    // Cache Hit: Verify it actually has content
                    // Sometimes 0-byte responses get cached, we should treat them as misses
                    // But reading body here is expensive, relying on previous fixes
                    return cachedResponse;
                }

                // Cache Miss: Go to Network
                return fetch(request)
                    .then((response) => {
                        // Check for valid response
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        // Valid public page -> Cache it
                        // Clone the response because it's a stream
                        const responseToCache = response.clone();

                        // Fix for 0-byte (Empty) Cache Issue:
                        // Explicitly read the body to a Blob to ensure the stream is fully consumed and buffered.
                        // This prevents caching empty streams if the network stream behaves unexpectedly.
                        responseToCache.blob().then(body => {
                            if (body.size > 0) {
                                // Reconstruct response to strip 'Vary' header
                                // 'Vary' headers can cause cache miss/corruption in some browsers/Next.js setups
                                const newHeaders = new Headers(responseToCache.headers);
                                newHeaders.delete('Vary');

                                const newResponse = new Response(body, {
                                    status: responseToCache.status,
                                    statusText: responseToCache.statusText,
                                    headers: newHeaders
                                });

                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(request, newResponse);
                                });
                            }
                        }).catch(err => console.error("Cache buffering failed:", err));

                        // Return the original response stream to the browser immediately
                        return response;
                    })
                    .catch((err) => {
                        console.error('Fetch failed:', err);
                        throw err;
                    });
            })
        );
    }
});
