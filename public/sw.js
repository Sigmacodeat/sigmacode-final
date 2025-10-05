// Service Worker for SIGMACODE AI PWA
const CACHE_NAME = 'sigmacode-v1.0.0';
const STATIC_CACHE = 'sigmacode-static-v1';
const DYNAMIC_CACHE = 'sigmacode-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/manifest.json',
  '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(function (cache) {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(function () {
        return self.skipWaiting();
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (name) {
              return name !== STATIC_CACHE && name !== DYNAMIC_CACHE;
            })
            .map(function (name) {
              return caches.delete(name);
            }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', function (event) {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request).then(function (cachedResponse) {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fetch from network
      return fetch(request)
        .then(function (response) {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          // Cache successful responses
          caches.open(DYNAMIC_CACHE).then(function (cache) {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(function () {
          // Return offline page for navigation requests
          if (request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
    }),
  );
});

// Background sync for offline actions
self.addEventListener('sync', function (event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('Background sync triggered'),
    );
  }
});

// Push notification handling
self.addEventListener('push', function (event) {
  if (!event.data) return;

  const options = {
    body: event.data.text(),
    icon: '/favicon-32x32.png',
    badge: '/favicon-16x16.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Öffnen',
        icon: '/favicon-32x32.png',
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/favicon-16x16.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('SIGMACODE AI', options));
});

// Notification click handling
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});

// Message handling for communication with main thread
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
