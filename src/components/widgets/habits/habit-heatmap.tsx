"use client"

import { format, subDays } from "date-fns"

interface HabitHeatmapProps {
  logs: string[]
  color: string
  today: string
}

export function HabitHeatmap({ logs, color, today }: HabitHeatmapProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(today + "T12:00:00"), 6 - i)
    return format(d, "yyyy-MM-dd")
  })

  return (
    <div className="flex gap-1 items-center">
      {days.map(day => {
        const done = logs.includes(day)
        return (
          <div
            key={day}
            title={day}
            className="w-3 h-3 rounded-sm transition-all"
            style={{
              backgroundColor: done ? color : "rgba(255,255,255,0.06)",
              boxShadow: done ? `0 0 6px ${color}60` : "none",
            }}
          />
        )
      })}
    </div>
  )
}
