const CACHE_VERSION = 'flowo-v1';
const APP_SHELL = [
  '/',
  '/src/styles.css',
  '/src/app.js',
  '/src/store/db.js',
  '/src/store/taskStore.js',
  '/src/store/noteStore.js',
  '/src/components/BottomNav.js',
  '/src/components/QuickAddSheet.js',
  '/src/components/TaskItem.js',
  '/src/components/InstallBanner.js',
  '/src/views/TodayView.js',
  '/src/views/AllTasksView.js',
  '/src/views/FlashView.js',
  '/src/views/SettingsView.js',
  '/src/services/swipeGesture.js',
  '/src/i18n/index.js',
  '/src/i18n/ko.json',
  '/src/i18n/en.json',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Flowo', body: '알림이 도착했습니다.' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Flowo', {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { taskId: data.taskId },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const taskId = event.notification.data?.taskId;
  const url = taskId ? `/#task-${taskId}` : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin));
      if (existing) return existing.focus().then(c => c.navigate(url));
      return clients.openWindow(url);
    })
  );
});
