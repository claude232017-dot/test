import Link from "next/link"
import { NotesWidget } from "@/components/widgets/notes/notes-widget"
import { TodosWidget } from "@/components/widgets/todos/todos-widget"
import { ActivityWidget } from "@/components/widgets/activity/activity-widget"
import { ArrowRight, CalendarDays, Target, Timer } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personal productivity dashboard</p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Notes — spans 1 col */}
        <div className="glass rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notes</h2>
            <Link href="/dashboard/notes" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              Open <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <NotesWidget />
        </div>

        {/* Todos — spans 1 col */}
        <div className="glass rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Todos</h2>
            <Link href="/dashboard/todos" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              Open <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <TodosWidget />
        </div>

        {/* Activity — spans 1 col */}
        <div className="glass rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Activity</h2>
            <Link href="/dashboard/activity" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              Open <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ActivityWidget />
        </div>
      </div>

      {/* Phase 3 placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/habits", label: "Habits", icon: Target, desc: "Coming in Phase 3" },
          { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays, desc: "Coming in Phase 3" },
          { href: "/dashboard/pomodoro", label: "Pomodoro", icon: Timer, desc: "Coming in Phase 3" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <div key={href} className="glass rounded-xl p-5 flex items-center gap-4 opacity-50">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
