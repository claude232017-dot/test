"use client"

import { useEffect, useRef, useState } from "react"
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
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!expanded) return
    function handleClick(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [expanded])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), priority, due_date: dueDate || undefined })
    setTitle("")
    setDueDate("")
    setExpanded(false)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2.5">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Add a task…"
          className="h-9 text-sm"
        />
        <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!title.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {expanded && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pl-1">
          {/* Priority */}
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
                    priority === p.value ? p.color : "text-muted-foreground border-white/10 bg-transparent"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="sm:ml-auto text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-muted-foreground focus:outline-none focus:border-purple-500/50 min-h-[32px] w-full sm:w-auto"
          />
        </div>
      )}
    </form>
  )
}
