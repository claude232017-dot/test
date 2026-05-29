"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, Target } from "lucide-react"
import { toast } from "sonner"
import { useHabits, calculateStreak } from "@/hooks/useHabits"
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

  async function handleToggle(habitId: string, date: string) {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return
    const wasDone = habit.logs.includes(date)
    await toggleHabitLog(habitId, date)
    if (!wasDone) {
      const newStreak = calculateStreak([...habit.logs, date], date)
      if (newStreak === 7) toast.success(`🔥 7-day streak on "${habit.name}"! Keep it up!`)
      else if (newStreak === 30) toast.success(`🏆 30-day streak on "${habit.name}"! Incredible!`)
    }
  }

  const doneToday = habits.filter(h => h.logs.includes(today)).length
  const pct = habits.length > 0 ? Math.round((doneToday / habits.length) * 100) : 0

  return (
    <div className="flex flex-col gap-4 min-h-[350px]">
      {/* Summary bar */}
      {habits.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{doneToday}/{habits.length} habits done today</span>
            <span className={cn(
              "font-semibold tabular-nums",
              pct === 100 ? "text-green-400" : pct >= 50 ? "text-purple-400" : "text-muted-foreground"
            )}>{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: pct === 100 ? "#22c55e" : "linear-gradient(90deg, #7c3aed, #06b6d4)" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Habits list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[68px] rounded-2xl bg-white/[0.03] animate-pulse" />
          ))
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32">
            <Target className="w-8 h-8 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">No habits yet — add one below</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {habits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                today={today}
                onToggle={handleToggle}
                onDelete={deleteHabit}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add form */}
      <div className="shrink-0">
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdd}
              className="overflow-hidden mb-2"
            >
              <div className="glass rounded-xl p-3 space-y-3">
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Habit name…"
                  className="h-9 text-sm"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">Color:</span>
                  <div className="flex gap-1.5 flex-1">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-5 h-5 rounded-full transition-all cursor-pointer shrink-0",
                          color === c ? "ring-2 ring-white/50 scale-110" : "opacity-60 hover:opacity-100"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <Button type="submit" size="sm" className="h-7 shrink-0" disabled={!name.trim()}>
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
      </div>
    </div>
  )
}
