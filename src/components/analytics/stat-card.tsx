"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const frame = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(easeOutQuart(progress) * target))
      if (progress < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [target, duration])
  return value
}

interface StatCardProps {
  label: string
  value: string
  numericValue?: number
  icon: LucideIcon
  sub?: string
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
  accent?: string
}

export function StatCard({ label, value, numericValue, icon: Icon, sub, trend, trendLabel, accent = "purple" }: StatCardProps) {
  const accentMap: Record<string, string> = {
    purple: "text-purple-400 bg-purple-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    green: "text-green-400 bg-green-500/10",
    blue: "text-blue-400 bg-blue-500/10",
  }

  const counted = useCountUp(numericValue ?? 0)
  const displayValue = numericValue !== undefined ? String(counted) : value

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="glass rounded-xl p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", accentMap[accent] ?? accentMap.purple)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {numericValue !== undefined ? displayValue : value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {trendLabel && (
        <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
          <TrendIcon className="w-3 h-3" />
          {trendLabel}
        </div>
      )}
    </motion.div>
  )
}
