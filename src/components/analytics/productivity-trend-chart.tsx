"use client"

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts"
import { TrendPoint } from "@/hooks/useAnalytics"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const minutes = payload.find((p: any) => p.dataKey === "minutes")?.value ?? 0
  const avg = payload.find((p: any) => p.dataKey === "avg")?.value ?? 0
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return (
    <div className="glass rounded-xl p-3 text-xs space-y-1.5 shadow-xl">
      <p className="font-semibold text-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-muted-foreground">Logged:</span>
        <span className="text-foreground font-medium">{h > 0 ? `${h}h ` : ""}{m}m</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-500" />
        <span className="text-muted-foreground">7-day avg:</span>
        <span className="text-foreground font-medium">{Math.floor(avg / 60)}h {avg % 60}m</span>
      </div>
    </div>
  )
}

interface Props {
  data: TrendPoint[]
}

export function ProductivityTrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.15} />
            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--overlay),0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          axisLine={false} tickLine={false}
          interval={4}
        />
        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} unit="m" />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(var(--overlay),0.1)" }} />
        <Area
          type="monotone" dataKey="minutes"
          stroke="hsl(var(--primary))" strokeWidth={2}
          fill="url(#purpleGrad)"
          dot={false} activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
        />
        <Area
          type="monotone" dataKey="avg"
          stroke="hsl(var(--accent))" strokeWidth={1.5} strokeDasharray="4 3"
          fill="url(#cyanGrad)"
          dot={false} activeDot={{ r: 3, fill: "hsl(var(--accent))" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
