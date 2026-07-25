"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient, getCurrentUserId } from "@/lib/supabase/client"
import { useDataStore } from "@/stores/useDataStore"
import { CalendarEvent } from "@/types"
import { toast } from "sonner"
import { format, addMonths, subMonths } from "date-fns"

const EMPTY: CalendarEvent[] = []

export function useCalendarEvents(currentDate: Date) {
  const supabase = createClient()
  const monthKey = format(currentDate, "yyyy-MM")

  // Also cover the previous/next month in case a week or view straddles the boundary
  const prevKey = format(subMonths(currentDate, 1), "yyyy-MM")
  const nextKey = format(addMonths(currentDate, 1), "yyyy-MM")

  const monthEvents = useDataStore(s => s.calendarByMonth[monthKey] ?? EMPTY)
  const prevEvents = useDataStore(s => s.calendarByMonth[prevKey] ?? EMPTY)
  const nextEvents = useDataStore(s => s.calendarByMonth[nextKey] ?? EMPTY)
  const hydrated = useDataStore(s => !!s.calendarHydrated[monthKey])
  const setCalendar = useDataStore(s => s.setCalendar)
  const loadCalendar = useDataStore(s => s.loadCalendar)

  const events = useMemo(
    () => [...prevEvents, ...monthEvents, ...nextEvents],
    [prevEvents, monthEvents, nextEvents]
  )

  const [loading, setLoading] = useState(!hydrated)

  useEffect(() => {
    setLoading(!useDataStore.getState().calendarHydrated[monthKey])
    // Load current month; also fetch neighbors so week view stays consistent at boundaries
    Promise.all([
      loadCalendar(currentDate),
      loadCalendar(subMonths(currentDate, 1)),
      loadCalendar(addMonths(currentDate, 1)),
    ]).finally(() => setLoading(false))
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
      .insert({ ...fields, color: fields.color ?? "#f5c542", user_id: userId })
      .select()
      .single()
    if (error) { toast.error("Failed to create event"); return }
    const key = data.start_date.slice(0, 7) // "yyyy-MM"
    setCalendar(key, prev => [...prev, data].sort((a, b) => a.start_date.localeCompare(b.start_date)))
  }

  async function deleteEvent(id: string) {
    // The event might live in any of the three cached month buckets
    ;[prevKey, monthKey, nextKey].forEach(key => {
      setCalendar(key, prev => prev.filter(e => e.id !== id))
    })
    const { error } = await supabase.from("calendar_events").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete event")
      // Restore every bucket the optimistic removal touched
      loadCalendar(subMonths(currentDate, 1))
      loadCalendar(currentDate)
      loadCalendar(addMonths(currentDate, 1))
    }
  }

  function eventsForDate(date: string) {
    return events.filter(e => e.start_date.startsWith(date))
  }

  return { events, loading, createEvent, deleteEvent, eventsForDate }
}
