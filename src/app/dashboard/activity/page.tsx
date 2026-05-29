import { BarChart2 } from "lucide-react"
import { ActivityWidget } from "@/components/widgets/activity/activity-widget"

export default function ActivityPage() {
  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <BarChart2 className="w-[18px] h-[18px] text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Activity</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Log how you spend your time each day</p>
        </div>
      </div>
      <div className="glass-strong rounded-2xl p-5 flex-1 min-h-0">
        <ActivityWidget />
      </div>
    </div>
  )
}
