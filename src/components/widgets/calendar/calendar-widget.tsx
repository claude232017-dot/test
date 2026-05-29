"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isToday, addMonths, subMonths
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Trash2, CalendarDays } from "lucide-react"
import { useCalendarEvents } from "@/hooks/useCalendarEvents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const EVENT_COLORS = ["#7c3aed", "#2563eb", "#06b6d4", "#16a34a", "#d97706", "#dc2626", "#db2777"]

export function CalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [direction, setDirection] = useState(0)
  const { events, loading, createEvent, deleteEvent, eventsForDate } = useCalendarEvents(currentMonth)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [eventTitle, setEventTitle] = useState("")
  const [eventColor, setEventColor] = useState(EVENT_COLORS[0])
  const [eventDesc, setEventDesc] = useState("")

  function prevMonth() { setDirection(-1); setCurrentMonth(m => subMonths(m, 1)) }
  function nextMonth() { setDirection(1); setCurrentMonth(m => addMonths(m, 1)) }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart) // 0=Sun

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!eventTitle.trim() || !selectedDate) return
    await createEvent({
      title: eventTitle.trim(),
      start_date: format(selectedDate, "yyyy-MM-dd") + "T00:00:00",
      description: eventDesc || undefined,
      color: eventColor,
    })
    setEventTitle("")
    setEventDesc("")
    setShowForm(false)
  }

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null
  const selectedEvents = selectedDateStr ? eventsForDate(selectedDateStr) : []

  return (
    <div className="flex flex-col md:flex-row gap-4 min-h-[400px]">
      {/* Calendar grid */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <AnimatePresence mode="wait">
            <motion.h3
              key={format(currentMonth, "yyyy-MM")}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              className="text-sm font-semibold text-foreground"
            >
              {format(currentMonth, "MMMM yyyy")}
            </motion.h3>
          </AnimatePresence>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[10px] text-muted-foreground/60 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <AnimatePresence mode="wait">
          <motion.div
            key={format(currentMonth, "yyyy-MM")}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 gap-0.5"
          >
            {/* Padding cells */}
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
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative flex flex-col items-center p-1 rounded-lg transition-all cursor-pointer min-h-[44px] group",
                    isSelected ? "bg-purple-500/20 border border-purple-500/30" : "hover:bg-white/5 border border-transparent"
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
      </div>

      {/* Side panel */}
      <div className="md:w-44 shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4 flex flex-col gap-3">
        {selectedDate ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">{format(selectedDate, "MMM d")}</p>
              <button
                onClick={() => setShowForm(v => !v)}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Create form */}
            <AnimatePresence>
              {showForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateEvent}
                  className="overflow-hidden space-y-2"
                >
                  <Input
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    placeholder="Event title…"
                    className="h-7 text-xs"
                    autoFocus
                  />
                  <Input
                    value={eventDesc}
                    onChange={e => setEventDesc(e.target.value)}
                    placeholder="Description (opt)"
                    className="h-7 text-xs"
                  />
                  <div className="flex gap-1 flex-wrap">
                    {EVENT_COLORS.map(c => (
                      <button
                        key={c} type="button" onClick={() => setEventColor(c)}
                        className={cn("w-4 h-4 rounded-full cursor-pointer transition-all", eventColor === c ? "ring-2 ring-white/50 scale-110" : "opacity-60 hover:opacity-100")}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <Button type="submit" size="sm" className="w-full h-7 text-xs" disabled={!eventTitle.trim()}>
                    Add
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Events for selected day */}
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {selectedEvents.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">No events</p>
              ) : (
                selectedEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-1.5 group/ev rounded-lg p-1.5 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: ev.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{ev.title}</p>
                      {ev.description && <p className="text-[10px] text-muted-foreground truncate">{ev.description}</p>}
                    </div>
                    <button
                      onClick={() => deleteEvent(ev.id)}
                      className="opacity-40 group-hover/ev:opacity-100 md:opacity-0 md:group-hover/ev:opacity-100 text-muted-foreground hover:text-red-400 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CalendarDays className="w-7 h-7 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">Select a day</p>
          </div>
        )}
      </div>
    </div>
  )
}
