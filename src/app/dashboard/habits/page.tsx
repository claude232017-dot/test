import { HabitsWidget } from "@/components/widgets/habits/habits-widget"

export default function HabitsPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Habits</h1>
        <p className="text-sm text-muted-foreground mt-1">Build streaks and track your daily habits</p>
      </div>
      <div className="glass rounded-xl p-5 flex-1">
        <HabitsWidget />
      </div>
    </div>
  )
}
