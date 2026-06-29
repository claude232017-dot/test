"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts"
import { WeeklyActivityPoint } from "@/hooks/useAnalytics"
import { ACTIVITY_CATEGORIES } from "@/components/widgets/activity/activity-widget"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 text-xs space-y-1 shadow-xl">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="text-foreground font-medium">{p.value}h</span>
        </div>
      ))}
    </div>
  )
}

interface Props {
  data: WeeklyActivityPoint[]
}

export function ActivityBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={20} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--overlay),0.04)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(var(--overlay),0.03)" }} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
          formatter={(value) => <span className="text-muted-foreground">{value}</span>}
        />
        {ACTIVITY_CATEGORIES.map(cat => (
          <Bar key={cat.name} dataKey={cat.name} stackId="a" fill={cat.color} radius={[0, 0, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
