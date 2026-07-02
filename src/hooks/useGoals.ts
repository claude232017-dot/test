"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { createClient, getCurrentUserId } from "@/lib/supabase/client"
import { useDataStore } from "@/stores/useDataStore"
import type { Goal } from "@/types"

const MILESTONES = [25, 50, 75, 100] as const

function progressPct(goal: Pick<Goal, "current_value" | "target_value">): number {
  if (goal.target_value <= 0) return 0
  return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
}

export function useGoals() {
  const supabase = createClient()
  const goals = useDataStore(s => s.goals)
  const hydrated = useDataStore(s => s.goalsHydrated)
  const setGoals = useDataStore(s => s.setGoals)
  const loadGoals = useDataStore(s => s.loadGoals)

  const [loading, setLoading] = useState(!hydrated)
  const milestonesShownRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    loadGoals().finally(() => setLoading(false))
  }, [])

  async function createGoal(fields: {
    title: string
    description?: string
    target_value: number
    unit?: string
    deadline?: string
    color: string
  }) {
    const userId = await getCurrentUserId()
    if (!userId) { toast.error("You must be signed in to create a goal"); return }
    const nextPosition = goals.length > 0 ? Math.max(...goals.map(g => g.position)) + 1000 : 1000
    const payload = {
      title: fields.title,
      description: fields.description || null,
      target_value: fields.target_value,
      unit: fields.unit ?? "",
      deadline: fields.deadline || null,
      color: fields.color,
      position: nextPosition,
      user_id: userId,
    }
    const { data, error } = await supabase.from("goals").insert(payload).select().single()
    if (error) { toast.error("Failed to create goal"); return }
    setGoals(prev => [...prev, data])
  }

  async function reorderGoals(orderedIds: string[]) {
    const idToPos = new Map(orderedIds.map((id, i) => [id, (i + 1) * 1000]))
    setGoals(prev => {
      const next = prev.map(g => idToPos.has(g.id) ? { ...g, position: idToPos.get(g.id)! } : g)
      return [...next].sort((a, b) => a.position - b.position)
    })
    const updates = await Promise.all(
      orderedIds.map(id =>
        supabase.from("goals").update({ position: idToPos.get(id)! }).eq("id", id)
      )
    )
    if (updates.some(r => r.error)) { toast.error("Failed to save order"); loadGoals() }
  }

  async function updateProgress(id: string, newValue: number) {
    const goal = goals.find(g => g.id === id)
    if (!goal) return

    const value = Math.max(0, newValue)
    const completed = value >= goal.target_value
    const prevPct = progressPct(goal)
    const nextPct = progressPct({ current_value: value, target_value: goal.target_value })

    // Optimistic update
    setGoals(prev => prev.map(g => g.id !== id ? g : { ...g, current_value: value, completed }))

    // Milestone celebration — only first time we cross each threshold this session
    const alreadyShown = milestonesShownRef.current.get(id) ?? prevPct
    for (const m of MILESTONES) {
      if (nextPct >= m && alreadyShown < m) {
        if (m === 100) toast.success(`🏆 "${goal.title}" complete! Congrats!`)
        else toast(`🎯 ${m}% of "${goal.title}" reached`)
      }
    }
    milestonesShownRef.current.set(id, Math.max(alreadyShown, nextPct))

    const { error } = await supabase
      .from("goals")
      .update({ current_value: value, completed })
      .eq("id", id)
    if (error) { toast.error("Failed to update goal"); loadGoals() }
  }

  function incrementProgress(id: string, by = 1) {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    return updateProgress(id, goal.current_value + by)
  }

  async function updateGoal(id: string, fields: Partial<Pick<Goal, "title" | "description" | "target_value" | "unit" | "deadline" | "color">>) {
    const goal = goals.find(g => g.id === id)
    if (!goal) return

    const next = { ...goal, ...fields }
    const completed = next.current_value >= next.target_value
    setGoals(prev => prev.map(g => g.id !== id ? g : { ...next, completed }))

    const { error } = await supabase
      .from("goals")
      .update({ ...fields, completed })
      .eq("id", id)
    if (error) { toast.error("Failed to update goal"); loadGoals() }
  }

  async function toggleComplete(id: string) {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    const completed = !goal.completed
    setGoals(prev => prev.map(g => g.id !== id ? g : { ...g, completed }))
    const { error } = await supabase.from("goals").update({ completed }).eq("id", id)
    if (error) { toast.error("Failed to update goal"); loadGoals() }
  }

  async function deleteGoal(id: string) {
    setGoals(prev => prev.filter(g => g.id !== id))
    milestonesShownRef.current.delete(id)
    const { error } = await supabase.from("goals").delete().eq("id", id)
    if (error) { toast.error("Failed to delete goal"); loadGoals() }
  }

  return { goals, loading, createGoal, updateProgress, incrementProgress, updateGoal, toggleComplete, deleteGoal, reorderGoals }
}

export { progressPct }
