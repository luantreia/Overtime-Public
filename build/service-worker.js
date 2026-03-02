const CACHE_NAME = 'overtime-v1.1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/logo192.png',
  '/logo512.png',
  '/static/js/bundle.js',
  '/static/css/main.b193528b.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Solo manejar navegaciones y peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. Si está en caché, devolverlo
      if (response) {
        return response;
      }

      // 2. Si es una navegación (una ruta como /equipos), devolver index.html para que el JS maneje el router
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }

      // 3. Si no, intentar red
      return fetch(event.request).catch(() => {
        // Fallback para imágenes si fallan todas
        if (event.request.destination === 'image') {
          return caches.match('/logo.png');
        }
      });
    })
  );
});
