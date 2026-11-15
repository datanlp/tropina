/* Tropina service worker. Hand-written: Serwist's route handler does not work
   with Cache Components (see docs/journal.md, stage 5). Plain JS, no build step. */

const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const PAGES = `tropina-pages-${VERSION}`;
const STATIC = `tropina-static-${VERSION}`;
const TILES = "tropina-tiles";
const MAX_TILES = 600;

// Saves every market card (all languages) and the scripts and styles they use.
async function precache() {
  const cache = await caches.open(PAGES);
  const list = await fetch("/offline-pages.json", { cache: "no-store" });
  const urls = await list.json();
  await cache.addAll(urls);

  const assets = new Set();
  for (const url of urls) {
    const res = await cache.match(url);
    if (!res) continue;
    const html = await res.text();
    for (const m of html.matchAll(/\/_next\/static\/[^"'\s\\)]+/g)) assets.add(m[0]);
  }
  const statics = await caches.open(STATIC);
  await statics.addAll([...assets, "/manifest.webmanifest", "/icons/icon-192.png"]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGES, STATIC, TILES]);
      for (const key of await caches.keys()) {
        if (key.startsWith("tropina-") && !keep.has(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    if (res.ok && !res.redirected) cache.put(request, res.clone());
    return res;
  } catch (error) {
    const hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    throw error;
  }
}

async function cacheFirst(request, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function trim(cache) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_TILES))) await cache.delete(key);
}

// Map tiles: answer from the cache when we can, refresh in the background.
async function staleWhileRevalidate(event) {
  const cache = await caches.open(TILES);
  const hit = await cache.match(event.request);
  const update = fetch(event.request).then(async (res) => {
    if (res.ok) {
      await cache.put(event.request, res.clone());
      await trim(cache);
    }
    return res;
  });
  if (hit) {
    event.waitUntil(update.catch(() => {}));
    return hit;
  }
  return update;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.hostname === "tiles.openfreemap.org") {
    event.respondWith(staleWhileRevalidate(event));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/vendor/")) {
    event.respondWith(cacheFirst(request, STATIC));
  } else if (url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request, STATIC));
  }
});
