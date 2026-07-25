"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { PomodoroPoint } from "@/hooks/useAnalytics"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const count = payload[0]?.value ?? 0
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-xl">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-400" />
        <span className="text-muted-foreground">Sessions:</span>
        <span className="text-foreground font-medium">{count}</span>
      </div>
    </div>
  )
}

interface Props {
  data: PomodoroPoint[]
}

export function PomodoroBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={18} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--overlay),0.04)" vertical={false} />
        <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(var(--overlay),0.03)" }} />
        <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.isToday ? "hsl(var(--accent))" : "rgba(15,155,189,0.4)"}
              style={{ filter: entry.isToday ? "drop-shadow(0 0 6px rgba(15,155,189,0.5))" : "none" }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
