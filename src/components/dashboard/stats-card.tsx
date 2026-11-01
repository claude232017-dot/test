"use client"

import { motion } from "framer-motion"
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  /** Percentage change vs. the previous period. Omit when there is nothing to compare against. */
  change?: number
  icon: LucideIcon
  /** Tailwind gradient classes for the icon tile, e.g. "from-primary to-accent". */
  gradient: string
}

export function StatsCard({ title, value, change, icon: Icon, gradient }: StatsCardProps) {
  const down = change !== undefined && change < 0
  const TrendIcon = down ? ArrowDownRight : ArrowUpRight

  return (
    <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <h2 className="text-2xl font-bold text-foreground tabular">{value}</h2>
          {change !== undefined && (
            <p className={cn("flex items-center gap-1 text-sm", down ? "text-red-400" : "text-emerald-400")}>
              <TrendIcon size={16} aria-hidden="true" /> {change}%
            </p>
          )}
        </div>

        {/* Assumed ending — the supplied snippet was cut off before this point. */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground",
            gradient
          )}
        >
          <Icon size={24} aria-hidden="true" />
        </div>
      </div>
    </motion.div>
  )
}
