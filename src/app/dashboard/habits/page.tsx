import { Target } from "lucide-react"
import { HabitsWidget } from "@/components/widgets/habits/habits-widget"

export default function HabitsPage() {
  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
          <Target className="w-[18px] h-[18px] text-green-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Habits</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Build streaks and track your daily habits</p>
        </div>
      </div>
      <div className="glass-strong rounded-2xl p-5 flex-1 min-h-0">
        <HabitsWidget />
      </div>
    </div>
  )
}
