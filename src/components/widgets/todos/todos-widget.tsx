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

export function TodosWidget() {
  const { todos, loading, createTodo, toggleTodo, deleteTodo } = useTodos()
  const [filter, setFilter] = useState<Filter>("all")

  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.filter(t => t.completed).length

  const FILTERS: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All", count: todos.length },
    { value: "active", label: "Active", count: activeCount },
    { value: "completed", label: "Done", count: completedCount },
  ]

  const filtered = todos.filter(t => {
    if (filter === "active") return !t.completed
    if (filter === "completed") return t.completed
    return true
  })

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                filter === f.value
                  ? "bg-white/10 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              {f.count > 0 && (
                <span className={cn(
                  "text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-semibold",
                  filter === f.value ? "bg-purple-500/30 text-purple-300" : "bg-white/5 text-muted-foreground"
                )}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add form */}
      <AddTodoForm onAdd={createTodo} />

      {/* List */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-0.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-white/[0.03] animate-pulse my-1" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32">
            <CheckSquare className="w-8 h-8 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">
              {filter === "completed" ? "No completed tasks yet" : filter === "active" ? "All caught up!" : "No tasks yet"}
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
