import type { Habit } from "@/types"

// Habit with its completed-date strings (last 366 days — the streak horizon) attached.
export interface HabitWithLogs extends Habit {
  logs: string[]
}

// ── Analytics derived shapes ─────────────────────────────────────────────
export interface WeeklyActivityPoint {
  date: string
  [category: string]: string | number
}

export interface TrendPoint {
  date: string
  minutes: number
  avg: number
}

export interface PomodoroPoint {
  date: string
  day: string
  sessions: number
  isToday: boolean
}

export interface HabitRadialPoint {
  name: string
  completionRate: number
  fill: string
}

export interface StatCards {
  focusMinutesThisWeek: number
  focusMinutesLastWeek: number
  habitsDoneToday: number
  totalHabits: number
  todosCompleted: number
  pomodorosToday: number
}

export interface AnalyticsSnapshot {
  weeklyActivity: WeeklyActivityPoint[]
  trend: TrendPoint[]
  pomodoroData: PomodoroPoint[]
  habitRadial: HabitRadialPoint[]
  stats: StatCards
}

export const EMPTY_STATS: StatCards = {
  focusMinutesThisWeek: 0,
  focusMinutesLastWeek: 0,
  habitsDoneToday: 0,
  totalHabits: 0,
  todosCompleted: 0,
  pomodorosToday: 0,
}
