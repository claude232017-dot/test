"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { CheckSquare, Target, Timer, type LucideIcon } from "lucide-react"
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
  purple: { icon: "text-accent-strong bg-primary/15", glow: "before:bg-primary/10" },
  cyan: { icon: "text-cyan-400 bg-cyan-500/15", glow: "before:bg-cyan-500/10" },
  green: { icon: "text-green-400 bg-green-500/15", glow: "before:bg-green-500/10" },
  blue: { icon: "text-cyan-400 bg-cyan-500/15", glow: "before:bg-cyan-500/10" },
}

function StatChip({
  label, value, display, icon: Icon, accent, index, className,
}: {
  label: string; value: number; display?: string; icon: LucideIcon; accent: keyof typeof ACCENTS; index: number; className?: string
}) {
  const counted = useCountUp(value)
  const a = ACCENTS[accent]
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className={cn("glass glass-hover rounded-2xl p-4 flex items-center gap-3.5", className)}
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

// Three chips: on phones (2 columns) the last one spans the full row so it
// isn't left orphaned at half width; from lg up they sit three across.
export function OverviewStats() {
  const { stats, loading } = useAnalytics()

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn("glass rounded-2xl h-[72px] animate-pulse", i === 2 && "col-span-2 lg:col-span-1")}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <StatChip index={0} label="Habits today" value={stats.habitsDoneToday} display={`${stats.habitsDoneToday}/${stats.totalHabits}`} icon={Target} accent="green" />
      <StatChip index={1} label="Todos done" value={stats.todosCompleted} icon={CheckSquare} accent="blue" />
      <StatChip index={2} label="Pomodoros today" value={stats.pomodorosToday} icon={Timer} accent="cyan" className="col-span-2 lg:col-span-1" />
    </div>
  )
}
