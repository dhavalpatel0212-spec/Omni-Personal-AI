/**
 * Registers the service worker for the application with advanced PWA features.
 * This function should be called once when the application starts,
 * for example, in the main entry point file (e.g., index.tsx or App.tsx).
 */
export const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log(
            "Service Worker registered successfully with scope: ",
            registration.scope
          );

          // Request notification permission
          if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().then((permission) => {
              console.log("Notification permission:", permission);
            });
          }

          // Register for periodic background sync if supported
          if ("periodicSync" in registration) {
            registration.periodicSync.register("background-sync", {
              minInterval: 24 * 60 * 60 * 1000, // 24 hours
            }).catch((error) => {
              console.log("Periodic sync registration failed:", error);
            });
          }
        })
        .catch((error) => {
          console.error("Service Worker registration failed: ", error);
        });
    });
  } else {
    console.log("Service Worker is not supported by this browser.");
  }
};

/**
 * This is the actual service worker code with advanced PWA features.
 * In a real build process, this would be in a separate file (e.g., `public/service-worker.js`)
 * and likely written in TypeScript, then compiled to JavaScript.
 *
 * For the purpose of this file structure, we are including it as a template string.
 * The build system would need to be configured to extract this and place it in the public root.
 */
export const serviceWorkerCode = `
const CACHE_NAME = 'omni-pa-cache-v2';
const RUNTIME_CACHE = 'omni-pa-runtime-v2';
const BACKGROUND_SYNC_TAG = 'background-sync';
const PERIODIC_SYNC_TAG = 'periodic-background-sync';

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/bundle.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-512x512-maskable.png',
  '/offline.html'
];

// Install event: opens a cache and adds main assets to it.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event: cleans up old caches and claims clients.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Enhanced fetch event with runtime caching and offline fallback
self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          // Update cache in background for next time
          fetch(event.request)
            .then((fetchResponse) => {
              if (fetchResponse && fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
            })
            .catch(() => {
              // Network failed, but we have cached version
            });
          
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response for caching
            const responseToCache = networkResponse.clone();

            // Cache the response for future use
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            
            // Return offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // For other requests, throw the error
            throw error;
          });
      })
  );
});

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(doBackgroundSync());
  }
});

// Periodic Background Sync for regular updates
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered', event.tag);
  
  if (event.tag === PERIODIC_SYNC_TAG) {
    event.waitUntil(doPeriodicSync());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {
    title: 'OmniPA',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Service Worker: Error parsing push data', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'open' action
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If app is not open, open it
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Background sync function
async function doBackgroundSync() {
  try {
    console.log('Service Worker: Performing background sync');
    
    // Get pending sync data from IndexedDB or localStorage
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await syncAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync action', action, error);
      }
    }
    
    console.log('Service Worker: Background sync completed');
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
    throw error;
  }
}

// Periodic sync function
async function doPeriodicSync() {
  try {
    console.log('Service Worker: Performing periodic sync');
    
    // Fetch latest data and update cache
    const response = await fetch('/api/sync-data');
    if (response.ok) {
      const data = await response.json();
      
      // Store updated data in cache or IndexedDB
      await updateLocalData(data);
      
      // Show notification if there are important updates
      if (data.hasImportantUpdates) {
        await self.registration.showNotification('OmniPA Update', {
          body: 'New updates are available',
          icon: '/icons/icon-192x192.png',
          tag: 'update'
        });
      }
    }
    
    console.log('Service Worker: Periodic sync completed');
  } catch (error) {
    console.error('Service Worker: Periodic sync failed', error);
  }
}

// Helper functions for sync operations
async function getPendingActions() {
  // In a real implementation, this would read from IndexedDB
  return [];
}

async function syncAction(action) {
  // In a real implementation, this would sync the action with the server
  const response = await fetch('/api/sync-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action)
  });
  
  if (!response.ok) {
    throw new Error('Failed to sync action');
  }
  
  return response.json();
}

async function removePendingAction(actionId) {
  // In a real implementation, this would remove the action from IndexedDB
  console.log('Service Worker: Removing pending action', actionId);
}

async function updateLocalData(data) {
  // In a real implementation, this would update IndexedDB or cache
  console.log('Service Worker: Updating local data', data);
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'QUEUE_BACKGROUND_SYNC') {
    // Queue action for background sync
    queueBackgroundSync(event.data.payload);
  }
});

async function queueBackgroundSync(action) {
  try {
    // Store action for later sync
    await storePendingAction(action);
    
    // Register background sync
    await self.registration.sync.register(BACKGROUND_SYNC_TAG);
    
    console.log('Service Worker: Background sync queued');
  } catch (error) {
    console.error('Service Worker: Failed to queue background sync', error);
  }
}

async function storePendingAction(action) {
  // In a real implementation, this would store in IndexedDB
  console.log('Service Worker: Storing pending action', action);
}
`;