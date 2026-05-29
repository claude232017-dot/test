import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  sub?: string
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
  accent?: string
}

export function StatCard({ label, value, icon: Icon, sub, trend, trendLabel, accent = "purple" }: StatCardProps) {
  const accentMap: Record<string, string> = {
    purple: "text-purple-400 bg-purple-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    green: "text-green-400 bg-green-500/10",
    blue: "text-blue-400 bg-blue-500/10",
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground"

  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", accentMap[accent] ?? accentMap.purple)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {trendLabel && (
        <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
          <TrendIcon className="w-3 h-3" />
          {trendLabel}
        </div>
      )}
    </div>
  )
}
