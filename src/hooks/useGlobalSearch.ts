"use client"

import { useMemo } from "react"
import { format, parseISO } from "date-fns"
import { useDataStore } from "@/stores/useDataStore"

export type SearchResultType = "note" | "todo" | "event" | "habit" | "goal"

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  snippet?: string
  href: string
}

const MAX_PER_GROUP = 6

export function useGlobalSearch(query: string): {
  results: Record<SearchResultType, SearchResult[]>
  total: number
} {
  const notes = useDataStore(s => s.notes)
  const todos = useDataStore(s => s.todos)
  const calendarByMonth = useDataStore(s => s.calendarByMonth)
  const habits = useDataStore(s => s.habits)
  const goals = useDataStore(s => s.goals)

  return useMemo(() => {
    const q = query.trim().toLowerCase()
    const empty = { note: [], todo: [], event: [], habit: [], goal: [] } as Record<SearchResultType, SearchResult[]>

    if (!q) return { results: empty, total: 0 }

    const matches = (s: string | null | undefined) => s?.toLowerCase().includes(q) ?? false

    const noteResults: SearchResult[] = notes
      .filter(n => matches(n.title) || matches(n.content))
      .slice(0, MAX_PER_GROUP)
      .map(n => ({
        id: n.id,
        type: "note",
        title: n.title || "Untitled note",
        snippet: n.content?.slice(0, 80),
        href: "/dashboard/notes",
      }))

    const todoResults: SearchResult[] = todos
      .filter(t => matches(t.title))
      .slice(0, MAX_PER_GROUP)
      .map(t => ({
        id: t.id,
        type: "todo",
        title: t.title,
        snippet: t.completed ? "Completed" : t.due_date ? `Due ${format(parseISO(t.due_date), "MMM d")}` : undefined,
        href: "/dashboard/todos",
      }))

    const allEvents = Object.values(calendarByMonth).flat()
    const seen = new Set<string>()
    const eventResults: SearchResult[] = allEvents
      .filter(e => {
        if (seen.has(e.id)) return false
        seen.add(e.id)
        return matches(e.title) || matches(e.description)
      })
      .slice(0, MAX_PER_GROUP)
      .map(e => ({
        id: e.id,
        type: "event",
        title: e.title,
        snippet: format(parseISO(e.start_date), "MMM d, yyyy"),
        href: `/dashboard/calendar?month=${e.start_date.slice(0, 7)}`,
      }))

    const habitResults: SearchResult[] = habits
      .filter(h => matches(h.name))
      .slice(0, MAX_PER_GROUP)
      .map(h => ({
        id: h.id,
        type: "habit",
        title: h.name,
        href: "/dashboard/habits",
      }))

    const goalResults: SearchResult[] = goals
      .filter(g => matches(g.title) || matches(g.description))
      .slice(0, MAX_PER_GROUP)
      .map(g => ({
        id: g.id,
        type: "goal",
        title: g.title,
        snippet: g.completed
          ? "Completed"
          : `${g.current_value} / ${g.target_value}${g.unit ? " " + g.unit : ""}`,
        href: "/dashboard/goals",
      }))

    const results = { note: noteResults, todo: todoResults, event: eventResults, habit: habitResults, goal: goalResults }
    const total = noteResults.length + todoResults.length + eventResults.length + habitResults.length + goalResults.length

    return { results, total }
  }, [query, notes, todos, calendarByMonth, habits, goals])
}
