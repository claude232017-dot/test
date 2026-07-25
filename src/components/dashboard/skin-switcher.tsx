"use client"

import { Check, Palette } from "lucide-react"
import { useSkinStore, SKIN_META, type Skin } from "@/stores/useSkinStore"
import { DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const SKINS: Skin[] = ["prism", "classic"]

/** Swatch previewing each skin's ground + accent, drawn in that skin's own
 *  colors (they must render regardless of which skin is currently active). */
const SWATCH: Record<Skin, { bg: string; accent: string }> = {
  prism: { bg: "#0a0a0f", accent: "#f5c542" },
  classic: { bg: "#12101f", accent: "#8b5cf6" },
}

export function SkinSwitcher() {
  const skin = useSkinStore(s => s.skin)
  const booting = useSkinStore(s => s.booting)
  const setSkin = useSkinStore(s => s.setSkin)

  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-2 pb-1">
        <Palette className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="deck-label text-[10px] text-muted-foreground">Appearance</span>
      </DropdownMenuLabel>

      {SKINS.map(value => {
        const active = skin === value
        const meta = SKIN_META[value]
        return (
          <DropdownMenuItem
            key={value}
            disabled={booting}
            // Keep the menu open long enough to show the selection landing
            onSelect={(e) => { e.preventDefault(); setSkin(value) }}
            className={cn(active && "bg-[rgba(var(--overlay),0.05)]")}
          >
            <span
              aria-hidden="true"
              className="w-5 h-5 rounded-md shrink-0 grid place-items-center border border-[rgba(var(--overlay),0.15)]"
              style={{ backgroundColor: SWATCH[value].bg }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: SWATCH[value].accent }}
              />
            </span>
            <span className="flex-1 min-w-0 leading-tight">
              <span className="block text-sm">{meta.label}</span>
              <span className="block text-[10px] text-muted-foreground">{meta.tagline}</span>
            </span>
            {active && <Check className="w-3.5 h-3.5 text-accent-strong shrink-0" aria-hidden="true" />}
          </DropdownMenuItem>
        )
      })}
    </>
  )
}
