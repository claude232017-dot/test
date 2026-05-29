"use client"

import { useEffect } from "react"
import { createClient, getCurrentUserId } from "@/lib/supabase/client"
import { useDataStore } from "@/stores/useDataStore"
import { toast } from "sonner"
import { format } from "date-fns"

export function usePomodoroSessions() {
  const supabase = createClient()
  const today = format(new Date(), "yyyy-MM-dd")

  const todayCount = useDataStore(s => s.pomodoroToday)
  const setPomodoroToday = useDataStore(s => s.setPomodoroToday)
  const loadPomodoroToday = useDataStore(s => s.loadPomodoroToday)

  useEffect(() => { loadPomodoroToday() }, [])

  async function logSession(durationMinutes: number) {
    const userId = await getCurrentUserId()
    if (!userId) { toast.error("Failed to log session"); return }
    const { error } = await supabase
      .from("pomodoro_sessions")
      .insert({ duration_minutes: durationMinutes, completed: true, user_id: userId })
    if (error) { toast.error("Failed to log session"); return }
    setPomodoroToday(prev => prev + 1)

    // Cross-widget: auto-log activity, then refresh dependent caches.
    await supabase
      .from("activity_logs")
      .insert({ category: "Work", duration_minutes: durationMinutes, date: today, user_id: userId })

    const store = useDataStore.getState()
    store.loadActivity(today)
    store.loadAnalytics()
  }

  return { todayCount, logSession }
}
