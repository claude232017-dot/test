"use client"

import { useEffect } from "react"

// Registers the PWA service worker. Production only — in dev a stale worker
// serving cached assets makes hot reload behave erratically.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failing (private mode, unsupported) never blocks the app
    })
  }, [])

  return null
}
