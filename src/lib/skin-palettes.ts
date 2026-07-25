"use client"

import { useSkinStore } from "@/stores/useSkinStore"

/**
 * Swatches offered when picking a color for a goal, habit, or calendar event.
 * The palette follows the active skin so new items match the look — note that
 * colors already saved on existing rows keep the hex they were created with.
 */
const PRISM_SWATCHES = ["#f5c542", "#0f9bbd", "#9085e9", "#0ca30c", "#e66767", "#c98500", "#37d67a", "#b9b8ae"]

const PALETTES = {
  prism: PRISM_SWATCHES,
  // Studio shares PRISM-X's palette — it differs in treatment, not color.
  studio: PRISM_SWATCHES,
  classic: ["#7c3aed", "#2563eb", "#06b6d4", "#16a34a", "#d97706", "#dc2626", "#db2777", "#6366f1"],
} as const

export function useSkinPalette(): readonly string[] {
  const skin = useSkinStore(s => s.skin)
  return PALETTES[skin]
}

/**
 * Literal accent hexes for places that can't use CSS tokens — SVG stroke plus
 * string-concatenated shadow alpha (`${hex}60`), where hsl(var(--x)) breaks.
 */
const PRISM_ACCENTS = { primary: "#f5c542", success: "#0ca30c", accent: "#0f9bbd", progress: "linear-gradient(90deg, #f5c542, #0f9bbd)" }

const ACCENTS = {
  prism:   PRISM_ACCENTS,
  studio:  PRISM_ACCENTS,
  classic: { primary: "#7c3aed", success: "#16a34a", accent: "#2563eb", progress: "linear-gradient(90deg, #7c3aed, #06b6d4)" },
} as const

export function useSkinAccents() {
  const skin = useSkinStore(s => s.skin)
  return ACCENTS[skin]
}
