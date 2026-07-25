import { create } from "zustand"

export type Skin = "prism" | "classic"

export const SKIN_STORAGE_KEY = "dayflow-skin"
export const DEFAULT_SKIN: Skin = "prism"

export const SKIN_META: Record<Skin, { label: string; tagline: string }> = {
  prism: { label: "PRISM-X", tagline: "Command deck" },
  classic: { label: "Classic", tagline: "Original glass" },
}

/** Total boot-sequence duration; the skin swaps at the midpoint, behind the overlay. */
export const BOOT_MS = 700
const SWAP_AT_MS = 300

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Write the skin to <html> + localStorage. Kept out of React so the
 *  pre-hydration inline script can use the same attribute contract. */
function applySkin(skin: Skin) {
  document.documentElement.setAttribute("data-skin", skin)
  try { localStorage.setItem(SKIN_STORAGE_KEY, skin) } catch { /* private mode */ }
}

interface SkinState {
  skin: Skin
  /** True while the boot overlay is covering a skin swap. */
  booting: boolean
  /** The skin being switched *into* — the overlay themes itself with it. */
  bootTarget: Skin
  hydrate: () => void
  setSkin: (skin: Skin) => void
}

export const useSkinStore = create<SkinState>((set, get) => ({
  skin: DEFAULT_SKIN,
  booting: false,
  bootTarget: DEFAULT_SKIN,

  // Sync React state with whatever the inline script already put on <html>.
  hydrate: () => {
    if (typeof document === "undefined") return
    const attr = document.documentElement.getAttribute("data-skin")
    set({ skin: attr === "classic" ? "classic" : "prism" })
  },

  setSkin: (skin) => {
    if (get().skin === skin || get().booting) return

    // Reduced motion: swap instantly, no boot sequence.
    if (prefersReducedMotion()) {
      applySkin(skin)
      set({ skin })
      return
    }

    set({ booting: true, bootTarget: skin })
    // Swap behind the overlay so the repaint is never visible.
    window.setTimeout(() => {
      applySkin(skin)
      set({ skin })
    }, SWAP_AT_MS)
    window.setTimeout(() => set({ booting: false }), BOOT_MS)
  },
}))
