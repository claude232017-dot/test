"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useDataStore } from "@/stores/useDataStore"

// Subscribes once to Postgres changes for the lifetime of the dashboard.
// Living in the layout (preserved across soft navigation) means we open one
// set of channels per tab instead of tearing them down and rebuilding on every
// page change. On a change we refresh the affected store slice in the
// background; the UI has usually already updated optimistically.
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = createClient()
    const store = useDataStore.getState

    const channel = supabase
      .channel("dashboard-db")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, () => store().loadNotes())
      .on("postgres_changes", { event: "*", schema: "public", table: "todos" }, () => {
        store().loadTodos()
        store().loadAnalytics()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "habits" }, () => {
        store().loadHabits()
        store().loadAnalytics()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "habit_logs" }, () => {
        store().loadHabits()
        store().loadAnalytics()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "goals" }, () => store().loadGoals())
      .on("postgres_changes", { event: "*", schema: "public", table: "pomodoro_sessions" }, () => {
        store().loadPomodoroToday()
        store().loadAnalytics()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, () => {
        store().loadAnalytics()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return <>{children}</>
}
