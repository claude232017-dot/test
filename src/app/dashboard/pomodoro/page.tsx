import { PomodoroWidget } from "@/components/widgets/pomodoro/pomodoro-widget"

export default function PomodoroPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pomodoro</h1>
        <p className="text-sm text-muted-foreground mt-1">Stay focused with timed work sessions</p>
      </div>
      <div className="glass rounded-xl p-5 flex items-center justify-center flex-1">
        <PomodoroWidget />
      </div>
    </div>
  )
}
