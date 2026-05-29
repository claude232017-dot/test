"use client"

import { motion } from "framer-motion"
import { Trash2, Flame } from "lucide-react"
import { HabitWithLogs, calculateStreak } from "@/hooks/useHabits"
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
  const streak = calculateStreak(habit.logs, today)

  return (
    <motion.div
      layout
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-white/5 bg-white/[0.02] group"
    >
      {/* Color dot */}
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />

      {/* Name + heatmap */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground truncate">{habit.name}</p>
        <HabitHeatmap logs={habit.logs} color={habit.color} today={today} />
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-1 shrink-0">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs text-orange-400 font-medium">{streak}</span>
        </div>
      )}

      {/* Toggle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onToggle(habit.id, today)}
        className={cn(
          "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer",
          isDoneToday
            ? "border-transparent text-white"
            : "border-white/20 hover:border-current text-transparent"
        )}
        style={isDoneToday ? { backgroundColor: habit.color, borderColor: habit.color } : { color: habit.color }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </motion.button>

      {/* Delete */}
      <button
        onClick={() => onDelete(habit.id)}
        className="opacity-40 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all cursor-pointer p-1 -m-1"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}
