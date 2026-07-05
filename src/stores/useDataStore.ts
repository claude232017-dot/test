import { create } from "zustand"
import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { ACTIVITY_CATEGORIES } from "@/lib/activity-categories"
import { isScheduledOn } from "@/lib/habit-schedule"
import type { Note, Todo, CalendarEvent, ActivityLog, Goal } from "@/types"
import {
  type HabitWithLogs,
  type AnalyticsSnapshot,
  type WeeklyActivityPoint,
  type TrendPoint,
  EMPTY_STATS,
} from "@/lib/store/types"

// Stale-while-revalidate cache for all dashboard data. State lives at module
// scope (one instance per tab), so navigating between sections reads cached
// data instantly instead of refetching with a skeleton every time. Each `load*`
// action refreshes a slice in the background; the realtime provider calls the
// same actions when Postgres changes arrive.

interface DataState {
  // ── Notes ────────────────────────────────────────────────────────────
  notes: Note[]
  notesHydrated: boolean
  setNotes: (updater: Note[] | ((prev: Note[]) => Note[])) => void
  loadNotes: () => Promise<void>

  // ── Todos ────────────────────────────────────────────────────────────
  todos: Todo[]
  todosHydrated: boolean
  setTodos: (updater: Todo[] | ((prev: Todo[]) => Todo[])) => void
  loadTodos: () => Promise<void>

  // ── Goals ────────────────────────────────────────────────────────────
  goals: Goal[]
  goalsHydrated: boolean
  setGoals: (updater: Goal[] | ((prev: Goal[]) => Goal[])) => void
  loadGoals: () => Promise<void>

  // ── Habits (with logs) ───────────────────────────────────────────────
  habits: HabitWithLogs[]
  habitsHydrated: boolean
  setHabits: (updater: HabitWithLogs[] | ((prev: HabitWithLogs[]) => HabitWithLogs[])) => void
  loadHabits: () => Promise<void>

  // ── Calendar events (cached per month key "yyyy-MM") ─────────────────
  calendarByMonth: Record<string, CalendarEvent[]>
  calendarHydrated: Record<string, boolean>
  setCalendar: (monthKey: string, updater: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => void
  loadCalendar: (month: Date) => Promise<void>

  // ── Activity logs (cached per date "yyyy-MM-dd") ─────────────────────
  activityByDate: Record<string, ActivityLog[]>
  activityHydrated: Record<string, boolean>
  setActivity: (dateStr: string, updater: ActivityLog[] | ((prev: ActivityLog[]) => ActivityLog[])) => void
  loadActivity: (dateStr: string) => Promise<void>

  // ── Pomodoro (today count) ───────────────────────────────────────────
  pomodoroToday: number
  pomodoroHydrated: boolean
  setPomodoroToday: (updater: number | ((prev: number) => number)) => void
  loadPomodoroToday: () => Promise<void>

  // ── Analytics snapshot ───────────────────────────────────────────────
  analytics: AnalyticsSnapshot
  analyticsHydrated: boolean
  loadAnalytics: () => Promise<void>
}

const EMPTY_ANALYTICS: AnalyticsSnapshot = {
  weeklyActivity: [],
  trend: [],
  pomodoroData: [],
  habitRadial: [],
  stats: EMPTY_STATS,
}

export const useDataStore = create<DataState>((set, get) => ({
  // ── Notes ────────────────────────────────────────────────────────────
  notes: [],
  notesHydrated: false,
  setNotes: (updater) =>
    set(s => ({ notes: typeof updater === "function" ? updater(s.notes) : updater })),
  loadNotes: async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("notes")
      .select("id,user_id,title,content,created_at,updated_at")
      .order("updated_at", { ascending: false })
    if (!error && data) set({ notes: data, notesHydrated: true })
    else set({ notesHydrated: true })
  },

  // ── Todos ────────────────────────────────────────────────────────────
  todos: [],
  todosHydrated: false,
  setTodos: (updater) =>
    set(s => ({ todos: typeof updater === "function" ? updater(s.todos) : updater })),
  loadTodos: async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("todos")
      .select("id,user_id,title,completed,priority,due_date,recurrence,position,created_at")
      .order("position", { ascending: true, nullsFirst: false })
    if (!error && data) set({ todos: data, todosHydrated: true })
    else set({ todosHydrated: true })
  },

  // ── Goals ────────────────────────────────────────────────────────────
  goals: [],
  goalsHydrated: false,
  setGoals: (updater) =>
    set(s => ({ goals: typeof updater === "function" ? updater(s.goals) : updater })),
  loadGoals: async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("goals")
      .select("id,user_id,title,description,target_value,current_value,unit,deadline,color,completed,position,created_at")
      .order("position", { ascending: true, nullsFirst: false })
    if (!error && data) set({ goals: data, goalsHydrated: true })
    else set({ goalsHydrated: true })
  },

  // ── Habits ───────────────────────────────────────────────────────────
  habits: [],
  habitsHydrated: false,
  setHabits: (updater) =>
    set(s => ({ habits: typeof updater === "function" ? updater(s.habits) : updater })),
  loadHabits: async () => {
    const supabase = createClient()
    // 366-day horizon: must cover the full streak walk in calculateStreak,
    // otherwise long streaks silently cap at the fetch window.
    const since = format(subDays(new Date(), 366), "yyyy-MM-dd")
    const [{ data: habitData }, { data: logData }] = await Promise.all([
      supabase.from("habits").select("id,user_id,name,color,schedule_days,position,created_at").order("position", { ascending: true, nullsFirst: false }),
      supabase.from("habit_logs").select("habit_id,completed_date").gte("completed_date", since),
    ])
    if (habitData) {
      set({
        habits: habitData.map(h => ({
          ...h,
          logs: (logData ?? []).filter(l => l.habit_id === h.id).map(l => l.completed_date),
        })),
        habitsHydrated: true,
      })
    } else {
      set({ habitsHydrated: true })
    }
  },

  // ── Calendar ─────────────────────────────────────────────────────────
  calendarByMonth: {},
  calendarHydrated: {},
  setCalendar: (monthKey, updater) =>
    set(s => ({
      calendarByMonth: {
        ...s.calendarByMonth,
        [monthKey]: typeof updater === "function" ? updater(s.calendarByMonth[monthKey] ?? []) : updater,
      },
    })),
  loadCalendar: async (month) => {
    const supabase = createClient()
    const monthKey = format(month, "yyyy-MM")
    const start = format(new Date(month.getFullYear(), month.getMonth(), 1), "yyyy-MM-dd")
    const end = format(new Date(month.getFullYear(), month.getMonth() + 1, 0), "yyyy-MM-dd")
    const { data, error } = await supabase
      .from("calendar_events")
      .select("id,user_id,title,description,start_date,end_date,color,created_at")
      .gte("start_date", start)
      .lte("start_date", end + "T23:59:59")
      .order("start_date", { ascending: true })
    set(s => ({
      calendarByMonth: { ...s.calendarByMonth, [monthKey]: !error && data ? data : (s.calendarByMonth[monthKey] ?? []) },
      calendarHydrated: { ...s.calendarHydrated, [monthKey]: true },
    }))
  },

  // ── Activity ─────────────────────────────────────────────────────────
  activityByDate: {},
  activityHydrated: {},
  setActivity: (dateStr, updater) =>
    set(s => ({
      activityByDate: {
        ...s.activityByDate,
        [dateStr]: typeof updater === "function" ? updater(s.activityByDate[dateStr] ?? []) : updater,
      },
    })),
  loadActivity: async (dateStr) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("activity_logs")
      .select("id,user_id,category,duration_minutes,date,created_at")
      .eq("date", dateStr)
      .order("created_at", { ascending: false })
    set(s => ({
      activityByDate: { ...s.activityByDate, [dateStr]: !error && data ? data : (s.activityByDate[dateStr] ?? []) },
      activityHydrated: { ...s.activityHydrated, [dateStr]: true },
    }))
  },

  // ── Pomodoro ─────────────────────────────────────────────────────────
  pomodoroToday: 0,
  pomodoroHydrated: false,
  setPomodoroToday: (updater) =>
    set(s => ({ pomodoroToday: typeof updater === "function" ? updater(s.pomodoroToday) : updater })),
  loadPomodoroToday: async () => {
    const supabase = createClient()
    const today = format(new Date(), "yyyy-MM-dd")
    const { count } = await supabase
      .from("pomodoro_sessions")
      .select("id", { count: "exact", head: true })
      .eq("completed", true)
      .gte("created_at", today + "T00:00:00")
      .lte("created_at", today + "T23:59:59")
    set({ pomodoroToday: count ?? 0, pomodoroHydrated: true })
  },

  // ── Analytics ────────────────────────────────────────────────────────
  analytics: EMPTY_ANALYTICS,
  analyticsHydrated: false,
  loadAnalytics: async () => {
    const supabase = createClient()
    const today = new Date()
    const todayStr = format(today, "yyyy-MM-dd")
    const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
    const lastWeekStart = format(startOfWeek(subDays(today, 7), { weekStartsOn: 1 }), "yyyy-MM-dd")
    const thirtyDaysAgo = format(subDays(today, 29), "yyyy-MM-dd")
    const fourteenDaysAgo = format(subDays(today, 13), "yyyy-MM-dd")

    const [activityRes, habitRes, habitLogRes, todoRes, pomRes] = await Promise.all([
      supabase.from("activity_logs").select("category,duration_minutes,date").gte("date", thirtyDaysAgo),
      supabase.from("habits").select("id,name,color,schedule_days"),
      supabase.from("habit_logs").select("habit_id,completed_date").gte("completed_date", weekStart),
      supabase.from("todos").select("completed"),
      supabase.from("pomodoro_sessions").select("created_at,completed").eq("completed", true).gte("created_at", fourteenDaysAgo + "T00:00:00"),
    ])

    const activityLogs = activityRes.data ?? []
    const habits = habitRes.data ?? []
    const habitLogs = habitLogRes.data ?? []
    const todos = todoRes.data ?? []
    const pomSessions = pomRes.data ?? []

    // Weekly activity (last 7 days)
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
        const point = weeklyMap.get(l.date)
        if (point) point[l.category] = (Number(point[l.category] ?? 0)) + Math.round(l.duration_minutes / 60 * 10) / 10
      })
    const weeklyActivity = Array.from(weeklyMap.values())

    // 30-day productivity trend
    const last30 = eachDayOfInterval({ start: subDays(today, 29), end: today })
    const dailyMinutes = new Map<string, number>()
    last30.forEach(d => dailyMinutes.set(format(d, "yyyy-MM-dd"), 0))
    activityLogs.forEach(l => {
      if (dailyMinutes.has(l.date)) dailyMinutes.set(l.date, (dailyMinutes.get(l.date) ?? 0) + l.duration_minutes)
    })
    const minutesArr = Array.from(dailyMinutes.entries()).map(([date, minutes]) => ({ date, minutes }))
    const trend: TrendPoint[] = minutesArr.map((p, i) => {
      const slice = minutesArr.slice(Math.max(0, i - 6), i + 1)
      const avg = Math.round(slice.reduce((s, x) => s + x.minutes, 0) / slice.length)
      return { date: format(new Date(p.date + "T12:00:00"), "MMM d"), minutes: p.minutes, avg }
    })

    // Pomodoro (last 14 days)
    const last14 = eachDayOfInterval({ start: subDays(today, 13), end: today })
    const pomMap = new Map<string, number>()
    last14.forEach(d => pomMap.set(format(d, "yyyy-MM-dd"), 0))
    pomSessions.forEach(s => {
      const d = s.created_at.slice(0, 10)
      if (pomMap.has(d)) pomMap.set(d, (pomMap.get(d) ?? 0) + 1)
    })
    const pomodoroData = Array.from(pomMap.entries()).map(([date, sessions]) => ({
      date,
      day: format(new Date(date + "T12:00:00"), "EEE d"),
      sessions,
      isToday: date === todayStr,
    }))

    // Habit radial (this week) — measured against each habit's scheduled days
    const weekWindow = eachDayOfInterval({ start: new Date(weekStart + "T12:00:00"), end: today })
      .map(d => format(d, "yyyy-MM-dd"))
    const habitRadial = habits.map(h => {
      const scheduledCount = weekWindow.filter(d => isScheduledOn(h.schedule_days, d)).length
      const done = habitLogs.filter(l => l.habit_id === h.id).length
      return {
        name: h.name,
        completionRate: scheduledCount > 0 ? Math.min(100, Math.round((done / scheduledCount) * 100)) : 0,
        fill: h.color,
      }
    })

    // Stat cards
    const thisWeekLogs = activityLogs.filter(l => l.date >= weekStart)
    const lastWeekLogs = activityLogs.filter(l => l.date >= lastWeekStart && l.date < weekStart)
    const stats = {
      focusMinutesThisWeek: thisWeekLogs.reduce((s, l) => s + l.duration_minutes, 0),
      focusMinutesLastWeek: lastWeekLogs.reduce((s, l) => s + l.duration_minutes, 0),
      habitsDoneToday: habitLogs.filter(l => l.completed_date === todayStr).length,
      totalHabits: habits.filter(h => isScheduledOn(h.schedule_days, todayStr)).length,
      todosCompleted: todos.filter(t => t.completed).length,
      pomodorosToday: pomSessions.filter(s => s.created_at.startsWith(todayStr)).length,
    }

    set({
      analytics: { weeklyActivity, trend, pomodoroData, habitRadial, stats },
      analyticsHydrated: true,
    })
  },
}))
