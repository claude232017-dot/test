"use client"

import { useEffect, useState } from "react"
import { format, addDays, addWeeks, addMonths, parseISO } from "date-fns"
import { createClient, getCurrentUserId } from "@/lib/supabase/client"
import { useDataStore } from "@/stores/useDataStore"
import { Todo, Recurrence } from "@/types"
import { toast } from "sonner"

/** Next due date for a recurring todo, advanced from its current due date (or today). */
function nextDueDate(dueDate: string | null, recurrence: Recurrence): string {
  const base = dueDate ? parseISO(dueDate) : new Date()
  const next =
    recurrence === "daily" ? addDays(base, 1) :
    recurrence === "weekly" ? addWeeks(base, 1) :
    addMonths(base, 1)
  return format(next, "yyyy-MM-dd")
}

export function useTodos() {
  const supabase = createClient()
  const todos = useDataStore(s => s.todos)
  const hydrated = useDataStore(s => s.todosHydrated)
  const setTodos = useDataStore(s => s.setTodos)
  const loadTodos = useDataStore(s => s.loadTodos)

  const [loading, setLoading] = useState(!hydrated)

  useEffect(() => {
    loadTodos().finally(() => setLoading(false))
  }, [])

  async function createTodo(fields: { title: string; priority: Todo["priority"]; due_date?: string; recurrence?: Recurrence }) {
    const userId = await getCurrentUserId()
    if (!userId) { toast.error("You must be signed in to add a task"); return }

    const nextPosition = todos.length > 0 ? Math.max(...todos.map(t => t.position ?? 0)) + 1000 : 1000

    const optimistic: Todo = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: fields.title,
      completed: false,
      priority: fields.priority,
      due_date: fields.due_date ?? null,
      recurrence: fields.recurrence ?? "none",
      position: nextPosition,
      created_at: new Date().toISOString(),
    }
    setTodos(prev => [...prev, optimistic])

    const { data, error } = await supabase
      .from("todos")
      .insert({ ...fields, recurrence: fields.recurrence ?? "none", position: nextPosition, user_id: userId })
      .select()
      .single()
    if (error) {
      toast.error("Failed to create todo")
      setTodos(prev => prev.filter(t => t.id !== optimistic.id))
      return
    }
    setTodos(prev => prev.map(t => t.id === optimistic.id ? data : t))
  }

  async function reorderTodos(orderedIds: string[]) {
    // Recompute all positions with 1000-step gaps
    const idToPos = new Map(orderedIds.map((id, i) => [id, (i + 1) * 1000]))
    setTodos(prev => {
      const next = prev.map(t => idToPos.has(t.id) ? { ...t, position: idToPos.get(t.id)! } : t)
      return [...next].sort((a, b) => a.position - b.position)
    })

    const updates = await Promise.all(
      orderedIds.map(id =>
        supabase.from("todos").update({ position: idToPos.get(id)! }).eq("id", id)
      )
    )
    if (updates.some(r => r.error)) { toast.error("Failed to save order"); loadTodos() }
  }

  async function toggleTodo(id: string) {
    // Read from the store, not the render-time closure: two rapid clicks then
    // resolve as check → uncheck instead of double-completing (and double-spawning).
    const todo = useDataStore.getState().todos.find(t => t.id === id)
    if (!todo) return
    const newCompleted = !todo.completed
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: newCompleted } : t))
    const { error } = await supabase.from("todos").update({ completed: newCompleted }).eq("id", id)
    if (error) {
      toast.error("Failed to update todo")
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: todo.completed } : t))
      return
    }

    if (!todo.recurrence || todo.recurrence === "none") return
    const due = nextDueDate(todo.due_date, todo.recurrence)
    // The spawned next occurrence is identified by title + recurrence + the
    // computed next due date, still uncompleted.
    const findSpawned = () => useDataStore.getState().todos.find(t =>
      t.id !== id && !t.completed &&
      t.title === todo.title && t.recurrence === todo.recurrence && t.due_date === due
    )

    if (newCompleted) {
      // Spawn the next occurrence — unless it already exists (re-completing
      // after an accidental uncheck must not create duplicates).
      if (findSpawned()) return
      const userId = await getCurrentUserId()
      if (!userId) return
      const nextPosition = Math.max(0, ...useDataStore.getState().todos.map(t => t.position ?? 0)) + 1000
      const { data, error: spawnError } = await supabase
        .from("todos")
        .insert({
          title: todo.title,
          priority: todo.priority,
          due_date: due,
          recurrence: todo.recurrence,
          position: nextPosition,
          user_id: userId,
        })
        .select()
        .single()
      if (!spawnError && data) {
        setTodos(prev => [...prev, data])
        toast(`↻ Next "${todo.title}" scheduled for ${format(parseISO(due), "MMM d")}`)
      }
    } else {
      // Un-completing takes back the occurrence that completing spawned
      const spawned = findSpawned()
      if (spawned) {
        setTodos(prev => prev.filter(t => t.id !== spawned.id))
        const { error: cleanupError } = await supabase.from("todos").delete().eq("id", spawned.id)
        if (cleanupError) loadTodos()
      }
    }
  }

  async function deleteTodo(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id))
    const { error } = await supabase.from("todos").delete().eq("id", id)
    if (error) { toast.error("Failed to delete todo"); loadTodos() }
  }

  return { todos, loading, createTodo, toggleTodo, deleteTodo, reorderTodos }
}
