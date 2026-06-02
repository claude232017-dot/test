import { CalendarDays } from "lucide-react"
import { CalendarWidget } from "@/components/widgets/calendar/calendar-widget"

export default function CalendarPage() {
  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
          <CalendarDays className="w-[18px] h-[18px] text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Calendar</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Schedule and manage your events</p>
        </div>
      </div>
      <div className="rounded-2xl p-5 flex-1 min-h-0 border border-white/[0.08]" style={{ background: 'rgba(8, 10, 20, 0.92)', backdropFilter: 'blur(22px) saturate(150%)' }}>
        <CalendarWidget />
      </div>
    </div>
  )
}
