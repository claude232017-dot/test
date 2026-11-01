"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  /** Percentage change, rendered as "+{change}%" with an up arrow. */
  change: number
  icon: LucideIcon
  /** Tailwind gradient classes for the icon tile, e.g. "from-purple-500 to-pink-500". */
  gradient: string
}

export function StatsCard({ title, value, change, icon: Icon, gradient }: StatsCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="text-2xl font-bold text-foreground">{value}</h2>
          <p className="flex items-center gap-1 text-sm text-emerald-400">
            <ArrowUpRight size={16} /> {change}%
          </p>
        </div>

        {/* Assumed ending — the pasted code was cut off before this point. */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
            gradient
          )}
        >
          <Icon size={24} aria-hidden="true" />
        </div>
      </div>
    </motion.div>
  )
}
