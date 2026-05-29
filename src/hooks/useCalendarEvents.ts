"use client"

import { useEffect, useState } from "react"
import { createClient, getCurrentUserId } from "@/lib/supabase/client"
import { CalendarEvent } from "@/types"
import { toast } from "sonner"
import { startOfMonth, endOfMonth, format } from "date-fns"

export function useCalendarEvents(month: Date) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const monthStart = format(startOfMonth(month), "yyyy-MM-dd")
  const monthEnd = format(endOfMonth(month), "yyyy-MM-dd")

  useEffect(() => { fetchEvents() }, [monthStart])

  async function fetchEvents() {
    setLoading(true)
    const { data, error } = await supabase
      .from("calendar_events")
      .select("id,user_id,title,description,start_date,end_date,color,created_at")
      .gte("start_date", monthStart)
      .lte("start_date", monthEnd + "T23:59:59")
      .order("start_date", { ascending: true })
    if (!error && data) setEvents(data)
    setLoading(false)
  }

  async function createEvent(fields: {
    title: string
    start_date: string
    description?: string
    color?: string
  }) {
    const userId = await getCurrentUserId()
    if (!userId) { toast.error("You must be signed in to create an event"); return }
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({ ...fields, color: fields.color ?? "#7c3aed", user_id: userId })
      .select()
      .single()
    if (error) { toast.error("Failed to create event"); return }
    setEvents(prev => [...prev, data].sort((a, b) => a.start_date.localeCompare(b.start_date)))
  }

  async function deleteEvent(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id))
    const { error } = await supabase.from("calendar_events").delete().eq("id", id)
    if (error) { toast.error("Failed to delete event"); await fetchEvents() }
  }

  function eventsForDate(date: string) {
    return events.filter(e => e.start_date.startsWith(date))
  }

  return { events, loading, createEvent, deleteEvent, eventsForDate }
}
