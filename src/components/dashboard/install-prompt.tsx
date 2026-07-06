"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Share, SquarePlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

// Chrome's install event — not yet in TypeScript's DOM lib
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISS_KEY = "dayflow-install-dismissed"
const DISMISS_DAYS = 14

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    if (raw === "installed") return true
    const ts = Number(raw)
    return Number.isFinite(ts) && Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's non-standard flag
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIos(): boolean {
  const ua = navigator.userAgent
  const classicIos = /iphone|ipad|ipod/i.test(ua)
  // iPadOS 13+ reports as macOS but has touch
  const ipadOs = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1
  return classicIos || ipadOs
}

/**
 * In-app install banner. Android/desktop Chrome only surfaces a subtle
 * address-bar hint, and iOS shows nothing at all — so we present our own
 * prompt: a real install button where the browser supports it, and
 * Share → Add to Home Screen instructions on iOS.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandalone() || isDismissed()) return

    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    function onInstalled() {
      try { localStorage.setItem(DISMISS_KEY, "installed") } catch {}
      setVisible(false)
      toast.success("DayFlow installed — find it on your home screen")
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)

    // iOS never fires beforeinstallprompt — show manual instructions instead
    let iosTimer: ReturnType<typeof setTimeout> | undefined
    if (isIos()) {
      iosTimer = setTimeout(() => { setShowIosHelp(true); setVisible(true) }, 2000)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
      if (iosTimer) clearTimeout(iosTimer)
    }
  }, [])

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
    setVisible(false)
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    setVisible(false)
    if (outcome !== "accepted") {
      try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:max-w-sm z-40 glass-strong rounded-2xl border border-[rgba(var(--overlay),0.1)] shadow-2xl p-4"
          role="dialog"
          aria-label="Install DayFlow"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/30">
              <Download className="w-5 h-5 text-white" aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Install DayFlow</p>
              {showIosHelp && !deferred ? (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Tap the <Share className="w-3 h-3 inline -mt-0.5" aria-label="Share" /> Share button
                  in Safari, then choose{" "}
                  <span className="text-foreground font-medium whitespace-nowrap">
                    <SquarePlus className="w-3 h-3 inline -mt-0.5" aria-hidden="true" /> Add to Home Screen
                  </span>.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Get the full-screen app with its own home-screen icon.
                </p>
              )}

              {deferred && (
                <Button size="sm" className="h-8 mt-2.5" onClick={install}>
                  <Download className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                  Install
                </Button>
              )}
            </div>

            <button
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="p-1.5 -m-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[rgba(var(--overlay),0.05)] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
