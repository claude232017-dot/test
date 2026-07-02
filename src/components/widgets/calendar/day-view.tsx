"use client"

import { motion, AnimatePresence } from "framer-motion"
import { format, isToday } from "date-fns"
import { Trash2, CalendarDays } from "lucide-react"
import type { CalendarEvent } from "@/types"
import { cn } from "@/lib/utils"

interface DayViewProps {
  currentDate: Date
  direction: number
  events: CalendarEvent[]
  onDelete: (id: string) => void
}

export function DayView({ currentDate, direction, events, onDelete }: DayViewProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={format(currentDate, "yyyy-MM-dd")}
        initial={{ opacity: 0, x: direction * 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -30 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col h-full min-h-[300px]"
      >
        {/* Date badge */}
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className={cn(
            "flex flex-col items-center justify-center w-14 h-14 rounded-xl border shrink-0",
            isToday(currentDate)
              ? "bg-purple-500/15 border-purple-500/30"
              : "bg-[rgba(var(--overlay),0.03)] border-[rgba(var(--overlay),0.08)]"
          )}>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {format(currentDate, "EEE")}
            </span>
            <span className={cn(
              "text-xl font-bold tabular-nums",
              isToday(currentDate) ? "text-purple-300" : "text-foreground"
            )}>
              {format(currentDate, "d")}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{format(currentDate, "MMMM yyyy")}</h4>
            <p className="text-[11px] text-muted-foreground">
              {events.length === 0 ? "No events" : `${events.length} event${events.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {/* Events list */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <CalendarDays className="w-8 h-8 text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground">Nothing scheduled — use the + button to add</p>
            </div>
          ) : (
            events.map(ev => (
              <div
                key={ev.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(var(--overlay),0.03)] border border-[rgba(var(--overlay),0.06)] group/ev"
                style={{ borderLeftColor: ev.color, borderLeftWidth: "3px" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium">{ev.title}</p>
                  {ev.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>
                  )}
                </div>
                <button
                  onClick={() => onDelete(ev.id)}
                  className="opacity-40 group-hover/ev:opacity-100 md:opacity-0 md:group-hover/ev:opacity-100 text-muted-foreground hover:text-red-400 transition-all cursor-pointer p-1 shrink-0"
                  aria-label="Delete event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
