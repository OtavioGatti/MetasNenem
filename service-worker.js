/**
 * Service Worker para MetasNenem PWA
 * Gerencia cache, offline e atualizações
 */

const CACHE_NAME = 'metasnenem-v1.0.0';
const RUNTIME_CACHE = 'metasnenem-runtime-v1';

// Recursos para cache estático
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/style.css',
  '/styles/components/task-enhancements.css',
  '/styles/responsive.css',
  '/src/core/config.js',
  '/src/database/supabase.js',
  '/src/auth/auth.js',
  '/src/ui/partner-notifications.js',
  '/src/ui/improvements.js',
  '/src/utils/retry-manager.js',
  '/script.js',
  '/src/utils/debug.js',
  '/src/utils/diagnostico.js',
  '/src/utils/test-sync.js',
  '/manifest.json'
];

// =====================================================
// Instalação - Cache de recursos estáticos
// =====================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando nova versão:', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Instalação concluída, ativando...');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erro ao cachear recursos:', error);
      })
  );
});

// =====================================================
// Ativação - Limpar caches antigos
// =====================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando nova versão');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Remove caches antigos
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Ativação concluída');
        return self.clients.claim();
      })
  );
});

// =====================================================
// Fetch - Estratégia de cache
// =====================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições de outros domínios (Supabase, etc)
  if (url.origin !== location.origin && !url.origin.includes('supabase.co')) {
    return;
  }

  // Para APIs do Supabase: Network First (sempre tentar online)
  if (url.origin.includes('supabase.co')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Para navegação: Stale While Revalidate
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Para assets estáticos (CSS, JS, imagens): Cache First
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: Network First
  event.respondWith(networkFirst(request));
});

// =====================================================
// Estratégias de Cache
// =====================================================

/**
 * Cache First - Tenta cache, senão vai pra rede
 */
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Cache First (hit):', request.url);
      return cachedResponse;
    }

    console.log('[SW] Cache First (miss), buscando na rede...');
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Erro em cacheFirst:', error);
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Network First - Tenta rede, senão usa cache
 */
async function networkFirst(request) {
  try {
    console.log('[SW] Network First, tentando rede...');
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Network First (success):', request.url);
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network First (offline), usando cache...');
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Offline fallback
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'Você está offline. Conecte-se para sincronizar.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Stale While Revalidate - Usa cache enquanto atualiza
 */
async function staleWhileRevalidate(request) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    const networkFetch = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => cachedResponse);
    
    return cachedResponse || networkFetch;
  } catch (error) {
    console.error('[SW] Erro em staleWhileRevalidate:', error);
    return caches.match('/index.html');
  }
}

// =====================================================
// Push Notifications
// =====================================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nova notificação do MetasNenem',
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
        action: data.action
      },
      actions: [
        {
          action: 'open',
          title: '📖 Abrir',
          icon: '/assets/icons/action-open.png'
        },
        {
          action: 'close',
          title: '✖ Fechar',
          icon: '/assets/icons/action-close.png'
        }
      ],
      tag: data.tag || 'metasnenem-notification',
      renotify: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title || '💕 MetasNenem', options)
    );
  } catch (error) {
    console.error('[SW] Erro ao processar push:', error);
  }
});

// =====================================================
// Notification Click
// =====================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Verificar se já tem uma janela aberta
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Abrir nova janela
        return clients.openWindow(urlToOpen);
      })
  );
});

// =====================================================
// Mensagens do Client
// =====================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// =====================================================
// Background Sync (quando voltar online)
// =====================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-game-data') {
    console.log('[SW] Background Sync: sincronizando dados...');
    event.waitUntil(syncGameData());
  }
});

async function syncGameData() {
  // Quando voltar online, notificar o client para sincronizar
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'ONLINE',
      message: 'Conexão restaurada! Sincronizando...'
    });
  });
}

// Detectar mudança de conexão
self.addEventListener('online', () => {
  console.log('[SW] Voltou online!');
  syncGameData();
});

self.addEventListener('offline', () => {
  console.log('[SW] Ficou offline!');
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'OFFLINE',
        message: 'Você está offline. Dados serão salvos localmente.'
      });
    });
  });
});
