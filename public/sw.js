// DayFlow service worker — offline shell + static asset caching.
// Navigations are network-first (fresh data always wins); when the network is
// unreachable the cached /offline page is served. Static assets use
// stale-while-revalidate.

const CACHE = "dayflow-v1"
const PRECACHE = ["/offline", "/manifest.json", "/icon.svg", "/icon-192.png", "/icon-512.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Never intercept API/auth traffic
  if (url.pathname.startsWith("/auth") || url.pathname.startsWith("/api")) return

  // Page navigations: network first, offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline").then((cached) => cached ?? Response.error())
      )
    )
    return
  }

  // Hashed build assets & static files: stale-while-revalidate
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    /\.(png|svg|ico|woff2?)$/.test(url.pathname) ||
    url.pathname === "/manifest.json"

  if (isStatic) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone())
            return res
          })
          .catch(() => cached)
        return cached ?? network
      })
    )
  }
})
