"use client"

import { motion } from "framer-motion"
import { Trash2, Flame, Moon } from "lucide-react"
import { HabitWithLogs, calculateStreak, isScheduledOn } from "@/hooks/useHabits"
import { HabitHeatmap } from "./habit-heatmap"
import { cn } from "@/lib/utils"

interface HabitItemProps {
  habit: HabitWithLogs
  today: string
  onToggle: (id: string, date: string) => void
  onDelete: (id: string) => void
}

export function HabitItem({ habit, today, onToggle, onDelete }: HabitItemProps) {
  const isDoneToday = habit.logs.includes(today)
  const streak = calculateStreak(habit.logs, today, habit.schedule_days)
  const restDay = !isScheduledOn(habit.schedule_days, today)

  return (
    <motion.div
      layout
      className={cn(
        "flex items-center gap-3 py-3 px-3.5 rounded-2xl border border-[rgba(var(--overlay),0.06)] bg-[rgba(var(--overlay),0.02)] group transition-colors hover:bg-[rgba(var(--overlay),0.04)]",
        restDay && "opacity-60"
      )}
    >
      {/* Color dot */}
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
        style={{ backgroundColor: habit.color, color: habit.color }}
      />

      {/* Name + heatmap */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm font-medium text-foreground truncate leading-none">{habit.name}</p>
        <HabitHeatmap logs={habit.logs} color={habit.color} today={today} scheduleDays={habit.schedule_days} />
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-0.5 shrink-0 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <Flame className="w-3 h-3 text-orange-400" />
          <span className="text-xs font-semibold text-orange-400 tabular-nums">{streak}</span>
        </div>
      )}

      {/* Toggle button — or rest-day pill when not scheduled today */}
      {restDay ? (
        <span
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[rgba(var(--overlay),0.04)] text-[10px] text-muted-foreground shrink-0"
          title="Not scheduled today"
        >
          <Moon className="w-3 h-3" />
          Rest
        </span>
      ) : (
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => onToggle(habit.id, today)}
          className={cn(
            "w-11 h-11 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer",
            isDoneToday
              ? "border-transparent text-primary-foreground shadow-lg"
              : "border-[rgba(var(--overlay),0.2)] hover:border-current text-transparent"
          )}
          style={
            isDoneToday
              ? { backgroundColor: habit.color, borderColor: habit.color, boxShadow: `0 0 14px ${habit.color}60` }
              : { color: habit.color }
          }
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.button>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(habit.id)}
        className="opacity-50 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all cursor-pointer p-1.5 -m-1.5 min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}
