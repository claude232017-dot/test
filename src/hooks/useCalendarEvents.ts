"use client"

import { useEffect, useState } from "react"
import { createClient, getCurrentUserId } from "@/lib/supabase/client"
import { useDataStore } from "@/stores/useDataStore"
import { CalendarEvent } from "@/types"
import { toast } from "sonner"
import { format } from "date-fns"

const EMPTY: CalendarEvent[] = []

export function useCalendarEvents(month: Date) {
  const supabase = createClient()
  const monthKey = format(month, "yyyy-MM")

  const events = useDataStore(s => s.calendarByMonth[monthKey] ?? EMPTY)
  const hydrated = useDataStore(s => !!s.calendarHydrated[monthKey])
  const setCalendar = useDataStore(s => s.setCalendar)
  const loadCalendar = useDataStore(s => s.loadCalendar)

  const [loading, setLoading] = useState(!hydrated)

  useEffect(() => {
    setLoading(!useDataStore.getState().calendarHydrated[monthKey])
    loadCalendar(month).finally(() => setLoading(false))
  }, [monthKey])

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
    const key = data.start_date.slice(0, 7) // "yyyy-MM"
    setCalendar(key, prev => [...prev, data].sort((a, b) => a.start_date.localeCompare(b.start_date)))
  }

  async function deleteEvent(id: string) {
    setCalendar(monthKey, prev => prev.filter(e => e.id !== id))
    const { error } = await supabase.from("calendar_events").delete().eq("id", id)
    if (error) { toast.error("Failed to delete event"); loadCalendar(month) }
  }

  function eventsForDate(date: string) {
    return events.filter(e => e.start_date.startsWith(date))
  }

  return { events, loading, createEvent, deleteEvent, eventsForDate }
}
