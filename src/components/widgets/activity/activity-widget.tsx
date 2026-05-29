"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Plus, Minus, Activity } from "lucide-react"
import { useActivityLogs } from "@/hooks/useActivityLogs"
import { useDashboardStore } from "@/stores/useDashboardStore"
import { ACTIVITY_CATEGORIES } from "@/lib/activity-categories"
import { cn } from "@/lib/utils"

export { ACTIVITY_CATEGORIES }

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function Stepper({ value, onChange, max }: { value: number; onChange: (v: number) => void; max: number }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
      >
        <Minus className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <span className="w-9 text-center text-base font-semibold text-foreground tabular-nums select-none">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  )
}

export function ActivityWidget() {
  const { selectedDate } = useDashboardStore()
  const { logs, loading, createLog, deleteLog, totalMinutes } = useActivityLogs(selectedDate)
  const [category, setCategory] = useState("Work")
  const [hours, setHours] = useState(0)
  const [mins, setMins] = useState(0)

  const activeCat = ACTIVITY_CATEGORIES.find(c => c.name === category)

  async function handleAdd() {
    const total = hours * 60 + mins
    if (total <= 0) return
    await createLog({ category, duration_minutes: total })
    setHours(0)
    setMins(0)
  }

  const categoryTotals = ACTIVITY_CATEGORIES.map(cat => ({
    ...cat,
    total: logs.filter(l => l.category === cat.name).reduce((s, l) => s + l.duration_minutes, 0),
  })).filter(c => c.total > 0)

  return (
    <div className="flex flex-col md:flex-row gap-5 h-full min-h-[350px]">

      {/* Left: always-visible form */}
      <div className="md:w-80 shrink-0 flex flex-col gap-5 md:border-r md:border-white/5 md:pr-5">
        {/* Category */}
        <div className="space-y-2.5">
          <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {ACTIVITY_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                  category === cat.name
                    ? cat.bg + " border-current/30"
                    : "border-white/10 text-muted-foreground hover:bg-white/5"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2.5">
          <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60">Duration</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Stepper value={hours} onChange={setHours} max={23} />
              <span className="text-sm text-muted-foreground">h</span>
            </div>
            <div className="flex items-center gap-2">
              <Stepper value={mins} onChange={setMins} max={59} />
              <span className="text-sm text-muted-foreground">m</span>
            </div>
          </div>
        </div>

        {/* Log button */}
        <button
          onClick={handleAdd}
          disabled={hours * 60 + mins <= 0}
          className="w-full h-10 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: activeCat?.color ?? "#7c3aed" }}
        >
          Log {category}
        </button>

        {/* Color legend */}
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex flex-wrap gap-x-2.5 gap-y-1.5">
            {ACTIVITY_CATEGORIES.map(cat => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-[10px] text-muted-foreground">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: summary + log list */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">

        {/* Summary bar */}
        {totalMinutes > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Today&apos;s total</span>
              <span className="text-sm font-semibold text-foreground">{formatDuration(totalMinutes)}</span>
            </div>
            <div className="flex rounded-full overflow-hidden h-1.5 bg-white/5">
              {categoryTotals.map(cat => (
                <div
                  key={cat.name}
                  style={{ width: `${(cat.total / totalMinutes) * 100}%`, backgroundColor: cat.color }}
                  title={`${cat.name}: ${formatDuration(cat.total)}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryTotals.map(cat => (
                <span key={cat.name} className={cn("text-[10px] px-2 py-0.5 rounded-full", cat.bg)}>
                  {cat.name} · {formatDuration(cat.total)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Log list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-11 rounded-xl bg-white/5 animate-pulse" />
            ))
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Activity className="w-7 h-7 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No activity logged today</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {logs.map(log => {
                const cat = ACTIVITY_CATEGORIES.find(c => c.name === log.category)
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 group"
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat?.color ?? "#888" }} />
                    <span className="text-sm text-foreground flex-1">{log.category}</span>
                    <span className="text-xs text-muted-foreground">{formatDuration(log.duration_minutes)}</span>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="opacity-40 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all cursor-pointer p-1 -m-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  )
}
