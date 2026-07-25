"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trash2, Plus, Minus, Check, Pencil, Trophy, TrendingUp, TrendingDown, Calendar, Target as TargetIcon } from "lucide-react"
import { differenceInCalendarDays, format, parseISO, addDays } from "date-fns"
import type { Goal } from "@/types"
import { progressPct } from "@/hooks/useGoals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const MILESTONE_TICKS = [25, 50, 75]
const COLORS = ["#f5c542", "#0f9bbd", "#9085e9", "#0ca30c", "#e66767", "#c98500", "#37d67a", "#b9b8ae"]

interface GoalDetailModalProps {
  goal: Goal | null
  onClose: () => void
  onIncrement: (id: string, by?: number) => void
  onUpdateProgress: (id: string, value: number) => void
  onUpdate: (id: string, fields: Partial<Pick<Goal, "title" | "description" | "target_value" | "unit" | "deadline" | "color">>) => Promise<void>
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "—"
  if (n === Math.floor(n)) return String(n)
  return n.toFixed(2).replace(/\.?0+$/, "")
}

export function GoalDetailModal({ goal, onClose, onIncrement, onUpdateProgress, onUpdate, onToggleComplete, onDelete }: GoalDetailModalProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    title: "", description: "", target_value: "", unit: "", deadline: "", color: COLORS[0],
  })
  const [progressInput, setProgressInput] = useState("")
  const [editingProgress, setEditingProgress] = useState(false)

  useEffect(() => {
    if (!goal) return
    setForm({
      title: goal.title,
      description: goal.description ?? "",
      target_value: String(goal.target_value),
      unit: goal.unit,
      deadline: goal.deadline ?? "",
      color: goal.color,
    })
    setEditing(false)
    setEditingProgress(false)
  }, [goal?.id])

  useEffect(() => {
    if (!goal) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [goal?.id])

  if (!goal) return null

  const pct = progressPct(goal)
  const today = new Date()
  const created = parseISO(goal.created_at)
  const deadline = goal.deadline ? parseISO(goal.deadline) : null

  const daysElapsed = Math.max(1, differenceInCalendarDays(today, created) + 1)
  const daysTotal = deadline ? Math.max(1, differenceInCalendarDays(deadline, created) + 1) : null
  const daysLeft = deadline ? differenceInCalendarDays(deadline, today) : null
  const pctTimeElapsed = daysTotal ? Math.min(100, Math.round((daysElapsed / daysTotal) * 100)) : null

  const currentPace = goal.current_value / daysElapsed
  const remaining = Math.max(0, goal.target_value - goal.current_value)
  const requiredPace = daysLeft !== null && daysLeft > 0 ? remaining / daysLeft : null
  const projectedDaysToFinish = currentPace > 0 ? remaining / currentPace : null
  const projectedFinish = projectedDaysToFinish !== null ? addDays(today, projectedDaysToFinish) : null

  let status: "complete" | "ahead" | "ontrack" | "behind" | "overdue" | null = null
  if (goal.completed) status = "complete"
  else if (deadline && daysLeft !== null && daysLeft < 0) status = "overdue"
  else if (pctTimeElapsed !== null) {
    if (pct >= pctTimeElapsed + 5) status = "ahead"
    else if (pct >= pctTimeElapsed - 5) status = "ontrack"
    else status = "behind"
  }

  async function handleSaveEdit() {
    const target = Number(form.target_value)
    if (!form.title.trim() || !Number.isFinite(target) || target <= 0) return
    await onUpdate(goal!.id, {
      title: form.title.trim(),
      description: form.description.trim() || null,
      target_value: target,
      unit: form.unit.trim(),
      deadline: form.deadline || null,
      color: form.color,
    })
    setEditing(false)
  }

  function commitProgressEdit() {
    const n = Number(progressInput)
    if (Number.isFinite(n) && n >= 0) onUpdateProgress(goal!.id, n)
    setEditingProgress(false)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[55] flex items-center justify-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={goal.title}
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-lg max-h-full overflow-y-auto glass-strong rounded-2xl border border-[rgba(var(--overlay),0.1)] shadow-2xl"
        >
          {/* Color stripe */}
          <div className="h-1 w-full" style={{ backgroundColor: goal.color }} />

          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
            <div className="flex-1 min-w-0">
              {editing ? (
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Goal title"
                  className="h-9 text-base font-semibold"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className={cn("text-lg font-semibold text-foreground", goal.completed && "line-through opacity-70")}>
                    {goal.title}
                  </h2>
                  {goal.completed && <Trophy className="w-4 h-4 text-amber-400" />}
                </div>
              )}
              {editing ? (
                <Input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="h-8 text-base sm:text-xs mt-2"
                />
              ) : goal.description ? (
                <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[rgba(var(--overlay),0.05)] transition-colors cursor-pointer"
                  aria-label="Edit goal"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[rgba(var(--overlay),0.05)] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Big percentage + numbers */}
          <div className="px-5 pb-4">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <div className="flex items-baseline gap-1.5">
                {editingProgress ? (
                  <input
                    type="number"
                    value={progressInput}
                    onChange={e => setProgressInput(e.target.value)}
                    onBlur={commitProgressEdit}
                    onKeyDown={e => { if (e.key === "Enter") commitProgressEdit(); if (e.key === "Escape") setEditingProgress(false) }}
                    autoFocus
                    className="w-24 h-9 px-2 rounded-lg bg-[rgba(var(--overlay),0.06)] border border-[rgba(var(--overlay),0.12)] text-2xl font-bold text-foreground tabular-nums focus:outline-none focus:border-primary/50"
                  />
                ) : (
                  <button
                    onClick={() => { setProgressInput(String(goal.current_value)); setEditingProgress(true) }}
                    className="text-2xl font-bold text-foreground tabular-nums hover:text-gold transition-colors cursor-pointer"
                    title="Click to edit"
                  >
                    {formatNumber(goal.current_value)}
                  </button>
                )}
                <span className="text-base text-muted-foreground">/ {formatNumber(goal.target_value)}</span>
                {goal.unit && <span className="text-sm text-muted-foreground">{goal.unit}</span>}
              </div>
              <span className="text-3xl font-bold tabular-nums" style={{ color: goal.color }}>{pct}%</span>
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-3 bg-[rgba(var(--overlay),0.05)] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: goal.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="relative h-0">
              {MILESTONE_TICKS.map(m => (
                <div
                  key={m}
                  className="absolute -top-3 h-3 w-px bg-[rgba(var(--overlay),0.2)]"
                  style={{ left: `${m}%` }}
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Increment controls */}
            {!goal.completed && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => onIncrement(goal.id, -1)}
                  disabled={goal.current_value <= 0}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[rgba(var(--overlay),0.05)] hover:bg-[rgba(var(--overlay),0.1)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Decrement"
                >
                  <Minus className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={() => onIncrement(goal.id, 1)}
                  className="flex items-center justify-center w-11 h-11 rounded-full text-primary-foreground shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: goal.color }}
                  aria-label="Increment"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Timeline strip */}
          {deadline && daysTotal !== null && pctTimeElapsed !== null && !editing && (
            <div className="px-5 pb-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Day <span className="font-semibold text-foreground tabular-nums">{Math.min(daysElapsed, daysTotal)}</span> of <span className="tabular-nums">{daysTotal}</span>
                </span>
                <span className="text-muted-foreground tabular-nums">{pctTimeElapsed}% of time</span>
              </div>
              <div className="relative w-full h-1.5 bg-[rgba(var(--overlay),0.05)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[rgba(var(--overlay),0.25)]"
                  style={{ width: `${pctTimeElapsed}%` }}
                />
              </div>
            </div>
          )}

          {/* Status badge */}
          {status && !editing && (
            <div className="px-5 pb-4">
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
                status === "complete" && "text-amber-300 bg-amber-500/10 border border-amber-500/20",
                status === "ahead" && "text-green-300 bg-green-500/10 border border-green-500/20",
                status === "ontrack" && "text-cyan-300 bg-cyan-500/10 border border-cyan-500/20",
                status === "behind" && "text-orange-300 bg-orange-500/10 border border-orange-500/20",
                status === "overdue" && "text-red-300 bg-red-500/10 border border-red-500/20",
              )}>
                {status === "complete" && <><Trophy className="w-3.5 h-3.5" /> Goal complete</>}
                {status === "ahead" && <><TrendingUp className="w-3.5 h-3.5" /> Ahead of schedule</>}
                {status === "ontrack" && <><TargetIcon className="w-3.5 h-3.5" /> On track</>}
                {status === "behind" && <><TrendingDown className="w-3.5 h-3.5" /> Behind schedule</>}
                {status === "overdue" && <><Calendar className="w-3.5 h-3.5" /> Past deadline</>}
              </div>
            </div>
          )}

          {/* Stats grid */}
          {!editing && (
            <div className="px-5 pb-4 grid grid-cols-2 gap-2">
              <Stat label="Days elapsed" value={`${daysElapsed}d`} />
              {daysLeft !== null && (
                <Stat
                  label="Days remaining"
                  value={daysLeft < 0 ? `${Math.abs(daysLeft)}d over` : `${daysLeft}d`}
                  tone={daysLeft < 0 ? "danger" : daysLeft <= 7 ? "warn" : undefined}
                />
              )}
              <Stat label="Current pace" value={`${formatNumber(currentPace)}${goal.unit ? " " + goal.unit : ""}/day`} />
              {requiredPace !== null && !goal.completed && (
                <Stat
                  label="Pace needed"
                  value={`${formatNumber(requiredPace)}${goal.unit ? " " + goal.unit : ""}/day`}
                  tone={requiredPace > currentPace * 1.2 ? "warn" : undefined}
                />
              )}
              {projectedFinish && !goal.completed && (
                <Stat
                  label="Projected finish"
                  value={format(projectedFinish, "MMM d, yyyy")}
                  full={!deadline}
                />
              )}
              {deadline && (
                <Stat label="Deadline" value={format(deadline, "MMM d, yyyy")} />
              )}
            </div>
          )}

          {/* Edit form fields */}
          {editing && (
            <div className="px-5 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 px-1 mb-1 block">Target</label>
                  <Input
                    type="number"
                    value={form.target_value}
                    onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))}
                    min="1"
                    className="h-9 text-base sm:text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 px-1 mb-1 block">Unit</label>
                  <Input
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    placeholder="books, km, …"
                    className="h-9 text-base sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 px-1 mb-1 block">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full h-9 text-base sm:text-sm bg-[rgba(var(--overlay),0.05)] border border-[rgba(var(--overlay),0.1)] rounded-lg px-3 text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 px-1 mb-1 block">Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={cn(
                        "w-6 h-6 rounded-full cursor-pointer transition-all shrink-0",
                        form.color === c ? "ring-2 ring-[rgba(var(--overlay),0.6)]" : "opacity-60 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-[rgba(var(--overlay),0.06)] px-5 py-3 flex items-center justify-between gap-2">
            <button
              onClick={() => { onDelete(goal.id); onClose() }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors cursor-pointer px-2 py-1.5 rounded-md"
              aria-label="Delete goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>

            {editing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2 py-1.5 rounded-md"
                >
                  Cancel
                </button>
                <Button size="sm" className="h-8" onClick={handleSaveEdit} disabled={!form.title.trim() || Number(form.target_value) <= 0}>
                  Save
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant={goal.completed ? "outline" : "default"}
                className="h-8"
                onClick={() => onToggleComplete(goal.id)}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                {goal.completed ? "Reopen" : "Mark complete"}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function Stat({ label, value, tone, full }: { label: string; value: string; tone?: "warn" | "danger"; full?: boolean }) {
  return (
    <div className={cn(
      "rounded-lg bg-[rgba(var(--overlay),0.03)] border border-[rgba(var(--overlay),0.05)] px-3 py-2",
      full && "col-span-2"
    )}>
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">{label}</p>
      <p className={cn(
        "text-sm font-semibold tabular-nums mt-0.5",
        tone === "warn" && "text-amber-400",
        tone === "danger" && "text-red-400",
        !tone && "text-foreground"
      )}>
        {value}
      </p>
    </div>
  )
}
