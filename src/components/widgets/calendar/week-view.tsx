"use client"

import { motion, AnimatePresence } from "framer-motion"
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns"
import type { CalendarEvent } from "@/types"
import { cn } from "@/lib/utils"

interface WeekViewProps {
  currentDate: Date
  selectedDate: Date | null
  direction: number
  onSelectDate: (d: Date) => void
  eventsForDate: (dateStr: string) => CalendarEvent[]
}

export function WeekView({ currentDate, selectedDate, direction, onSelectDate, eventsForDate }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    // Phones can't fit 7 readable columns — let the week scroll sideways
    // there; desktop keeps the full-width grid.
    <div className="h-full overflow-x-auto md:overflow-x-visible">
      <AnimatePresence mode="wait">
        <motion.div
          key={format(weekStart, "yyyy-MM-dd")}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1 h-full min-w-[560px] md:min-w-0"
        >
        {days.map(day => {
          const dateStr = format(day, "yyyy-MM-dd")
          const dayEvents = eventsForDate(dateStr)
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const _isToday = isToday(day)

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(day)}
              className={cn(
                "flex flex-col items-stretch p-2 rounded-xl border transition-all cursor-pointer min-h-[220px] text-left group",
                isSelected
                  ? "bg-primary/10 border-primary/30"
                  : "bg-[rgba(var(--overlay),0.02)] border-[rgba(var(--overlay),0.05)] hover:bg-[rgba(var(--overlay),0.05)]"
              )}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] deck-label text-muted-foreground/60 font-semibold">
                  {format(day, "EEE")}
                </span>
                <span className={cn(
                  "text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium tabular-nums",
                  _isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                )}>
                  {format(day, "d")}
                </span>
              </div>

              {/* Event chips */}
              <div className="flex-1 space-y-1 overflow-y-auto scrollbar-none">
                {dayEvents.length === 0 ? (
                  <div className="h-full min-h-[40px]" />
                ) : (
                  dayEvents.slice(0, 8).map(ev => (
                    <div
                      key={ev.id}
                      className="flex items-center gap-1.5 px-1.5 py-1 rounded-md text-[10px] truncate"
                      style={{
                        backgroundColor: `${ev.color}20`,
                        color: ev.color,
                        borderLeft: `2px solid ${ev.color}`,
                      }}
                      title={ev.title}
                    >
                      <span className="truncate">{ev.title}</span>
                    </div>
                  ))
                )}
                {dayEvents.length > 8 && (
                  <p className="text-[9px] text-muted-foreground/60 px-1.5">+{dayEvents.length - 8} more</p>
                )}
              </div>
            </button>
          )
        })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
