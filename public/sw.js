const CACHE_NAME = 'meye-cache-v3';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Just cache some basics if needed, or nothing for now since it's dynamic
      return cache.addAll(['/', '/index.html', '/main.js', '/style.css']);
    }).catch(() => {}) // ignore errors if offline
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  // Try to open/focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
