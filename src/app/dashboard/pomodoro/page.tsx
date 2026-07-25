import { Timer } from "lucide-react"
import { PomodoroWidget } from "@/components/widgets/pomodoro/pomodoro-widget"

export default function PomodoroPage() {
  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Timer className="w-[18px] h-[18px] text-accent-strong" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Pomodoro</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Stay focused with timed work sessions</p>
        </div>
      </div>
      <div className="glass-strong rounded-2xl p-5 flex flex-col items-center justify-center flex-1 min-h-0">
        <PomodoroWidget />
      </div>
    </div>
  )
}
