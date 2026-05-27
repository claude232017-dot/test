# Phase 4 — Charts & Analytics

## Goal
Add a dedicated analytics section with Recharts visualizations that give the user meaningful insight into their productivity patterns.

---

## 4.1 Analytics Page / Section

Dedicated `/dashboard/analytics` page (or collapsible panel on the main dashboard) with an overview of all chart widgets.

---

## 4.2 Weekly Activity Bar Chart

### What it shows
Hours logged per activity category for the last 7 days — grouped/stacked bar chart.

### Data Source
`activity_logs` — last 7 days, grouped by `date` and `category`.

### Chart Config (Recharts)
```tsx
<BarChart data={weeklyData}>
  <XAxis dataKey="date" />
  <YAxis unit="h" />
  <Tooltip />
  <Legend />
  {CATEGORIES.map(cat => (
    <Bar key={cat.name} dataKey={cat.name} stackId="a" fill={cat.color} />
  ))}
</BarChart>
```

### UI Details
- Glassmorphism card wrapping the chart
- Custom tooltip with dark background
- Animated bar entry on mount (`isAnimationActive`)

---

## 4.3 Habit Completion Radial Chart

### What it shows
Each habit's completion rate for the current week as a radial/pie ring — one ring per habit.

### Data Source
`habit_logs` — current week, grouped by `habit_id`.

### Chart Config
```tsx
<RadialBarChart data={habitCompletionData}>
  <RadialBar dataKey="completionRate" cornerRadius={6} />
  <Tooltip />
</RadialBarChart>
```

### UI Details
- Each radial bar uses the habit's stored color
- Center label shows overall weekly completion %
- Legend below with habit names

---

## 4.4 Productivity Trend Line Chart

### What it shows
Total productive minutes logged per day over the last 30 days — area line chart with a smooth curve.

### Data Source
`activity_logs` — last 30 days, sum of `duration_minutes` grouped by `date`.

### Chart Config
```tsx
<AreaChart data={trendData}>
  <defs>
    <linearGradient id="purple" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
    </linearGradient>
  </defs>
  <Area type="monotone" dataKey="minutes" stroke="#7c3aed" fill="url(#purple)" />
</AreaChart>
```

### UI Details
- Purple gradient fill under the line
- 7-day rolling average as a dashed secondary line
- Hover tooltip shows date + total minutes

---

## 4.5 Pomodoro Sessions Bar Chart

### What it shows
Number of Pomodoro sessions completed per day for the last 14 days.

### Data Source
`pomodoro_sessions` — last 14 days, count of completed sessions grouped by `date(created_at)`.

### Chart Config
```tsx
<BarChart data={pomodoroData}>
  <Bar dataKey="sessions" fill="#06b6d4" radius={[4,4,0,0]} />
</BarChart>
```

### UI Details
- Cyan colored bars
- Today's bar highlighted with brighter fill
- X-axis shows abbreviated day names (Mon, Tue...)

---

## 4.6 Summary Stat Cards

Four KPI cards displayed above the charts:

| Stat | Source |
|------|--------|
| Total focus time this week | `activity_logs` sum |
| Habits completed today | `habit_logs` count for today |
| Todos completed this week | `todos` where `completed = true` |
| Pomodoros today | `pomodoro_sessions` count for today |

### Component
```tsx
<StatCard label="Focus Time" value="4h 20m" icon={<Clock />} trend="+12% vs last week" />
```

---

## 4.7 Data Fetching Strategy

- All chart data fetched server-side in React Server Components (Next.js App Router)
- Use Supabase aggregate queries to minimize data transfer
- Cache responses with `next: { revalidate: 300 }` (5-minute cache)

---

## Deliverables

- [ ] Weekly Activity stacked bar chart
- [ ] Habit Completion radial chart
- [ ] Productivity Trend 30-day area chart
- [ ] Pomodoro Sessions bar chart
- [ ] 4 summary stat cards with trend indicators
- [ ] Analytics page/section layout with glassmorphism wrappers

---

## Phase Complete When
The analytics page renders all 4 charts with real user data and stat cards update correctly.
