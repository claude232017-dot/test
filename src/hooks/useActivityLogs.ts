"use client"

import { useEffect, useState } from "react"
import { createClient, getCurrentUserId } from "@/lib/supabase/client"
import { useDataStore } from "@/stores/useDataStore"
import { ActivityLog } from "@/types"
import { toast } from "sonner"
import { format } from "date-fns"

const EMPTY: ActivityLog[] = []

export function useActivityLogs(date: Date) {
  const supabase = createClient()
  const dateStr = format(date, "yyyy-MM-dd")

  const logs = useDataStore(s => s.activityByDate[dateStr] ?? EMPTY)
  const hydrated = useDataStore(s => !!s.activityHydrated[dateStr])
  const setActivity = useDataStore(s => s.setActivity)
  const loadActivity = useDataStore(s => s.loadActivity)

  const [loading, setLoading] = useState(!hydrated)

  useEffect(() => {
    setLoading(!useDataStore.getState().activityHydrated[dateStr])
    loadActivity(dateStr).finally(() => setLoading(false))
  }, [dateStr])

  async function createLog(fields: { category: string; duration_minutes: number }) {
    const userId = await getCurrentUserId()
    if (!userId) { toast.error("You must be signed in to log activity"); return }
    const { data, error } = await supabase
      .from("activity_logs")
      .insert({ ...fields, date: dateStr, user_id: userId })
      .select()
      .single()
    if (error) { toast.error("Failed to log activity"); return }
    setActivity(dateStr, prev => [data, ...prev])
  }

  async function deleteLog(id: string) {
    setActivity(dateStr, prev => prev.filter(l => l.id !== id))
    const { error } = await supabase.from("activity_logs").delete().eq("id", id)
    if (error) { toast.error("Failed to delete log"); loadActivity(dateStr) }
  }

  const totalMinutes = logs.reduce((sum, l) => sum + l.duration_minutes, 0)

  return { logs, loading, createLog, deleteLog, totalMinutes }
}
