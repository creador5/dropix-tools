const CORE = "dpx-tools-core-v1", LIBS = "dpx-tools-libs-v1";
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CORE).then(c => c.addAll(["./", "./index.html", "./icon-192.png", "./manifest.webmanifest"])).catch(() => {}));
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return; const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => { const copy = res.clone(); caches.open(CORE).then(c => c.put(r, copy)); return res; })
      .catch(() => caches.match(r).then(x => x || caches.match("./index.html"))));
    return;
  }
  if (/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|projectnaptha\.com)/.test(u.hostname)) {
    e.respondWith(caches.open(LIBS).then(c => c.match(r).then(hit => {
      const net = fetch(r).then(res => { if (res && (res.ok || res.type === "opaque")) c.put(r, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
