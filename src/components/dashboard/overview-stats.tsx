"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Clock, CheckSquare, Target, Timer, type LucideIcon } from "lucide-react"
import { useAnalytics } from "@/hooks/useAnalytics"
import { cn } from "@/lib/utils"

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  const raf = useRef<number | undefined>(undefined)
  useEffect(() => {
    const start = performance.now()
    const from = 0
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 4)
      setValue(Math.round(from + (target - from) * eased))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])
  return value
}

const ACCENTS: Record<string, { icon: string; glow: string }> = {
  purple: { icon: "text-purple-400 bg-purple-500/15", glow: "before:bg-purple-500/10" },
  cyan: { icon: "text-cyan-400 bg-cyan-500/15", glow: "before:bg-cyan-500/10" },
  green: { icon: "text-green-400 bg-green-500/15", glow: "before:bg-green-500/10" },
  blue: { icon: "text-blue-400 bg-blue-500/15", glow: "before:bg-blue-500/10" },
}

function StatChip({
  label, value, display, icon: Icon, accent, index,
}: {
  label: string; value: number; display?: string; icon: LucideIcon; accent: keyof typeof ACCENTS; index: number
}) {
  const counted = useCountUp(value)
  const a = ACCENTS[accent]
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="glass glass-hover rounded-2xl p-4 flex items-center gap-3.5"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", a.icon)}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-xl font-semibold text-foreground tabular leading-tight">
          {display ?? counted}
        </p>
      </div>
    </motion.div>
  )
}

function fmtHrs(m: number) {
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}m`
  if (min === 0) return `${h}h`
  return `${h}h ${min}m`
}

export function OverviewStats() {
  const { stats, loading } = useAnalytics()

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl h-[72px] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatChip index={0} label="Focus this week" value={stats.focusMinutesThisWeek} display={fmtHrs(stats.focusMinutesThisWeek)} icon={Clock} accent="purple" />
      <StatChip index={1} label="Habits today" value={stats.habitsDoneToday} display={`${stats.habitsDoneToday}/${stats.totalHabits}`} icon={Target} accent="green" />
      <StatChip index={2} label="Todos done" value={stats.todosCompleted} icon={CheckSquare} accent="blue" />
      <StatChip index={3} label="Pomodoros today" value={stats.pomodorosToday} icon={Timer} accent="cyan" />
    </div>
  )
}
