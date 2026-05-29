"use client"

import { useEffect, useState } from "react"
import { createClient, getCurrentUserId } from "@/lib/supabase/client"
import { ActivityLog } from "@/types"
import { toast } from "sonner"
import { format } from "date-fns"

export function useActivityLogs(date: Date) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const dateStr = format(date, "yyyy-MM-dd")

  useEffect(() => {
    fetchLogs()
  }, [dateStr])

  async function fetchLogs() {
    setLoading(true)
    const { data, error } = await supabase
      .from("activity_logs")
      .select("id,user_id,category,duration_minutes,date,created_at")
      .eq("date", dateStr)
      .order("created_at", { ascending: false })
    if (!error && data) setLogs(data)
    setLoading(false)
  }

  async function createLog(fields: { category: string; duration_minutes: number }) {
    const userId = await getCurrentUserId()
    if (!userId) { toast.error("You must be signed in to log activity"); return }
    const { data, error } = await supabase
      .from("activity_logs")
      .insert({ ...fields, date: dateStr, user_id: userId })
      .select()
      .single()
    if (error) { toast.error("Failed to log activity"); return }
    setLogs(prev => [data, ...prev])
  }

  async function deleteLog(id: string) {
    setLogs(prev => prev.filter(l => l.id !== id))
    const { error } = await supabase.from("activity_logs").delete().eq("id", id)
    if (error) { toast.error("Failed to delete log"); await fetchLogs() }
  }

  const totalMinutes = logs.reduce((sum, l) => sum + l.duration_minutes, 0)

  return { logs, loading, createLog, deleteLog, totalMinutes }
}
