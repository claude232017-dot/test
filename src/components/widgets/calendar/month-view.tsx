"use client"

import { motion, AnimatePresence } from "framer-motion"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from "date-fns"
import type { CalendarEvent } from "@/types"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface MonthViewProps {
  currentDate: Date
  selectedDate: Date | null
  direction: number
  onSelectDate: (d: Date) => void
  eventsForDate: (dateStr: string) => CalendarEvent[]
}

export function MonthView({ currentDate, selectedDate, direction, onSelectDate, eventsForDate }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)

  return (
    <>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-muted-foreground/60 py-1">{d}</div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={format(currentDate, "yyyy-MM")}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-0.5"
        >
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}

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
                  "relative flex flex-col items-center p-1 rounded-lg transition-all cursor-pointer min-h-[44px] group",
                  isSelected ? "bg-purple-500/20 border border-purple-500/30" : "hover:bg-[rgba(var(--overlay),0.05)] border border-transparent"
                )}
              >
                <span className={cn(
                  "text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium",
                  _isToday ? "bg-purple-500 text-white" : isSelected ? "text-purple-300" : "text-foreground"
                )}>
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map(ev => (
                      <div key={ev.id} className="w-1 h-1 rounded-full" style={{ backgroundColor: ev.color }} />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
