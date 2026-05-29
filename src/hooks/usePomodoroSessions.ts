"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"

export function usePomodoroSessions() {
  const [todayCount, setTodayCount] = useState(0)
  const supabase = createClient()
  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => { fetchToday() }, [])

  async function fetchToday() {
    const { count } = await supabase
      .from("pomodoro_sessions")
      .select("id", { count: "exact", head: true })
      .eq("completed", true)
      .gte("created_at", today + "T00:00:00")
      .lte("created_at", today + "T23:59:59")
    setTodayCount(count ?? 0)
  }

  async function logSession(durationMinutes: number) {
    const { error } = await supabase
      .from("pomodoro_sessions")
      .insert({ duration_minutes: durationMinutes, completed: true })
    if (error) { toast.error("Failed to log session"); return }
    setTodayCount(prev => prev + 1)

    // Cross-widget: auto-log activity
    await supabase
      .from("activity_logs")
      .insert({ category: "Work", duration_minutes: durationMinutes, date: today })
  }

  return { todayCount, logSession }
}
