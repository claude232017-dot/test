"use client"

import { useAnalytics } from "@/hooks/useAnalytics"
import { StatCard } from "@/components/analytics/stat-card"
import { ActivityBarChart } from "@/components/analytics/activity-bar-chart"
import { ProductivityTrendChart } from "@/components/analytics/productivity-trend-chart"
import { PomodoroBarChart } from "@/components/analytics/pomodoro-bar-chart"
import { HabitRadialChart } from "@/components/analytics/habit-radial-chart"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { BarChart2, Clock, Target, CheckSquare, Timer } from "lucide-react"

function fmtMinutes(m: number) {
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}m`
  if (min === 0) return `${h}h`
  return `${h}h ${min}m`
}

function ChartCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-strong rounded-2xl p-4 md:p-5 flex flex-col gap-3 ${className ?? ""}`}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </div>
  )
}

export default function AnalyticsPage() {
  const { weeklyActivity, trend, pomodoroData, habitRadial, stats, loading } = useAnalytics()

  const overallHabitPct = habitRadial.length > 0
    ? Math.round(habitRadial.reduce((s, h) => s + h.completionRate, 0) / habitRadial.length)
    : 0

  const focusTrend = stats.focusMinutesLastWeek > 0
    ? Math.round(((stats.focusMinutesThisWeek - stats.focusMinutesLastWeek) / stats.focusMinutesLastWeek) * 100)
    : null

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[rgba(var(--overlay),0.04)] animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-6 w-28 bg-[rgba(var(--overlay),0.06)] rounded-lg animate-pulse" />
            <div className="h-3 w-48 bg-[rgba(var(--overlay),0.04)] rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-strong rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-strong rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <BarChart2 className="w-[18px] h-[18px] text-gold" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Insights into your productivity patterns</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Focus Time"
          value={fmtMinutes(stats.focusMinutesThisWeek)}
          numericValue={stats.focusMinutesThisWeek}
          icon={Clock}
          sub="this week"
          accent="purple"
          trend={focusTrend !== null ? (focusTrend >= 0 ? "up" : "down") : "neutral"}
          trendLabel={focusTrend !== null ? `${focusTrend > 0 ? "+" : ""}${focusTrend}% vs last week` : "No prior data"}
        />
        <StatCard
          label="Habits Today"
          value={`${stats.habitsDoneToday}/${stats.totalHabits}`}
          numericValue={stats.habitsDoneToday}
          icon={Target}
          sub={stats.totalHabits > 0 ? `${Math.round((stats.habitsDoneToday / stats.totalHabits) * 100)}% complete` : "No habits yet"}
          accent="green"
        />
        <StatCard
          label="Todos Done"
          value={String(stats.todosCompleted)}
          numericValue={stats.todosCompleted}
          icon={CheckSquare}
          sub="total completed"
          accent="blue"
        />
        <StatCard
          label="Pomodoros"
          value={String(stats.pomodorosToday)}
          numericValue={stats.pomodorosToday}
          icon={Timer}
          sub="today"
          accent="cyan"
          trendLabel={stats.pomodorosToday > 0 ? `${stats.pomodorosToday * 25}min focused` : undefined}
          trend="neutral"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard
          title="Weekly Activity"
          subtitle="Hours logged per category — last 7 days"
          className="md:col-span-2"
        >
          <ActivityBarChart data={weeklyActivity} />
        </ChartCard>

        <ChartCard title="Habit Completion" subtitle="This week's completion rate per habit">
          <HabitRadialChart data={habitRadial} overallPct={overallHabitPct} />
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Productivity Trend" subtitle="Daily logged time — last 30 days with 7-day average">
          <ProductivityTrendChart data={trend} />
        </ChartCard>

        <ChartCard title="Pomodoro Sessions" subtitle="Completed sessions per day — last 14 days">
          <PomodoroBarChart data={pomodoroData} />
        </ChartCard>
      </div>
    </div>
  )
}
