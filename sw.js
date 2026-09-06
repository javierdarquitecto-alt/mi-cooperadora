const CACHE_NAME = "mi-cooperadora-v1";

const ARCHIVOS_BASE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./css/app.css",
    "./css/dashboard.css",
    "./css/familias.css",
    "./css/caja.css",
    "./css/reportes.css",
    "./css/responsive.css",
    "./css/nueva-familia.css",
    "./css/cuotas.css",
    "./css/ficha-familia.css",
    "./css/configuracion.css",
    "./css/ventas.css",
    "./css/sorteos.css",
    "./js/app.js",
    "./js/config.js",
    "./js/database.js",
    "./js/router.js",
    "./js/storage.js",
    "./js/utils.js",
    "./js/supabase.js",
    "./assets/logo.png",
    "./assets/icon-192.png",
    "./assets/icon-512.png"
];

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ARCHIVOS_BASE))
    );

    self.skipWaiting();
});


self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys()
            .then(keys =>
                Promise.all(
                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))
                )
            )
    );

    self.clients.claim();
});


self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {

                const copia = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(
                            event.request,
                            copia
                        );
                    });

                return response;
            })
            .catch(() =>
                caches.match(event.request)
            )
    );

});