// Zuma Pilot - Service Worker PWA Offline & Cache
const CACHE_NAME = "zuma-pilot-v3.0-enterprise-final";
const OFFLINE_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/apps",
  "/garcom",
  "/entregador",
  "/pdv",
  "/kds",
  "/proprietario",
  "/loja",
  "/pagamentos",
  "/conexoes",
  "/agro",
  "/barca"
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Zuma SW] Pré-armazenando ativos operacionais offline");
      return cache.addAll(OFFLINE_URLS).catch((err) => {
        console.warn("[Zuma SW] Alguns ativos não puderam ser pré-cacheados:", err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("[Zuma SW] Removendo cache obsoleto:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia Network First com Fallback para Cache
self.addEventListener("fetch", (event) => {
  // Apenas requisições GET
  if (event.request.method !== "GET") return;

  // Ignorar chamadas tRPC ou APIs externas em tempo real
  if (event.request.url.includes("/api/trpc") || event.request.url.includes("tile.openstreetmap.org")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se a rede falhar, retorna do cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Se for navegação de página HTML, retorna raiz
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline - Zuma Pilot", {
            status: 503,
            statusText: "Offline",
            headers: { "Content-Type": "text/plain" }
          });
        });
      })
  );
});

// Suporte a Mensagens e Notificações Push
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
