/* 語圖 service worker
   目的：病房網路不穩時仍可使用。
   策略：app shell 採 cache-first；assets（圖片／音檔）採 stale-while-revalidate。
   注意：改版時務必更新 VERSION，否則使用者拿到的是舊快取。 */

const VERSION = "yutu-v2";
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // 圖片與音檔：先給快取，背景更新
  if (url.pathname.includes("/assets/")) {
    e.respondWith(
      caches.open(ASSETS).then(async cache => {
        const hit = await cache.match(request);
        const net = fetch(request)
          .then(res => { if (res.ok) cache.put(request, res.clone()); return res; })
          .catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  // app shell：快取優先，離線時退回首頁
  e.respondWith(
    caches.match(request).then(hit =>
      hit || fetch(request).catch(() => caches.match("./index.html"))
    )
  );
});
