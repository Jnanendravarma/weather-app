// Service Worker for WeatherSphere PWA
// Bump version to force cache clear on every deploy
const CACHE_NAME = 'weathersphere-v5';

// Install — skip waiting so new SW activates immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(['/manifest.json']).catch(() => {});
        })
    );
});

// Activate — delete ALL old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(names.map((name) => {
                if (name !== CACHE_NAME) return caches.delete(name);
            }))
        ).then(() => self.clients.claim())
    );
});

// Fetch — Network-first for HTML and JS so updates always show
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Never cache API calls or external CDN resources
    if (url.pathname.startsWith('/api') || url.hostname !== self.location.hostname) {
        return;
    }

    // Network-first for HTML and JS files (always fresh)
    if (url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname === '/') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for other static assets
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            });
        })
    );
});