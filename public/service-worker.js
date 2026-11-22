// Service worker "kill switch". Hubo un SW con caché que servía un index.html viejo; el código que lo
// desinstalaba vivía dentro de main.js, así que si main.js fallaba nunca corría. Los navegadores
// re-descargan este archivo solos (vercel.json lo sirve sin caché), así que este reemplazo llega
// aunque la app no monte: borra todas las cachés, se desinstala y recarga las pestañas abiertas.
// No volver a poner lógica de caché acá sin un plan de invalidación.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const claves = await caches.keys();
      await Promise.all(claves.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clientes = await self.clients.matchAll({ type: 'window' });
      clientes.forEach((c) => c.navigate(c.url));
    })(),
  );
});
