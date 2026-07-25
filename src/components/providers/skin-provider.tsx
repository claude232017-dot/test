"use client"

import { useEffect } from "react"
import { useSkinStore } from "@/stores/useSkinStore"
import { SkinBootOverlay } from "./skin-boot-overlay"

/**
 * Syncs the skin store with the `data-skin` attribute that the pre-hydration
 * inline script (see app/layout.tsx) already placed on <html>, then mounts the
 * boot overlay used during skin swaps.
 */
export function SkinProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useSkinStore(s => s.hydrate)

  useEffect(() => { hydrate() }, [hydrate])

  return (
    <>
      {children}
      <SkinBootOverlay />
    </>
  )
}
