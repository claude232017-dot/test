"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, Target } from "lucide-react"
import { toast } from "sonner"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useHabits, calculateStreak, isScheduledOn } from "@/hooks/useHabits"
import { HabitItem } from "./habit-item"
import { SortableItem } from "@/components/ui/sortable-item"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const COLORS = ["#7c3aed", "#2563eb", "#06b6d4", "#16a34a", "#d97706", "#dc2626", "#db2777", "#6366f1"]
const WEEKDAY_CHIPS = ["S", "M", "T", "W", "T", "F", "S"] // index = getDay()
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

export function HabitsWidget() {
  const { habits, loading, today, createHabit, toggleHabitLog, deleteHabit, reorderHabits } = useHabits()
  const [showForm, setShowForm] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = habits.findIndex(h => h.id === active.id)
    const newIndex = habits.findIndex(h => h.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const nextOrder = arrayMove(habits, oldIndex, newIndex).map(h => h.id)
    reorderHabits(nextOrder)
  }
  const [name, setName] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [days, setDays] = useState<number[]>(ALL_DAYS)

  function toggleDay(d: number) {
    setDays(prev => {
      const next = prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort()
      return next.length === 0 ? prev : next // at least one day required
    })
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createHabit(name.trim(), color, days)
    setName("")
    setColor(COLORS[0])
    setDays(ALL_DAYS)
    setShowForm(false)
  }

  async function handleToggle(habitId: string, date: string) {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return
    const wasDone = habit.logs.includes(date)
    await toggleHabitLog(habitId, date)
    if (!wasDone) {
      const newStreak = calculateStreak([...habit.logs, date], date, habit.schedule_days)
      if (newStreak === 7) toast.success(`🔥 7-day streak on "${habit.name}"! Keep it up!`)
      else if (newStreak === 30) toast.success(`🏆 30-day streak on "${habit.name}"! Incredible!`)
    }
  }

  // Only habits scheduled today count toward the daily summary
  const scheduledToday = habits.filter(h => isScheduledOn(h.schedule_days, today))
  const doneToday = scheduledToday.filter(h => h.logs.includes(today)).length
  const pct = scheduledToday.length > 0 ? Math.round((doneToday / scheduledToday.length) * 100) : 0

  return (
    <div className="flex flex-col gap-4 min-h-[350px]">
      {/* Summary bar */}
      {habits.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {scheduledToday.length === 0
                ? "No habits scheduled today"
                : `${doneToday}/${scheduledToday.length} habits done today`}
            </span>
            <span className={cn(
              "font-semibold tabular-nums",
              pct === 100 ? "text-green-400" : pct >= 50 ? "text-purple-400" : "text-muted-foreground"
            )}>{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[rgba(var(--overlay),0.05)] rounded-full overflow-hidden">
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
      <div className="flex-1 overflow-y-auto space-y-2 pl-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[68px] rounded-2xl bg-[rgba(var(--overlay),0.03)] animate-pulse" />
          ))
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-16 sm:h-32">
            <Target className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">No habits yet — add one below</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={habits.map(h => h.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence initial={false}>
                {habits.map(habit => (
                  <SortableItem key={habit.id} id={habit.id}>
                    <HabitItem
                      habit={habit}
                      today={today}
                      onToggle={handleToggle}
                      onDelete={deleteHabit}
                    />
                  </SortableItem>
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
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
              className="overflow-hidden"
            >
              <div className="pb-4 border-b border-[rgba(var(--overlay),0.05)] mb-4 space-y-3">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Habit name…"
                  autoFocus
                  className="w-full h-9 rounded-lg bg-[rgba(var(--overlay),0.05)] px-3.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors"
                  style={{ border: `1px solid ${color}70`, outline: 'none', boxShadow: 'none' }}
                />
                {/* Color row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground shrink-0">Color</span>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-7 h-7 sm:w-5 sm:h-5 rounded-full transition-all cursor-pointer shrink-0",
                          color === c ? "ring-2 ring-[rgba(var(--overlay),0.6)]" : "opacity-60 hover:opacity-100"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Schedule row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground shrink-0">Days</span>
                  <div className="flex gap-1.5">
                    {WEEKDAY_CHIPS.map((label, d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(d)}
                        aria-pressed={days.includes(d)}
                        className={cn(
                          "w-7 h-7 rounded-full text-[10px] font-semibold transition-all cursor-pointer shrink-0",
                          days.includes(d)
                            ? "text-white shadow-sm"
                            : "bg-[rgba(var(--overlay),0.05)] text-muted-foreground hover:text-foreground"
                        )}
                        style={days.includes(d) ? { backgroundColor: color } : undefined}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {days.length === 7 && <span className="text-[10px] text-muted-foreground/60">every day</span>}
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm" className="h-9" disabled={!name.trim()}>
                    Add habit
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {!showForm && (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New habit
          </Button>
        )}
      </div>
    </div>
  )
}
