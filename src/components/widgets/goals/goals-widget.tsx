"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, Trophy } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useGoals } from "@/hooks/useGoals"
import { GoalCard } from "./goal-card"
import { AddGoalForm } from "./add-goal-form"
import { GoalDetailModal } from "./goal-detail-modal"
import { SortableItem } from "@/components/ui/sortable-item"
import { Button } from "@/components/ui/button"
import type { Goal } from "@/types"

export function GoalsWidget() {
  const { goals, loading, createGoal, updateProgress, incrementProgress, updateGoal, toggleComplete, deleteGoal, reorderGoals } = useGoals()
  const [showForm, setShowForm] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const active = goals.filter(g => !g.completed)
  const completed = goals.filter(g => g.completed)
  const openGoal = openId ? goals.find(g => g.id === openId) ?? null : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(e: DragEndEvent) {
    const { active: a, over } = e
    if (!over || a.id === over.id) return
    const oldIndex = goals.findIndex(g => g.id === a.id)
    const newIndex = goals.findIndex(g => g.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const nextOrder = arrayMove(goals, oldIndex, newIndex).map(g => g.id)
    reorderGoals(nextOrder)
  }

  return (
    <div className="flex flex-col gap-4 min-h-[350px]">
      {/* Add button / form */}
      <div className="shrink-0">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <AddGoalForm
                onCreate={async (fields) => {
                  await createGoal(fields)
                  setShowForm(false)
                }}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          ) : (
            <Button
              key="trigger"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              New goal
            </Button>
          )}
        </AnimatePresence>
      </div>

      {/* Active goals */}
      <div className="flex-1 space-y-3">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-[120px] rounded-2xl bg-[rgba(var(--overlay),0.03)] animate-pulse" />
          ))
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Trophy className="w-8 h-8 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">No goals yet — set one to start tracking progress</p>
          </div>
        ) : (
          <div className="pl-5 space-y-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={active.map(g => g.id)} strategy={verticalListSortingStrategy}>
                <AnimatePresence initial={false}>
                  {active.map(goal => (
                    <SortableItem key={goal.id} id={goal.id}>
                      <GoalCard
                        goal={goal}
                        onIncrement={incrementProgress}
                        onUpdateProgress={updateProgress}
                        onToggleComplete={toggleComplete}
                        onDelete={deleteGoal}
                        onOpen={g => setOpenId(g.id)}
                      />
                    </SortableItem>
                  ))}
                </AnimatePresence>
              </SortableContext>
            </DndContext>

            {completed.length > 0 && (
              <div className="pt-4 mt-4 border-t border-[rgba(var(--overlay),0.06)] space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-[10px] font-semibold font-mono uppercase tracking-wider text-muted-foreground/60">
                    Completed · {completed.length}
                  </p>
                </div>
                <AnimatePresence initial={false}>
                  {completed.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onIncrement={incrementProgress}
                      onUpdateProgress={updateProgress}
                      onToggleComplete={toggleComplete}
                      onDelete={deleteGoal}
                      onOpen={g => setOpenId(g.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      <GoalDetailModal
        goal={openGoal}
        onClose={() => setOpenId(null)}
        onIncrement={incrementProgress}
        onUpdateProgress={updateProgress}
        onUpdate={updateGoal}
        onToggleComplete={toggleComplete}
        onDelete={deleteGoal}
      />
    </div>
  )
}
