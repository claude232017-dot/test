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
  )
}
