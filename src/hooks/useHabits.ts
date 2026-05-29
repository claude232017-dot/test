"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Habit, HabitLog } from "@/types"
import { toast } from "sonner"
import { format, subDays } from "date-fns"

export interface HabitWithLogs extends Habit {
  logs: string[] // completed_date strings for last 30 days
}

export function calculateStreak(logs: string[], today: string): number {
  let streak = 0
  let current = today
  while (logs.includes(current)) {
    streak++
    const d = new Date(current + "T12:00:00")
    d.setDate(d.getDate() - 1)
    current = format(d, "yyyy-MM-dd")
  }
  return streak
}

export function useHabits() {
  const [habits, setHabits] = useState<HabitWithLogs[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const today = format(new Date(), "yyyy-MM-dd")
  const since = format(subDays(new Date(), 30), "yyyy-MM-dd")

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const { data: habitData } = await supabase
      .from("habits")
      .select("id,user_id,name,color,created_at")
      .order("created_at", { ascending: true })

    const { data: logData } = await supabase
      .from("habit_logs")
      .select("habit_id,completed_date")
      .gte("completed_date", since)

    if (habitData) {
      setHabits(habitData.map(h => ({
        ...h,
        logs: (logData ?? []).filter(l => l.habit_id === h.id).map(l => l.completed_date),
      })))
    }
    setLoading(false)
  }

  async function createHabit(name: string, color: string) {
    const { data, error } = await supabase
      .from("habits")
      .insert({ name, color })
      .select()
      .single()
    if (error) { toast.error("Failed to create habit"); return }
    setHabits(prev => [...prev, { ...data, logs: [] }])
  }

  async function toggleHabitLog(habitId: string, date: string) {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const isDone = habit.logs.includes(date)

    // Optimistic update
    setHabits(prev => prev.map(h => h.id !== habitId ? h : {
      ...h,
      logs: isDone ? h.logs.filter(d => d !== date) : [...h.logs, date],
    }))

    if (isDone) {
      const { error } = await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId)
        .eq("completed_date", date)
      if (error) { toast.error("Failed to update habit"); await fetchAll() }
    } else {
      const { error } = await supabase
        .from("habit_logs")
        .insert({ habit_id: habitId, completed_date: date })
      if (error) { toast.error("Failed to update habit"); await fetchAll() }
    }
  }

  async function deleteHabit(id: string) {
    setHabits(prev => prev.filter(h => h.id !== id))
    const { error } = await supabase.from("habits").delete().eq("id", id)
    if (error) { toast.error("Failed to delete habit"); await fetchAll() }
  }

  return { habits, loading, today, createHabit, toggleHabitLog, deleteHabit }
}
