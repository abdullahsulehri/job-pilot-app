// Offline shell: the app files are cached, job data is cached by the page itself.
const CACHE = "jobpilot-shell-v6";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});

self.addEventListener("push", e => {
  let d = {}; try { d = e.data.json() } catch (x) { d = { title: "Job Pilot", body: e.data ? e.data.text() : "" } }
  e.waitUntil(self.registration.showNotification(d.title || "Job Pilot", { body: d.body || "", tag: d.tag, icon: "icon.svg", badge: "icon.svg", data: { url: d.url || "./" } }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => { for (const c of cs) if ("focus" in c) return c.focus(); return clients.openWindow((e.notification.data && e.notification.data.url) || "./") }));
});
