"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  format, addMonths, addDays,
  startOfWeek, endOfWeek, parse, isValid,
  isSameMonth, isSameWeek, isSameDay,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Trash2, CalendarDays } from "lucide-react"
import { useCalendarEvents } from "@/hooks/useCalendarEvents"
import { MonthView } from "./month-view"
import { WeekView } from "./week-view"
import { DayView } from "./day-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const EVENT_COLORS = ["#f5c542", "#0f9bbd", "#9085e9", "#0ca30c", "#e66767", "#c98500", "#37d67a"]

type CalendarView = "month" | "week" | "day"

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
]

export function CalendarWidget() {
  const searchParams = useSearchParams()
  const [currentDate, setCurrentDate] = useState(() => {
    const monthParam = searchParams.get("month")
    if (monthParam) {
      const parsed = parse(monthParam, "yyyy-MM", new Date())
      if (isValid(parsed)) return parsed
    }
    return new Date()
  })
  const [view, setView] = useState<CalendarView>("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [direction, setDirection] = useState(0)
  const { createEvent, deleteEvent, eventsForDate } = useCalendarEvents(currentDate)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [eventTitle, setEventTitle] = useState("")
  const [eventColor, setEventColor] = useState(EVENT_COLORS[0])
  const [eventDesc, setEventDesc] = useState("")

  function step(delta: 1 | -1) {
    setDirection(delta)
    const next =
      view === "month" ? addMonths(currentDate, delta) :
      view === "week" ? addDays(currentDate, 7 * delta) :
      addDays(currentDate, delta)
    setCurrentDate(next)
    // Drop a selection that scrolled out of the visible period — keeping it
    // would show a side panel for a date outside the cached month window.
    if (selectedDate) {
      const stillVisible =
        view === "month" ? isSameMonth(selectedDate, next) :
        view === "week" ? isSameWeek(selectedDate, next, { weekStartsOn: 0 }) :
        isSameDay(selectedDate, next)
      if (!stillVisible) setSelectedDate(null)
    }
  }
  function goPrev() { step(-1) }
  function goNext() { step(1) }
  function goToday() {
    setDirection(0)
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  function switchView(next: CalendarView) {
    setDirection(0)
    // If a selected date is set, anchor to it when switching views
    if (selectedDate) setCurrentDate(selectedDate)
    setView(next)
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault()
    // Day view always creates on the day being displayed — a leftover
    // selection from another view must not win over what the user sees.
    const targetDate = view === "day" ? currentDate : selectedDate
    if (!eventTitle.trim() || !targetDate) return
    await createEvent({
      title: eventTitle.trim(),
      start_date: format(targetDate, "yyyy-MM-dd") + "T00:00:00",
      description: eventDesc || undefined,
      color: eventColor,
    })
    setEventTitle("")
    setEventDesc("")
    setShowForm(false)
  }

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null
  const selectedEvents = selectedDateStr ? eventsForDate(selectedDateStr) : []
  const currentDayEvents = view === "day" ? eventsForDate(format(currentDate, "yyyy-MM-dd")) : []

  // Title text depends on view
  const titleText =
    view === "month" ? format(currentDate, "MMMM yyyy") :
    view === "week" ? (() => {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = endOfWeek(currentDate, { weekStartsOn: 0 })
      return format(start, "MMM d") + " – " + format(end, "MMM d, yyyy")
    })() :
    format(currentDate, "EEEE, MMM d")

  // Side panel only shows in Month + Week views (Day view is self-contained)
  const showSidePanel = view !== "day"

  return (
    <div className="flex flex-col h-full gap-4 min-h-[400px]">
      {/* Header: prev · title · today · next  +  view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={goPrev} aria-label="Previous" className="p-1.5 rounded-lg hover:bg-[rgba(var(--overlay),0.05)] transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <AnimatePresence mode="wait">
            <motion.h3
              key={titleText}
              initial={{ opacity: 0, x: direction * 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -12 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-semibold text-foreground whitespace-nowrap"
            >
              {titleText}
            </motion.h3>
          </AnimatePresence>
          <button onClick={goNext} aria-label="Next" className="p-1.5 rounded-lg hover:bg-[rgba(var(--overlay),0.05)] transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={goToday}
            className="ml-1 text-[11px] px-2 py-1 rounded-md bg-[rgba(var(--overlay),0.04)] hover:bg-[rgba(var(--overlay),0.08)] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        <div className="flex gap-1 bg-[rgba(var(--overlay),0.03)] rounded-lg p-0.5">
          {VIEWS.map(v => (
            <button
              key={v.value}
              onClick={() => switchView(v.value)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                view === v.value
                  ? "bg-[rgba(var(--overlay),0.1)] text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body: main view + optional side panel */}
      <div className={cn("flex-1 min-h-0 flex flex-col gap-4", showSidePanel && "md:flex-row")}>
        {/* Main view area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              selectedDate={selectedDate}
              direction={direction}
              onSelectDate={setSelectedDate}
              eventsForDate={eventsForDate}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              selectedDate={selectedDate}
              direction={direction}
              onSelectDate={setSelectedDate}
              eventsForDate={eventsForDate}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              direction={direction}
              events={currentDayEvents}
              onDelete={deleteEvent}
            />
          )}
        </div>

        {/* Side panel */}
        {showSidePanel && (
          <div className="md:w-48 lg:w-56 shrink-0 border-t md:border-t-0 md:border-l border-[rgba(var(--overlay),0.05)] pt-4 md:pt-0 md:pl-4 lg:pl-5 flex flex-col gap-4">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{format(selectedDate, "MMM d")}</p>
                  <button
                    onClick={() => setShowForm(v => !v)}
                    className="w-6 h-6 rounded-lg bg-[rgba(var(--overlay),0.05)] hover:bg-[rgba(var(--overlay),0.1)] flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Add event"
                  >
                    <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>

                <AnimatePresence>
                  {showForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleCreateEvent}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl border border-[rgba(var(--overlay),0.08)] bg-[rgba(var(--overlay),0.03)] p-3 space-y-3">
                        <Input
                          value={eventTitle}
                          onChange={e => setEventTitle(e.target.value)}
                          placeholder="Event title…"
                          className="h-8 text-base sm:text-xs"
                          autoFocus
                        />
                        <Input
                          value={eventDesc}
                          onChange={e => setEventDesc(e.target.value)}
                          placeholder="Description (opt)"
                          className="h-8 text-base sm:text-xs"
                        />
                        <div className="flex gap-1.5 flex-wrap">
                          {EVENT_COLORS.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEventColor(c)}
                              className={cn("w-5 h-5 rounded-full cursor-pointer transition-all", eventColor === c ? "ring-2 ring-[rgba(var(--overlay),0.6)]" : "opacity-60 hover:opacity-100")}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <Button type="submit" size="sm" className="w-full h-8 text-xs" disabled={!eventTitle.trim()}>
                          Add
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto space-y-1.5">
                  {selectedEvents.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">No events</p>
                  ) : (
                    selectedEvents.map(ev => (
                      <div
                        key={ev.id}
                        className="flex items-start gap-1.5 group/ev rounded-lg p-1.5 hover:bg-[rgba(var(--overlay),0.05)] transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: ev.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">{ev.title}</p>
                          {ev.description && <p className="text-[10px] text-muted-foreground truncate">{ev.description}</p>}
                        </div>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="opacity-40 group-hover/ev:opacity-100 md:opacity-0 md:group-hover/ev:opacity-100 text-muted-foreground hover:text-red-400 transition-all cursor-pointer shrink-0"
                          aria-label="Delete event"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <CalendarDays className="w-7 h-7 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Select a day</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Day view floating add button (side panel is hidden in day view) */}
      {view === "day" && (
        <div className="relative">
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateEvent}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-[rgba(var(--overlay),0.08)] bg-[rgba(var(--overlay),0.03)] p-3 space-y-3 mb-2">
                  <Input value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Event title…" className="h-8 text-base sm:text-xs" autoFocus />
                  <Input value={eventDesc} onChange={e => setEventDesc(e.target.value)} placeholder="Description (opt)" className="h-8 text-base sm:text-xs" />
                  <div className="flex gap-1.5 flex-wrap">
                    {EVENT_COLORS.map(c => (
                      <button
                        key={c} type="button" onClick={() => setEventColor(c)}
                        className={cn("w-5 h-5 rounded-full cursor-pointer transition-all", eventColor === c ? "ring-2 ring-[rgba(var(--overlay),0.6)]" : "opacity-60 hover:opacity-100")}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <Button type="submit" size="sm" className="w-full h-8 text-xs" disabled={!eventTitle.trim()}>
                    Add
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowForm(v => !v)}>
            <Plus className="w-4 h-4 mr-1" />
            {showForm ? "Close" : "Add event"}
          </Button>
        </div>
      )}
    </div>
  )
}
