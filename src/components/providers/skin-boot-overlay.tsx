"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useSkinStore, BOOT_MS, type Skin } from "@/stores/useSkinStore"

/* The overlay renders the skin being switched INTO, while the token layer is
   mid-swap — so it can't read from CSS variables and carries its own literal
   palette. This is the one sanctioned place for raw skin colors. */
const BOOT_THEME: Record<Skin, {
  bg: string; fg: string; dim: string; accent: string; bar: string; label: string; mono: boolean
}> = {
  prism: {
    bg: "#0a0a0f",
    fg: "#f2f1ec",
    dim: "#b0afa6",
    accent: "#f5c542",
    bar: "linear-gradient(90deg, #f8d264, #f5c542)",
    label: "Initializing command deck",
    mono: true,
  },
  classic: {
    bg: "#0b0a14",
    fg: "#f5f6fb",
    dim: "#a5a7bd",
    accent: "#a78bfa",
    bar: "linear-gradient(90deg, #7c3aed, #2563eb 55%, #06b6d4)",
    label: "Loading DayFlow",
    mono: false,
  },
}

export function SkinBootOverlay() {
  const booting = useSkinStore(s => s.booting)
  const target = useSkinStore(s => s.bootTarget)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const t = BOOT_THEME[target]

  return createPortal(
    <AnimatePresence>
      {booting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 px-6"
          style={{ backgroundColor: t.bg, color: t.fg }}
          role="status"
          aria-live="polite"
        >
          {/* PRISM-X gets its signature grid horizon behind the boot text */}
          {target === "prism" && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, transparent 30%, #0a0a0f 88%)," +
                  "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,197,66,0.10), transparent 60%)," +
                  "linear-gradient(rgba(245,197,66,0.04) 1px, transparent 1px)," +
                  "linear-gradient(90deg, rgba(245,197,66,0.04) 1px, transparent 1px)",
                backgroundSize: "100% 100%, 100% 100%, 44px 44px, 44px 44px",
              }}
            />
          )}

          {/* Brand mark */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-12 h-12 flex items-center justify-center shrink-0"
            style={{
              borderRadius: target === "prism" ? 10 : 14,
              backgroundImage: t.bar,
              boxShadow: `0 0 26px ${t.accent}55`,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 512 512" fill="none" aria-hidden="true">
              <g fill={target === "prism" ? "#1a1405" : "#ffffff"}>
                <rect x="150" y="296" width="44" height="86" rx="10" opacity="0.5" />
                <rect x="234" y="244" width="44" height="138" rx="10" opacity="0.75" />
                <rect x="318" y="170" width="44" height="212" rx="10" />
              </g>
              <path
                d="M156 286 L256 234 L356 160"
                stroke={target === "prism" ? "#1a1405" : "#ffffff"}
                strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" fill="none"
              />
              <circle cx="356" cy="160" r="20" fill={target === "prism" ? "#1a1405" : "#ffffff"} />
            </svg>
          </motion.div>

          {/* Status line */}
          <p
            className="relative text-center"
            style={{
              color: t.dim,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: t.mono ? "0.28em" : "0.16em",
              fontFamily: t.mono
                ? 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace'
                : "inherit",
            }}
          >
            {t.label}
          </p>

          {/* Progress sweep — fills across the boot duration */}
          <div
            className="relative w-48 max-w-[70vw] overflow-hidden"
            style={{
              height: 3,
              borderRadius: 999,
              backgroundColor: `${t.accent}22`,
            }}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: BOOT_MS / 1000, ease: "easeInOut" }}
              style={{ height: "100%", borderRadius: 999, backgroundImage: t.bar }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
