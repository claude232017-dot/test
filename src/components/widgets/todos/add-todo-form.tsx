"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Todo } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PRIORITIES: { value: Todo["priority"]; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "text-green-400 border-green-500/30 bg-green-500/10" },
  { value: "medium", label: "Med", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
  { value: "high", label: "High", color: "text-red-400 border-red-500/30 bg-red-500/10" },
]

interface AddTodoFormProps {
  onAdd: (fields: { title: string; priority: Todo["priority"]; due_date?: string }) => void
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<Todo["priority"]>("medium")
  const [dueDate, setDueDate] = useState("")
  const [expanded, setExpanded] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), priority, due_date: dueDate || undefined })
    setTitle("")
    setDueDate("")
    setExpanded(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Add a task…"
          className="h-8 text-sm"
        />
        <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={!title.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {expanded && (
        <div className="flex items-center gap-2 pl-1">
          <span className="text-xs text-muted-foreground">Priority:</span>
          <div className="flex gap-1">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={cn(
                  "px-2 py-0.5 rounded text-xs border transition-all cursor-pointer",
                  priority === p.value ? p.color : "text-muted-foreground border-white/10 bg-transparent"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="ml-auto text-xs bg-white/5 border border-white/10 rounded px-2 py-0.5 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          />
        </div>
      )}
    </form>
  )
}
