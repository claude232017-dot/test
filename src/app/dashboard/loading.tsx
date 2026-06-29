export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[rgba(var(--overlay),0.04)] animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-6 w-28 bg-[rgba(var(--overlay),0.06)] rounded-lg animate-pulse" />
          <div className="h-3 w-48 bg-[rgba(var(--overlay),0.04)] rounded animate-pulse" />
        </div>
      </div>
      <div className="glass-strong rounded-2xl flex-1 animate-pulse" />
    </div>
  )
}
