const CACHE_VERSION = 'flowo-v2';
const BASE = self.registration.scope;

const APP_SHELL = [
  BASE,
  BASE + 'src/styles.css',
  BASE + 'src/app.js',
  BASE + 'src/store/db.js',
  BASE + 'src/store/taskStore.js',
  BASE + 'src/store/noteStore.js',
  BASE + 'src/components/AppHeader.js',
  BASE + 'src/components/BottomNav.js',
  BASE + 'src/components/QuickAddSheet.js',
  BASE + 'src/components/TaskItem.js',
  BASE + 'src/components/InstallBanner.js',
  BASE + 'src/views/TodayView.js',
  BASE + 'src/views/AllTasksView.js',
  BASE + 'src/views/CalendarView.js',
  BASE + 'src/views/FlashView.js',
  BASE + 'src/views/SettingsView.js',
  BASE + 'src/services/swipeGesture.js',
  BASE + 'src/i18n/index.js',
  BASE + 'src/i18n/ko.json',
  BASE + 'src/i18n/en.json',
  BASE + 'manifest.json',
];

/* 개별 캐싱 — 하나 실패해도 나머지는 캐싱 계속 */
async function precache() {
  const cache = await caches.open(CACHE_VERSION);
  await Promise.allSettled(
    APP_SHELL.map(url =>
      fetch(url).then(res => {
        if (res.ok) return cache.put(url, res);
      }).catch(() => {})
    )
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
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

/* Stale-While-Revalidate */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(event.request, clone));
        }
        return res;
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
      icon: BASE + 'public/icons/icon-192.svg',
      badge: BASE + 'public/icons/icon-192.svg',
      data: { taskId: data.taskId },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const taskId = event.notification.data?.taskId;
  const url = BASE + (taskId ? `#task-${taskId}` : '');
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.startsWith(BASE));
      if (existing) return existing.focus().then(c => c.navigate(url));
      return clients.openWindow(url);
    })
  );
});
