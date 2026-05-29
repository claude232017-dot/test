import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { NotesWidget } from "@/components/widgets/notes/notes-widget"
import { TodosWidget } from "@/components/widgets/todos/todos-widget"
import { ActivityWidget } from "@/components/widgets/activity/activity-widget"
import { HabitsWidget } from "@/components/widgets/habits/habits-widget"
import { CalendarWidget } from "@/components/widgets/calendar/calendar-widget"
import { PomodoroWidget } from "@/components/widgets/pomodoro/pomodoro-widget"

function WidgetCard({
  title,
  href,
  children,
  className,
}: {
  title: string
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`glass rounded-xl p-5 flex flex-col gap-3 ${className ?? ""}`}>
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
        <Link
          href={href}
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          Open <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personal productivity dashboard</p>
      </div>

      {/* Row 1: Notes + Todos + Pomodoro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WidgetCard title="Notes" href="/dashboard/notes">
          <NotesWidget />
        </WidgetCard>
        <WidgetCard title="Todos" href="/dashboard/todos">
          <TodosWidget />
        </WidgetCard>
        <WidgetCard title="Pomodoro" href="/dashboard/pomodoro" className="flex items-center justify-center">
          <PomodoroWidget />
        </WidgetCard>
      </div>

      {/* Row 2: Habits + Calendar + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WidgetCard title="Habits" href="/dashboard/habits">
          <HabitsWidget />
        </WidgetCard>
        <WidgetCard title="Calendar" href="/dashboard/calendar" className="lg:col-span-2">
          <CalendarWidget />
        </WidgetCard>
      </div>

      {/* Row 3: Activity full width */}
      <WidgetCard title="Activity" href="/dashboard/activity">
        <ActivityWidget />
      </WidgetCard>
    </div>
  )
}
