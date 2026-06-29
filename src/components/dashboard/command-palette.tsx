"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, StickyNote, CheckSquare, CalendarDays, Target, Trophy, X } from "lucide-react"
import { useCommandPaletteStore } from "@/stores/useCommandPaletteStore"
import { useDataStore } from "@/stores/useDataStore"
import { useGlobalSearch, type SearchResult, type SearchResultType } from "@/hooks/useGlobalSearch"
import { cn } from "@/lib/utils"

const TYPE_META: Record<SearchResultType, { icon: typeof StickyNote; label: string; color: string }> = {
  note:  { icon: StickyNote,   label: "Notes",      color: "text-amber-400" },
  todo:  { icon: CheckSquare,  label: "Todos",      color: "text-purple-400" },
  event: { icon: CalendarDays, label: "Calendar",   color: "text-cyan-400" },
  habit: { icon: Target,       label: "Habits",     color: "text-green-400" },
  goal:  { icon: Trophy,       label: "Goals",      color: "text-amber-400" },
}

const TYPE_ORDER: SearchResultType[] = ["note", "todo", "event", "habit", "goal"]

export function CommandPalette() {
  const open = useCommandPaletteStore(s => s.open)
  const setOpen = useCommandPaletteStore(s => s.setOpen)
  const toggle = useCommandPaletteStore(s => s.toggle)
  const router = useRouter()

  const loadNotes = useDataStore(s => s.loadNotes)
  const loadTodos = useDataStore(s => s.loadTodos)
  const loadHabits = useDataStore(s => s.loadHabits)
  const loadGoals = useDataStore(s => s.loadGoals)
  const loadCalendar = useDataStore(s => s.loadCalendar)

  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const { results, total } = useGlobalSearch(query)

  // Flat list (in display order) for keyboard navigation
  const flat = useMemo<SearchResult[]>(
    () => TYPE_ORDER.flatMap(type => results[type]),
    [results]
  )

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle])

  // When opened: focus input, hydrate data, reset state
  useEffect(() => {
    if (!open) return
    setQuery("")
    setActiveIndex(0)
    // Warm caches if needed
    loadNotes(); loadTodos(); loadHabits(); loadGoals()
    loadCalendar(new Date())
    setTimeout(() => inputRef.current?.focus(), 50)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Reset active index when results change
  useEffect(() => { setActiveIndex(0) }, [query])

  // Keyboard nav inside palette
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); setOpen(false) }
      else if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, Math.max(flat.length - 1, 0))) }
      else if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
      else if (e.key === "Enter") {
        e.preventDefault()
        const r = flat[activeIndex]
        if (r) handleSelect(r)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, flat, activeIndex])

  function handleSelect(r: SearchResult) {
    router.push(r.href)
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl glass-strong rounded-2xl border border-[rgba(var(--overlay),0.1)] shadow-2xl overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(var(--overlay),0.06)]">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search notes, todos, events, habits…"
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
              />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-[rgba(var(--overlay),0.05)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {!query.trim() ? (
                <p className="text-center text-xs text-muted-foreground/60 py-6">
                  Type to search across your workspace…
                </p>
              ) : total === 0 ? (
                <p className="text-center text-xs text-muted-foreground/60 py-6">
                  No matches for &ldquo;{query}&rdquo;
                </p>
              ) : (
                TYPE_ORDER.map(type => {
                  const list = results[type]
                  if (list.length === 0) return null
                  const meta = TYPE_META[type]
                  return (
                    <div key={type} className="mb-1">
                      <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                        {meta.label}
                      </p>
                      {list.map(r => {
                        const flatIndex = flat.findIndex(f => f.id === r.id && f.type === r.type)
                        const isActive = flatIndex === activeIndex
                        const Icon = meta.icon
                        return (
                          <button
                            key={`${r.type}-${r.id}`}
                            onClick={() => handleSelect(r)}
                            onMouseEnter={() => setActiveIndex(flatIndex)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors cursor-pointer",
                              isActive ? "bg-[rgba(var(--overlay),0.06)]" : "hover:bg-[rgba(var(--overlay),0.04)]"
                            )}
                          >
                            <Icon className={cn("w-4 h-4 shrink-0", meta.color)} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground truncate">{r.title}</p>
                              {r.snippet && (
                                <p className="text-[11px] text-muted-foreground/70 truncate">{r.snippet}</p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-[rgba(var(--overlay),0.06)] px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground/60">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-[rgba(var(--overlay),0.06)] mr-1">↑↓</kbd>
                navigate
                <kbd className="px-1.5 py-0.5 rounded bg-[rgba(var(--overlay),0.06)] mx-1 ml-3">↵</kbd>
                select
                <kbd className="px-1.5 py-0.5 rounded bg-[rgba(var(--overlay),0.06)] mx-1 ml-3">esc</kbd>
                close
              </span>
              <span>{total} result{total !== 1 ? "s" : ""}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
