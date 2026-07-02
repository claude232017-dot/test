"use client"

import { useEffect, useState } from "react"
import { createClient, getCurrentUserId } from "@/lib/supabase/client"
import { useDataStore } from "@/stores/useDataStore"
import { Todo } from "@/types"
import { toast } from "sonner"

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

  async function createTodo(fields: { title: string; priority: Todo["priority"]; due_date?: string }) {
    const userId = await getCurrentUserId()
    if (!userId) { toast.error("You must be signed in to add a task"); return }

    const nextPosition = todos.length > 0 ? Math.max(...todos.map(t => t.position)) + 1000 : 1000

    const optimistic: Todo = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: fields.title,
      completed: false,
      priority: fields.priority,
      due_date: fields.due_date ?? null,
      position: nextPosition,
      created_at: new Date().toISOString(),
    }
    setTodos(prev => [...prev, optimistic])

    const { data, error } = await supabase.from("todos").insert({ ...fields, position: nextPosition, user_id: userId }).select().single()
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
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    const newCompleted = !todo.completed
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: newCompleted } : t))
    const { error } = await supabase.from("todos").update({ completed: newCompleted }).eq("id", id)
    if (error) {
      toast.error("Failed to update todo")
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: todo.completed } : t))
    }
  }

  async function deleteTodo(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id))
    const { error } = await supabase.from("todos").delete().eq("id", id)
    if (error) { toast.error("Failed to delete todo"); loadTodos() }
  }

  return { todos, loading, createTodo, toggleTodo, deleteTodo, reorderTodos }
}
