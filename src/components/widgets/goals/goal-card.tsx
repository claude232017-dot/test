"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Check, Calendar, Trophy } from "lucide-react"
import { differenceInDays, parseISO, isPast } from "date-fns"
import type { Goal } from "@/types"
import { progressPct } from "@/hooks/useGoals"
import { cn } from "@/lib/utils"

interface GoalCardProps {
  goal: Goal
  onIncrement: (id: string, by?: number) => void
  onUpdateProgress: (id: string, value: number) => void
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onOpen?: (goal: Goal) => void
}

const MILESTONE_TICKS = [25, 50, 75]

export function GoalCard({ goal, onIncrement, onUpdateProgress, onToggleComplete, onDelete, onOpen }: GoalCardProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(goal.current_value))

  const pct = progressPct(goal)
  const deadline = goal.deadline ? parseISO(goal.deadline) : null
  const daysLeft = deadline ? differenceInDays(deadline, new Date()) : null
  const overdue = deadline && !goal.completed && isPast(deadline) && daysLeft !== null && daysLeft < 0

  function commitEdit() {
    const n = Number(editValue)
    if (!Number.isFinite(n) || n < 0) { setEditing(false); setEditValue(String(goal.current_value)); return }
    onUpdateProgress(goal.id, n)
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={() => onOpen?.(goal)}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={onOpen ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(goal) } } : undefined}
      className={cn(
        "relative rounded-2xl p-4 border bg-[rgba(var(--overlay),0.03)] border-[rgba(var(--overlay),0.06)] overflow-hidden group transition-colors",
        onOpen && "cursor-pointer hover:bg-[rgba(var(--overlay),0.05)]",
        goal.completed && "opacity-60"
      )}
    >
      {/* Color stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: goal.color }} />

      <div className="flex items-start gap-3 mb-3 pl-2">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleComplete(goal.id) }}
          className={cn(
            "w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer",
            goal.completed ? "border-transparent" : "border-[rgba(var(--overlay),0.2)] hover:border-purple-400"
          )}
          style={goal.completed ? { backgroundColor: goal.color } : undefined}
          aria-label={goal.completed ? "Mark incomplete" : "Mark complete"}
        >
          {goal.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={cn("text-sm font-semibold text-foreground", goal.completed && "line-through")}>
              {goal.title}
            </h3>
            {goal.completed && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
          </div>
          {goal.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(goal.id) }}
          className="opacity-50 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all cursor-pointer p-2 -m-2 shrink-0"
          aria-label="Delete goal"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar with milestone ticks */}
      <div className="relative pl-2 mb-2">
        <div className="relative w-full h-2 bg-[rgba(var(--overlay),0.05)] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: goal.color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        {/* Milestone ticks */}
        {MILESTONE_TICKS.map(m => (
          <div
            key={m}
            className="absolute top-0 h-2 w-px bg-[rgba(var(--overlay),0.15)]"
            style={{ left: `calc(${m}% + 8px)` }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Numbers + actions */}
      <div className="flex items-center justify-between gap-2 pl-2 mt-3">
        <div className="flex items-baseline gap-1.5 text-xs">
          {editing ? (
            <input
              type="number"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") commitEdit(); if (e.key === "Escape") { setEditing(false); setEditValue(String(goal.current_value)) } }}
              autoFocus
              className="w-20 sm:w-16 h-7 sm:h-6 px-1.5 rounded bg-[rgba(var(--overlay),0.06)] border border-[rgba(var(--overlay),0.12)] text-foreground text-base sm:text-xs tabular-nums focus:outline-none focus:border-purple-500/50"
            />
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setEditValue(String(goal.current_value)); setEditing(true) }}
              className="font-semibold text-foreground tabular-nums hover:text-purple-400 transition-colors cursor-pointer"
              title="Click to edit"
            >
              {goal.current_value}
            </button>
          )}
          <span className="text-muted-foreground">/ {goal.target_value}</span>
          {goal.unit && <span className="text-muted-foreground">{goal.unit}</span>}
          <span className="text-muted-foreground/60 ml-1">· {pct}%</span>
        </div>

        <div className="flex items-center gap-1.5">
          {deadline && (
            <span className={cn(
              "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md",
              overdue ? "text-red-400 bg-red-500/10" : daysLeft !== null && daysLeft <= 7 ? "text-amber-400 bg-amber-500/10" : "text-muted-foreground/70"
            )}>
              <Calendar className="w-2.5 h-2.5" />
              {overdue ? "Overdue" : daysLeft === 0 ? "Today" : daysLeft === 1 ? "1 day" : `${daysLeft}d`}
            </span>
          )}
          {!goal.completed && (
            <button
              onClick={(e) => { e.stopPropagation(); onIncrement(goal.id, 1) }}
              className="flex items-center justify-center w-9 h-9 sm:w-7 sm:h-7 rounded-full text-white shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: goal.color }}
              aria-label="Increment progress"
            >
              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
