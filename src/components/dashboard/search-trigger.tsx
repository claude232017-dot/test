"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { useCommandPaletteStore } from "@/stores/useCommandPaletteStore"

export function SearchTrigger() {
  const setOpen = useCommandPaletteStore(s => s.setOpen)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes("mac"))
  }, [])

  return (
    <>
      {/* Mobile: icon-only — there is no ⌘K on a phone keyboard */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Search workspace"
        className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[rgba(var(--overlay),0.05)] transition-colors cursor-pointer"
      >
        <Search className="w-[18px] h-[18px]" />
      </button>

      {/* Desktop: full search field with shortcut hint */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Search workspace"
        className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg border border-[rgba(var(--overlay),0.08)] bg-[rgba(var(--overlay),0.03)] hover:bg-[rgba(var(--overlay),0.06)] hover:border-[rgba(var(--overlay),0.12)] transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs">Search…</span>
        <kbd className="hidden md:inline ml-2 px-1.5 py-0.5 rounded bg-[rgba(var(--overlay),0.06)] text-[10px] font-mono">
          {isMac ? "⌘" : "Ctrl"}K
        </kbd>
      </button>
    </>
  )
}
