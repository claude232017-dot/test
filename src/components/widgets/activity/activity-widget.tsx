"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Plus, Activity } from "lucide-react"
import { useActivityLogs } from "@/hooks/useActivityLogs"
import { useDashboardStore } from "@/stores/useDashboardStore"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const ACTIVITY_CATEGORIES = [
  { name: "Work", color: "#7c3aed", bg: "bg-purple-500/20 text-purple-300" },
  { name: "Study", color: "#2563eb", bg: "bg-blue-500/20 text-blue-300" },
  { name: "Exercise", color: "#16a34a", bg: "bg-green-500/20 text-green-300" },
  { name: "Reading", color: "#06b6d4", bg: "bg-cyan-500/20 text-cyan-300" },
  { name: "Leisure", color: "#d97706", bg: "bg-yellow-500/20 text-yellow-300" },
  { name: "Sleep", color: "#6366f1", bg: "bg-indigo-500/20 text-indigo-300" },
]

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function ActivityWidget() {
  const { selectedDate } = useDashboardStore()
  const { logs, loading, createLog, deleteLog, totalMinutes } = useActivityLogs(selectedDate)
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState("Work")
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")

  async function handleAdd() {
    const total = (parseInt(hours || "0") * 60) + parseInt(minutes || "0")
    if (total <= 0) return
    await createLog({ category, duration_minutes: total })
    setHours("")
    setMinutes("")
    setShowForm(false)
  }

  const categoryTotals = ACTIVITY_CATEGORIES.map(cat => ({
    ...cat,
    total: logs.filter(l => l.category === cat.name).reduce((s, l) => s + l.duration_minutes, 0),
  })).filter(c => c.total > 0)

  return (
    <div className="flex flex-col gap-4 h-full min-h-[350px]">
      {/* Summary bar */}
      {totalMinutes > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Today&apos;s total</span>
            <span className="text-sm font-semibold text-foreground">{formatDuration(totalMinutes)}</span>
          </div>
          <div className="flex rounded-full overflow-hidden h-2 bg-white/5">
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

      {/* Log form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl p-3 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {ACTIVITY_CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                      category === cat.name ? cat.bg + " border-current/30" : "border-white/10 text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number" min="0" max="23" value={hours}
                    onChange={e => setHours(e.target.value)}
                    placeholder="0"
                    className="w-14 h-8 text-center text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-foreground"
                  />
                  <span className="text-xs text-muted-foreground">h</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number" min="0" max="59" value={minutes}
                    onChange={e => setMinutes(e.target.value)}
                    placeholder="0"
                    className="w-14 h-8 text-center text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-foreground"
                  />
                  <span className="text-xs text-muted-foreground">m</span>
                </div>
                <Button size="sm" className="ml-auto h-8" onClick={handleAdd}>Log</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setShowForm(v => !v)}
      >
        <Plus className="w-4 h-4 mr-1" />
        {showForm ? "Cancel" : "Log activity"}
      </Button>

      {/* Logs list */}
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
          ))
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24">
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
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 group"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat?.color ?? "#888" }} />
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
  )
}
