"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns"
import { ACTIVITY_CATEGORIES } from "@/components/widgets/activity/activity-widget"

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

export function useAnalytics() {
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityPoint[]>([])
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [pomodoroData, setPomodoroData] = useState<PomodoroPoint[]>([])
  const [habitRadial, setHabitRadial] = useState<HabitRadialPoint[]>([])
  const [stats, setStats] = useState<StatCards>({
    focusMinutesThisWeek: 0,
    focusMinutesLastWeek: 0,
    habitsDoneToday: 0,
    totalHabits: 0,
    todosCompleted: 0,
    pomodorosToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const today = new Date()
    const todayStr = format(today, "yyyy-MM-dd")
    const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
    const lastWeekStart = format(startOfWeek(subDays(today, 7), { weekStartsOn: 1 }), "yyyy-MM-dd")
    const thirtyDaysAgo = format(subDays(today, 29), "yyyy-MM-dd")
    const fourteenDaysAgo = format(subDays(today, 13), "yyyy-MM-dd")

    const [activityRes, habitRes, habitLogRes, todoRes, pomRes] = await Promise.all([
      supabase.from("activity_logs").select("category,duration_minutes,date").gte("date", thirtyDaysAgo),
      supabase.from("habits").select("id,name,color"),
      supabase.from("habit_logs").select("habit_id,completed_date").gte("completed_date", weekStart),
      supabase.from("todos").select("completed"),
      supabase.from("pomodoro_sessions").select("created_at,completed").eq("completed", true).gte("created_at", fourteenDaysAgo + "T00:00:00"),
    ])

    const activityLogs = activityRes.data ?? []
    const habits = habitRes.data ?? []
    const habitLogs = habitLogRes.data ?? []
    const todos = todoRes.data ?? []
    const pomSessions = pomRes.data ?? []

    // --- Weekly activity chart (last 7 days) ---
    const last7 = eachDayOfInterval({ start: subDays(today, 6), end: today })
    const weeklyMap = new Map<string, WeeklyActivityPoint>()
    last7.forEach(d => {
      const key = format(d, "yyyy-MM-dd")
      const point: WeeklyActivityPoint = { date: format(d, "EEE") }
      ACTIVITY_CATEGORIES.forEach(c => { point[c.name] = 0 })
      weeklyMap.set(key, point)
    })
    activityLogs
      .filter(l => last7.some(d => format(d, "yyyy-MM-dd") === l.date))
      .forEach(l => {
        const key = l.date
        const point = weeklyMap.get(key)
        if (point) point[l.category] = (Number(point[l.category] ?? 0)) + Math.round(l.duration_minutes / 60 * 10) / 10
      })
    setWeeklyActivity(Array.from(weeklyMap.values()))

    // --- 30-day productivity trend ---
    const last30 = eachDayOfInterval({ start: subDays(today, 29), end: today })
    const dailyMinutes = new Map<string, number>()
    last30.forEach(d => dailyMinutes.set(format(d, "yyyy-MM-dd"), 0))
    activityLogs.forEach(l => {
      if (dailyMinutes.has(l.date)) {
        dailyMinutes.set(l.date, (dailyMinutes.get(l.date) ?? 0) + l.duration_minutes)
      }
    })
    const minutesArr = Array.from(dailyMinutes.entries()).map(([date, minutes]) => ({ date, minutes }))
    const trendPoints: TrendPoint[] = minutesArr.map((p, i) => {
      const slice = minutesArr.slice(Math.max(0, i - 6), i + 1)
      const avg = Math.round(slice.reduce((s, x) => s + x.minutes, 0) / slice.length)
      return { date: format(new Date(p.date + "T12:00:00"), "MMM d"), minutes: p.minutes, avg }
    })
    setTrend(trendPoints)

    // --- Pomodoro chart (last 14 days) ---
    const last14 = eachDayOfInterval({ start: subDays(today, 13), end: today })
    const pomMap = new Map<string, number>()
    last14.forEach(d => pomMap.set(format(d, "yyyy-MM-dd"), 0))
    pomSessions.forEach(s => {
      const d = s.created_at.slice(0, 10)
      if (pomMap.has(d)) pomMap.set(d, (pomMap.get(d) ?? 0) + 1)
    })
    setPomodoroData(Array.from(pomMap.entries()).map(([date, sessions]) => ({
      date,
      day: format(new Date(date + "T12:00:00"), "EEE d"),
      sessions,
      isToday: date === todayStr,
    })))

    // --- Habit radial chart (this week) ---
    const weekDays = eachDayOfInterval({ start: new Date(weekStart + "T12:00:00"), end: today }).length
    setHabitRadial(habits.map(h => {
      const done = habitLogs.filter(l => l.habit_id === h.id).length
      return {
        name: h.name,
        completionRate: weekDays > 0 ? Math.round((done / weekDays) * 100) : 0,
        fill: h.color,
      }
    }))

    // --- Stat cards ---
    const thisWeekLogs = activityLogs.filter(l => l.date >= weekStart)
    const lastWeekLogs = activityLogs.filter(l => l.date >= lastWeekStart && l.date < weekStart)
    const habitsDoneToday = habitLogs.filter(l => l.completed_date === todayStr).length
    const pomodorosToday = pomSessions.filter(s => s.created_at.startsWith(todayStr)).length

    setStats({
      focusMinutesThisWeek: thisWeekLogs.reduce((s, l) => s + l.duration_minutes, 0),
      focusMinutesLastWeek: lastWeekLogs.reduce((s, l) => s + l.duration_minutes, 0),
      habitsDoneToday,
      totalHabits: habits.length,
      todosCompleted: todos.filter(t => t.completed).length,
      pomodorosToday,
    })

    setLoading(false)
  }

  return { weeklyActivity, trend, pomodoroData, habitRadial, stats, loading }
}
