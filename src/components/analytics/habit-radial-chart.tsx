"use client"

import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { HabitRadialPoint } from "@/hooks/useAnalytics"
import { Target } from "lucide-react"

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-xl">
      <p className="font-semibold text-foreground mb-1">{d.payload.name}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.payload.fill }} />
        <span className="text-muted-foreground">Completion:</span>
        <span className="text-foreground font-medium">{d.value}%</span>
      </div>
    </div>
  )
}

interface Props {
  data: HabitRadialPoint[]
  overallPct: number
}

export function HabitRadialChart({ data, overallPct }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <Target className="w-8 h-8 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">No habits yet</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="30%" outerRadius="90%"
          data={data}
          startAngle={90} endAngle={-270}
        >
          <RadialBar dataKey="completionRate" cornerRadius={4} background={{ fill: "rgba(var(--overlay),0.04)" }} />
          <Tooltip content={<CustomTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-xl font-bold text-foreground tabular-nums">{overallPct}%</p>
          <p className="text-[10px] text-muted-foreground">this week</p>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
            <span className="text-[10px] text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
