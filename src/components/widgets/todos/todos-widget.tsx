"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { CheckSquare } from "lucide-react"
import { useTodos } from "@/hooks/useTodos"
import { Todo } from "@/types"
import { AddTodoForm } from "./add-todo-form"
import { TodoItem } from "./todo-item"
import { cn } from "@/lib/utils"

type Filter = "all" | "active" | "completed"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Done" },
]

export function TodosWidget() {
  const { todos, loading, createTodo, toggleTodo, deleteTodo } = useTodos()
  const [filter, setFilter] = useState<Filter>("all")

  const filtered = todos.filter(t => {
    if (filter === "active") return !t.completed
    if (filter === "completed") return t.completed
    return true
  })

  const activeCount = todos.filter(t => !t.completed).length

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                filter === f.value
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {activeCount > 0 && (
          <span className="text-xs text-muted-foreground">{activeCount} remaining</span>
        )}
      </div>

      {/* Add form */}
      <AddTodoForm onAdd={createTodo} />

      {/* List */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-0.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-white/5 animate-pulse my-1.5" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32">
            <CheckSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">
              {filter === "completed" ? "No completed tasks yet" : "No tasks yet"}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
