"use client"

import { useState } from "react"
import { Plus, Repeat } from "lucide-react"
import { Todo, Recurrence } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PRIORITIES: { value: Todo["priority"]; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "text-green-400 border-green-500/30 bg-green-500/10" },
  { value: "medium", label: "Med", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
  { value: "high", label: "High", color: "text-red-400 border-red-500/30 bg-red-500/10" },
]

const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: "none", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

interface AddTodoFormProps {
  onAdd: (fields: { title: string; priority: Todo["priority"]; due_date?: string; recurrence?: Recurrence }) => void
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Todo["priority"]>("medium")
  const [dueDate, setDueDate] = useState("")
  const [recurrence, setRecurrence] = useState<Recurrence>("none")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), priority, due_date: dueDate || undefined, recurrence })
    setTitle("")
    setDueDate("")
    setRecurrence("none")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 pb-4 border-b border-[rgba(var(--overlay),0.05)]">
      {/* Input row */}
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Add a task…"
          className="h-9 text-base sm:text-sm"
        />
        <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!title.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Options row — always visible */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pl-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Priority</span>
          <div className="flex gap-1.5">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs border transition-all cursor-pointer min-h-[32px]",
                  priority === p.value ? p.color : "text-muted-foreground border-[rgba(var(--overlay),0.1)] bg-transparent hover:border-[rgba(var(--overlay),0.2)]"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="sm:ml-auto text-base sm:text-xs bg-[rgba(var(--overlay),0.05)] border border-[rgba(var(--overlay),0.1)] rounded-lg px-2.5 py-1.5 text-muted-foreground focus:outline-none focus:border-purple-500/50 min-h-[32px] w-full sm:w-auto"
        />
      </div>

      {/* Recurrence row */}
      <div className="flex items-center gap-2 pl-1 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Repeat className="w-3 h-3" />
          Repeat
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {RECURRENCES.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRecurrence(r.value)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs border transition-all cursor-pointer min-h-[32px]",
                recurrence === r.value
                  ? "text-purple-300 border-purple-500/30 bg-purple-500/10"
                  : "text-muted-foreground border-[rgba(var(--overlay),0.1)] bg-transparent hover:border-[rgba(var(--overlay),0.2)]"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  )
}
