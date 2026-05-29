"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, Target } from "lucide-react"
import { useHabits } from "@/hooks/useHabits"
import { HabitItem } from "./habit-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const COLORS = ["#7c3aed", "#2563eb", "#06b6d4", "#16a34a", "#d97706", "#dc2626", "#db2777", "#6366f1"]

export function HabitsWidget() {
  const { habits, loading, today, createHabit, toggleHabitLog, deleteHabit } = useHabits()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState(COLORS[0])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createHabit(name.trim(), color)
    setName("")
    setColor(COLORS[0])
    setShowForm(false)
  }

  const doneToday = habits.filter(h => h.logs.includes(today)).length

  return (
    <div className="flex flex-col gap-4 min-h-[350px]">
      {/* Summary */}
      {habits.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{doneToday}/{habits.length} habits done today</span>
          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(doneToday / habits.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl p-3 space-y-3">
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Habit name…"
                className="h-8 text-sm"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Color:</span>
                <div className="flex gap-1.5">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-5 h-5 rounded-full transition-all cursor-pointer",
                        color === c ? "ring-2 ring-white/50 scale-110" : "opacity-60 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <Button type="submit" size="sm" className="ml-auto h-7" disabled={!name.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <Button variant="outline" size="sm" className="w-full" onClick={() => setShowForm(v => !v)}>
        <Plus className="w-4 h-4 mr-1" />
        {showForm ? "Cancel" : "New habit"}
      </Button>

      {/* Habits list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
          ))
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32">
            <Target className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No habits yet — add one above</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {habits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                today={today}
                onToggle={toggleHabitLog}
                onDelete={deleteHabit}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
