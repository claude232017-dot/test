"use client"

import { useEffect, useState } from "react"
import { createClient, getCurrentUserId } from "@/lib/supabase/client"
import { useDataStore } from "@/stores/useDataStore"
import { toast } from "sonner"
import { format } from "date-fns"
import { isScheduledOn } from "@/lib/habit-schedule"
import type { HabitWithLogs } from "@/lib/store/types"

export type { HabitWithLogs }
export { isScheduledOn }

export function calculateStreak(logs: string[], today: string, scheduleDays?: number[] | null): number {
  let streak = 0
  let current = today
  // Bounded walk: skip unscheduled days, count consecutive completed scheduled
  // days. An unlogged *today* doesn't break the streak (the user simply hasn't
  // checked in yet) — only unlogged past scheduled days do.
  for (let i = 0; i < 366; i++) {
    if (isScheduledOn(scheduleDays, current)) {
      if (logs.includes(current)) streak++
      else if (current !== today) break
    }
    const d = new Date(current + "T12:00:00")
    d.setDate(d.getDate() - 1)
    current = format(d, "yyyy-MM-dd")
  }
  return streak
}

export function useHabits() {
  const supabase = createClient()
  const habits = useDataStore(s => s.habits)
  const hydrated = useDataStore(s => s.habitsHydrated)
  const setHabits = useDataStore(s => s.setHabits)
  const loadHabits = useDataStore(s => s.loadHabits)

  const [loading, setLoading] = useState(!hydrated)
  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    loadHabits().finally(() => setLoading(false))
  }, [])

  async function createHabit(name: string, color: string, scheduleDays?: number[] | null) {
    const userId = await getCurrentUserId()
    if (!userId) { toast.error("You must be signed in to create a habit"); return }
    const nextPosition = habits.length > 0 ? Math.max(...habits.map(h => h.position ?? 0)) + 1000 : 1000
    // All 7 days selected (or nothing passed) = every day = NULL in the DB
    const schedule = scheduleDays && scheduleDays.length > 0 && scheduleDays.length < 7 ? scheduleDays : null
    const { data, error } = await supabase
      .from("habits")
      .insert({ name, color, schedule_days: schedule, position: nextPosition, user_id: userId })
      .select()
      .single()
    if (error) { toast.error("Failed to create habit"); return }
    setHabits(prev => [...prev, { ...data, logs: [] }])
  }

  async function reorderHabits(orderedIds: string[]) {
    const idToPos = new Map(orderedIds.map((id, i) => [id, (i + 1) * 1000]))
    setHabits(prev => {
      const next = prev.map(h => idToPos.has(h.id) ? { ...h, position: idToPos.get(h.id)! } : h)
      return [...next].sort((a, b) => a.position - b.position)
    })
    const updates = await Promise.all(
      orderedIds.map(id =>
        supabase.from("habits").update({ position: idToPos.get(id)! }).eq("id", id)
      )
    )
    if (updates.some(r => r.error)) { toast.error("Failed to save order"); loadHabits() }
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
      if (error) { toast.error("Failed to update habit"); loadHabits() }
    } else {
      const userId = await getCurrentUserId()
      if (!userId) { toast.error("Failed to update habit"); loadHabits(); return }
      const { error } = await supabase
        .from("habit_logs")
        .insert({ habit_id: habitId, completed_date: date, user_id: userId })
      if (error) { toast.error("Failed to update habit"); loadHabits() }
    }
  }

  async function deleteHabit(id: string) {
    setHabits(prev => prev.filter(h => h.id !== id))
    const { error } = await supabase.from("habits").delete().eq("id", id)
    if (error) { toast.error("Failed to delete habit"); loadHabits() }
  }

  return { habits, loading, today, createHabit, toggleHabitLog, deleteHabit, reorderHabits }
}
