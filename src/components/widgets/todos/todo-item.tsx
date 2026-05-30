"use client"

import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import { format, isPast, isToday } from "date-fns"
import { Todo } from "@/types"
import { cn } from "@/lib/utils"

const PRIORITY_STYLES: Record<Todo["priority"], string> = {
  high: "text-red-400 border-red-500/30 bg-red-500/10",
  medium: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  low: "text-green-400 border-green-500/30 bg-green-500/10",
}

const PRIORITY_BAR: Record<Todo["priority"], string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
}

const PRIORITY_LABEL: Record<Todo["priority"], string> = {
  high: "High",
  medium: "Med",
  low: "Low",
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const isOverdue = todo.due_date && !todo.completed && isPast(new Date(todo.due_date + "T23:59:59")) && !isToday(new Date(todo.due_date))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="flex items-center gap-3 py-2.5 px-3 group rounded-xl hover:bg-white/[0.03] transition-colors relative overflow-hidden"
    >
      {/* Priority bar — slightly thicker */}
      {!todo.completed && (
        <div className={cn("absolute left-0 top-2 bottom-2 w-[3px] rounded-full", PRIORITY_BAR[todo.priority])} />
      )}

      {/* Checkbox — larger hit area for mobile */}
      <button
        onClick={() => onToggle(todo.id)}
        className="p-2 -m-2 shrink-0 cursor-pointer"
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
      >
        <div className={cn(
          "w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
          todo.completed ? "bg-purple-500 border-purple-500" : "border-white/20 hover:border-purple-400"
        )}>
          {todo.completed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </button>

      {/* Title */}
      <span className={cn(
        "flex-1 text-sm transition-all min-w-0 truncate",
        todo.completed ? "line-through text-muted-foreground/40" : "text-foreground"
      )}>
        {todo.title}
      </span>

      {/* Due date */}
      {todo.due_date && (
        <span className={cn(
          "text-[10px] shrink-0",
          isOverdue ? "text-red-400" : "text-muted-foreground/60"
        )}>
          {format(new Date(todo.due_date), "MMM d")}
        </span>
      )}

      {/* Priority badge — hidden when completed (strikethrough is enough) */}
      {!todo.completed && (
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-md border font-medium shrink-0",
          PRIORITY_STYLES[todo.priority]
        )}>
          {PRIORITY_LABEL[todo.priority]}
        </span>
      )}

      {/* Delete — always visible on mobile, hover-only on desktop */}
      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-50 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all cursor-pointer p-2 -m-2 shrink-0"
        aria-label="Delete task"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}
