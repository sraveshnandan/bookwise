// Service Worker for BookWise PWA
const CACHE_NAME = 'bookwise-v1.0.0';
const STATIC_CACHE = 'bookwise-static-v1';
const DYNAMIC_CACHE = 'bookwise-dynamic-v1';
const IMAGE_CACHE = 'bookwise-images-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/index.html',
];

const CACHE_STRATEGIES = {
  static: 'cache-first',
  api: 'network-first',
  images: 'cache-first',
  fonts: 'cache-first',
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Handle different resource types
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isApiRequest(request)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isFontRequest(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

function isStaticAsset(request: Request): boolean {
  const url = new URL(request.url);
  return url.pathname === '/' || 
         url.pathname.endsWith('.html') || 
         url.pathname.endsWith('.js') || 
         url.pathname.endsWith('.css') ||
         url.pathname === '/manifest.json';
}

function isApiRequest(request: Request): boolean {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase') ||
         url.hostname.includes('googleapis');
}

function isImageRequest(request: Request): boolean {
  return request.headers.get('accept')?.includes('image/') || 
         /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(new URL(request.url).pathname);
}

function isFontRequest(request: Request): boolean {
  return request.headers.get('accept')?.includes('font/') || 
         /\.(woff|woff2|ttf|otf|eot)$/i.test(new URL(request.url).pathname);
}

async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Background sync for reading progress
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reading-progress') {
    event.waitUntil(syncReadingProgress());
  }
  if (event.tag === 'sync-highlights') {
    event.waitUntil(syncHighlights());
  }
  if (event.tag === 'sync-library') {
    event.waitUntil(syncLibrary());
  }
});

async function syncReadingProgress(): Promise<void> {
  try {
    const cache = await caches.open('bookwise-sync');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/reading-progress')) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.delete(request);
          }
        } catch (error) {
          console.error('Failed to sync reading progress:', error);
        }
      }
    }
  } catch (error) {
    console.error('Sync reading progress failed:', error);
  }
}

async function syncHighlights(): Promise<void> {
  try {
    const cache = await caches.open('bookwise-sync');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/highlights')) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.delete(request);
          }
        } catch (error) {
          console.error('Failed to sync highlights:', error);
        }
      }
    }
  } catch (error) {
    console.error('Sync highlights failed:', error);
  }
}

async function syncLibrary(): Promise<void> {
  try {
    const cache = await caches.open('bookwise-sync');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/library')) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.delete(request);
          }
        } catch (error) {
          console.error('Failed to sync library:', error);
        }
      }
    }
  } catch (error) {
    console.error('Sync library failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action buttons
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Default click - open app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow('/');
      })
    );
  }
});

function handleNotificationAction(action: string, data: any): void {
  switch (action) {
    case 'open_book':
      clients.openWindow(`/book/${data.bookId}`);
      break;
    case 'continue_reading':
      clients.openWindow('/continue-reading');
      break;
    case 'view_library':
      clients.openWindow('/library');
      break;
    case 'dismiss':
      // Just close
      break;
  }
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-sync') {
    event.waitUntil(performDailySync());
  }
});

async function performDailySync(): Promise<void> {
  try {
    // Sync reading streak
    await fetch('/api/stats/streak', { method: 'POST' });
    
    // Check for new releases
    await fetch('/api/books/new-releases', { method: 'GET' });
    
    // Clean up old cache
    await cleanupCache();
  } catch (error) {
    console.error('Daily sync failed:', error);
  }
}

async function cleanupCache(): Promise<void> {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('bookwise-') && 
    !['bookwise-static-v1', 'bookwise-dynamic-v1', 'bookwise-images-v1'].includes(name)
  );
  
  await Promise.all(oldCaches.map(name => caches.delete(name)));
}

export {};