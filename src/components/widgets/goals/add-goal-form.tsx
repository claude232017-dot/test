"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const COLORS = ["#f5c542", "#0f9bbd", "#9085e9", "#0ca30c", "#e66767", "#c98500", "#37d67a", "#b9b8ae"]

interface AddGoalFormProps {
  onCreate: (fields: {
    title: string
    description?: string
    target_value: number
    unit?: string
    deadline?: string
    color: string
  }) => Promise<void>
  onCancel: () => void
}

export function AddGoalForm({ onCreate, onCancel }: AddGoalFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [target, setTarget] = useState("")
  const [unit, setUnit] = useState("")
  const [deadline, setDeadline] = useState("")
  const [color, setColor] = useState(COLORS[0])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const targetNum = Number(target)
    if (!title.trim() || !Number.isFinite(targetNum) || targetNum <= 0) return
    await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      target_value: targetNum,
      unit: unit.trim() || undefined,
      deadline: deadline || undefined,
      color,
    })
    setTitle(""); setDescription(""); setTarget(""); setUnit(""); setDeadline(""); setColor(COLORS[0])
  }

  const canSubmit = title.trim() && Number(target) > 0

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-4 rounded-2xl bg-[rgba(var(--overlay),0.03)] border border-[rgba(var(--overlay),0.08)]"
    >
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Goal title (e.g. Read 20 books this year)"
        className="h-9 text-base sm:text-sm"
        autoFocus
      />
      <Input
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="h-9 text-base sm:text-sm"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Input
          type="number"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="Target"
          min="1"
          className="h-9 text-base sm:text-sm"
        />
        <Input
          value={unit}
          onChange={e => setUnit(e.target.value)}
          placeholder="Unit (books, km, …)"
          className="h-9 text-base sm:text-sm"
        />
        <input
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          className="col-span-2 sm:col-span-1 h-9 text-base sm:text-sm bg-[rgba(var(--overlay),0.05)] border border-[rgba(var(--overlay),0.1)] rounded-lg px-3 text-muted-foreground focus:outline-none focus:border-primary/50"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground shrink-0">Color</span>
        {COLORS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={cn(
              "w-6 h-6 rounded-full cursor-pointer transition-all shrink-0",
              color === c ? "ring-2 ring-[rgba(var(--overlay),0.6)]" : "opacity-60 hover:opacity-100"
            )}
            style={{ backgroundColor: c }}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <Button type="submit" size="sm" className="h-9" disabled={!canSubmit}>
          Create goal
        </Button>
      </div>
    </form>
  )
}
