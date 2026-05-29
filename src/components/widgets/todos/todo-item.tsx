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
      className="flex items-center gap-3 py-2 px-1 group rounded-lg hover:bg-white/[0.02] transition-colors"
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={cn(
          "w-5 h-5 rounded border-2 shrink-0 transition-all duration-200 cursor-pointer flex items-center justify-center",
          todo.completed
            ? "bg-purple-500 border-purple-500"
            : "border-white/20 hover:border-purple-400"
        )}
      >
        {todo.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Title */}
      <span className={cn(
        "flex-1 text-sm transition-all",
        todo.completed ? "line-through text-muted-foreground/50" : "text-foreground"
      )}>
        {todo.title}
      </span>

      {/* Priority badge */}
      <span className={cn(
        "text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 hidden sm:inline",
        PRIORITY_STYLES[todo.priority]
      )}>
        {todo.priority}
      </span>

      {/* Due date */}
      {todo.due_date && (
        <span className={cn(
          "text-[10px] shrink-0 hidden sm:inline",
          isOverdue ? "text-red-400" : "text-muted-foreground"
        )}>
          {format(new Date(todo.due_date), "MMM d")}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-40 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all cursor-pointer p-1 -m-1"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}
