"use client"

import { Clock, Trophy, CheckSquare } from "lucide-react"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useGoals } from "@/hooks/useGoals"
import { useDataStore } from "@/stores/useDataStore"
import { StatsCard } from "./stats-card"

function fmtHrs(m: number) {
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}m`
  if (min === 0) return `${h}h`
  return `${h}h ${min}m`
}

/** Week-over-week % change, or undefined when last week has nothing to compare to. */
function weekOverWeek(thisWeek: number, lastWeek: number): number | undefined {
  if (lastWeek <= 0) return undefined
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
}

export function OverviewHighlights() {
  const { stats, loading: statsLoading } = useAnalytics()
  const { goals, loading: goalsLoading } = useGoals()
  const todos = useDataStore(s => s.todos)
  const todosHydrated = useDataStore(s => s.todosHydrated)

  if (statsLoading || goalsLoading || !todosHydrated) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl h-[104px] animate-pulse" />
        ))}
      </div>
    )
  }

  const activeGoals = goals.filter(g => !g.completed).length
  const openTasks = todos.filter(t => !t.completed).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatsCard
        title="Focus time this week"
        value={fmtHrs(stats.focusMinutesThisWeek)}
        change={weekOverWeek(stats.focusMinutesThisWeek, stats.focusMinutesLastWeek)}
        icon={Clock}
        gradient="from-primary to-accent"
      />
      <StatsCard
        title="Active goals"
        value={activeGoals}
        icon={Trophy}
        gradient="from-accent to-primary"
      />
      <StatsCard
        title="Open tasks"
        value={openTasks}
        icon={CheckSquare}
        gradient="from-primary to-primary/60"
      />
    </div>
  )
}
