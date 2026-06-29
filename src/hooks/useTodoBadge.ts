"use client"

import { useMemo } from "react"
import { useDataStore } from "@/stores/useDataStore"
import { isToday, isPast, parseISO, startOfDay } from "date-fns"

export function useTodoBadge() {
  const todos = useDataStore(s => s.todos)

  return useMemo(() => {
    let overdue = 0
    let dueToday = 0

    for (const todo of todos) {
      if (todo.completed || !todo.due_date) continue
      const date = startOfDay(parseISO(todo.due_date))
      if (isToday(date)) {
        dueToday++
      } else if (isPast(date)) {
        overdue++
      }
    }

    return { overdue, dueToday, total: overdue + dueToday }
  }, [todos])
}
