export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personal productivity dashboard</p>
      </div>

      {/* Bento grid placeholder — widgets added in Phase 2 & 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Notes", "Todos", "Activity", "Habits", "Calendar", "Pomodoro"].map((name) => (
          <div key={name} className="glass rounded-xl p-4 h-48 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">{name} widget coming soon</p>
          </div>
        ))}
      </div>
    </div>
  )
}
