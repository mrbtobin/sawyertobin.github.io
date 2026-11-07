/* Shellfie service worker: app files come fresh from the network (cache is the offline fallback);
   stories and fonts come from the cache first so reading works offline. */
const CACHE = "shellfie-v11";
const SHELL = ["./", "index.html", "app.css", "app.js", "catalog.js", "manifest.webmanifest", "favicon.svg", "favicon-32.png", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !isFont) return;
  const isStory = url.origin === location.origin && /\/books\//.test(url.pathname);
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: url.origin === location.origin });
    const net = fetch(req, isStory || isFont ? undefined : { cache: "no-cache" })
      .then(r => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; });
    if (isStory || isFont) return hit || net.catch(() => hit);      // stories never change once published
    return net.catch(() => hit || Response.error());                 // app shell: network first
  }));
});
