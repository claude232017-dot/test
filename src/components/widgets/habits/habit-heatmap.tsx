"use client"

import { format, subDays } from "date-fns"
import { isScheduledOn } from "@/hooks/useHabits"

interface HabitHeatmapProps {
  logs: string[]
  color: string
  today: string
  scheduleDays?: number[] | null
}

export function HabitHeatmap({ logs, color, today, scheduleDays }: HabitHeatmapProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(today + "T12:00:00"), 6 - i)
    return format(d, "yyyy-MM-dd")
  })

  return (
    <div className="flex gap-1 items-end">
      {days.map(day => {
        const done = logs.includes(day)
        const scheduled = isScheduledOn(scheduleDays, day)
        const letter = format(new Date(day + "T12:00:00"), "EEEEE")
        return (
          <div key={day} className="flex flex-col items-center gap-0.5">
            <div
              title={scheduled ? day : `${day} (rest day)`}
              className="w-4 h-4 rounded-sm transition-all"
              style={{
                backgroundColor: done ? color : scheduled ? "rgba(var(--overlay),0.06)" : "rgba(var(--overlay),0.02)",
                boxShadow: done ? `0 0 6px ${color}60` : "none",
                opacity: scheduled || done ? 1 : 0.5,
              }}
            />
            <span className="text-[8px] text-muted-foreground/40 leading-none">{letter}</span>
          </div>
        )
      })}
    </div>
  )
}
