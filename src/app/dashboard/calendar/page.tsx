import { CalendarWidget } from "@/components/widgets/calendar/calendar-widget"

export default function CalendarPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">Schedule and manage your events</p>
      </div>
      <div className="glass rounded-xl p-5 flex-1">
        <CalendarWidget />
      </div>
    </div>
  )
}
