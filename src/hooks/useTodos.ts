"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Todo } from "@/types"
import { toast } from "sonner"

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTodos()

    const channel = supabase
      .channel("todos")
      .on("postgres_changes", { event: "*", schema: "public", table: "todos" }, fetchTodos)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchTodos() {
    const { data, error } = await supabase
      .from("todos")
      .select("id,user_id,title,completed,priority,due_date,created_at")
      .order("created_at", { ascending: false })
    if (!error && data) setTodos(data)
    setLoading(false)
  }

  async function createTodo(fields: { title: string; priority: Todo["priority"]; due_date?: string }) {
    const optimistic: Todo = {
      id: crypto.randomUUID(),
      user_id: "",
      title: fields.title,
      completed: false,
      priority: fields.priority,
      due_date: fields.due_date ?? null,
      created_at: new Date().toISOString(),
    }
    setTodos(prev => [optimistic, ...prev])

    const { data, error } = await supabase.from("todos").insert(fields).select().single()
    if (error) {
      toast.error("Failed to create todo")
      setTodos(prev => prev.filter(t => t.id !== optimistic.id))
      return
    }
    setTodos(prev => prev.map(t => t.id === optimistic.id ? data : t))
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
    if (error) { toast.error("Failed to delete todo"); await fetchTodos() }
  }

  return { todos, loading, createTodo, toggleTodo, deleteTodo }
}
