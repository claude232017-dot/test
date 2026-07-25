"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { CheckSquare } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useTodos } from "@/hooks/useTodos"
import { usePomodoroStore } from "@/stores/usePomodoroStore"
import { Todo } from "@/types"
import { AddTodoForm } from "./add-todo-form"
import { TodoItem } from "./todo-item"
import { SortableItem } from "@/components/ui/sortable-item"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type Filter = "all" | "active" | "completed"

export function TodosWidget() {
  const { todos, loading, createTodo, toggleTodo, deleteTodo, reorderTodos } = useTodos()
  const setLinkedTodo = usePomodoroStore(s => s.setLinkedTodo)
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>("all")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const activeTodo = todos.find(t => t.id === active.id)
    const overTodo = todos.find(t => t.id === over.id)
    if (!activeTodo || !overTodo || activeTodo.completed !== overTodo.completed) return
    // Reorder within the same completion group (persists global order)
    const oldIndex = todos.findIndex(t => t.id === active.id)
    const newIndex = todos.findIndex(t => t.id === over.id)
    const nextOrder = arrayMove(todos, oldIndex, newIndex).map(t => t.id)
    reorderTodos(nextOrder)
  }

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

  function handleFocus(todo: Todo) {
    setLinkedTodo(todo.id, todo.title)
    router.push("/dashboard/pomodoro")
  }

  return (
    <div className="flex flex-col h-full min-h-[400px] gap-4">
      <AddTodoForm onAdd={createTodo} />

      <div className="flex items-center">
        <div className="flex gap-1 bg-[rgba(var(--overlay),0.03)] rounded-xl p-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 sm:py-1 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[36px] sm:min-h-0",
                filter === f.value
                  ? "bg-[rgba(var(--overlay),0.1)] text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              {f.count > 0 && (
                <span className={cn(
                  "text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-semibold",
                  filter === f.value ? "bg-primary/30 text-accent-strong" : "bg-[rgba(var(--overlay),0.05)] text-muted-foreground"
                )}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5 pl-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-[rgba(var(--overlay),0.03)] animate-pulse my-1" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32">
            <CheckSquare className="w-8 h-8 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">
              {filter === "completed" ? "No completed tasks yet" : filter === "active" ? "All caught up!" : "No tasks yet"}
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence initial={false}>
                {filtered.map(todo => (
                  <SortableItem key={todo.id} id={todo.id}>
                    <TodoItem
                      todo={todo}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                      onFocus={handleFocus}
                    />
                  </SortableItem>
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
