import { ActivityWidget } from "@/components/widgets/activity/activity-widget"

export default function ActivityPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">Log how you spend your time each day</p>
      </div>
      <div className="glass rounded-xl p-5 flex-1">
        <ActivityWidget />
      </div>
    </div>
  )
}
