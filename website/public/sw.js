const CACHE_PREFIX = 'language-academy';
const STATIC_CACHE = `${CACHE_PREFIX}-static-v1`;
const PAGE_CACHE = `${CACHE_PREFIX}-pages-v1`;
const API_CACHE = `${CACHE_PREFIX}-api-v1`;
const VERSION_KEY = `${CACHE_PREFIX}-version`;

const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/logo.webp',
  '/logo-optimized.webp',
];

const PRECACHE_PAGES = [
  '/',
  '/about',
  '/contact',
  '/courses',
  '/blog',
  '/branches',
  '/materials',
  '/enroll',
  '/student-booking',
  '/trial-class',
];

const APP_PORTAL_PREFIXES = [
  '/admin',
  '/student',
  '/teacher',
  '/hrm',
  '/accounting',
  '/brandmanager',
];

const isGet = (request) => request.method === 'GET';
const isSameOrigin = (url) => url.origin === self.location.origin;
const isPortalRoute = (pathname) => APP_PORTAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
const isPublicApi = (pathname) => pathname.startsWith('/api/public/') || pathname.startsWith('/api/v1/public/');
const isStaticAsset = (pathname) => pathname.startsWith('/_next/') || /\.(?:css|js|mjs|png|jpe?g|webp|svg|gif|ico|woff2?|ttf|otf)$/i.test(pathname);

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await cache.delete(keys[0]);
  await trimCache(cacheName, maxEntries);
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName, fallbackUrl = null) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      trimCache(cacheName, cacheName === API_CACHE ? 40 : 80);
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) return caches.match(fallbackUrl);
    throw error;
  }
}

async function purgeVersionedCaches(nextVersion) {
  const cache = await caches.open(STATIC_CACHE);
  const previous = await cache.match(VERSION_KEY);
  const previousVersion = previous ? await previous.text() : '';

  if (previousVersion === nextVersion) return;

  const names = await caches.keys();
  await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX)).map((name) => caches.delete(name)));

  const freshStatic = await caches.open(STATIC_CACHE);
  await freshStatic.put(VERSION_KEY, new Response(nextVersion));
  await freshStatic.addAll(APP_SHELL);
}

async function precachePages() {
  const cache = await caches.open(PAGE_CACHE);
  await Promise.allSettled(PRECACHE_PAGES.map(async (path) => {
    const request = new Request(path, { credentials: 'same-origin' });
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response);
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};

  if (data.type === 'CACHE_VERSION' && data.version) {
    event.waitUntil(purgeVersionedCaches(String(data.version)));
  }

  if (data.type === 'PRECACHE_PAGES') {
    event.waitUntil(precachePages());
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isGet(request)) return;

  const url = new URL(request.url);
  if (!isSameOrigin(url) || isPortalRoute(url.pathname)) return;

  if (isPublicApi(url.pathname)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, PAGE_CACHE, '/offline.html'));
    return;
  }

  if (isStaticAsset(url.pathname) || url.pathname === '/manifest.json') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  }
});
