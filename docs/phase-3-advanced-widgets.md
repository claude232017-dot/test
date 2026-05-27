# Phase 3 — Advanced Widgets (Habit Tracker, Calendar, Pomodoro)

## Goal
Build the three interactive/time-aware widgets that make the dashboard feel like a full productivity suite.

---

## 3.1 Habit Tracker Widget

### Features
- Create habits with a name and color
- Mark habit as done for today (toggle)
- View current streak per habit
- 7-day mini heatmap per habit showing completion history
- Delete habit (with all its logs)

### Components
- `HabitList` — list of all habits
- `HabitItem` — habit name, color dot, streak count, 7-day heatmap row, today's toggle
- `AddHabitForm` — name input + color picker (8 preset colors)
- `HabitHeatmap` — 7 small squares representing last 7 days (filled = completed)

### Streak Calculation Logic
```ts
// Streak = consecutive days ending today where habit_log exists
function calculateStreak(logs: string[], today: string): number
```

### Supabase Hooks
- `useHabits()` — fetch habits with their logs for the last 30 days
- `useCreateHabit()` — insert
- `useToggleHabitLog(habitId, date)` — upsert or delete habit_log for that date
- `useDeleteHabit()` — cascade deletes logs

### UI Details
- Color dot matches habit's chosen color
- Streak shown as `🔥 5 day streak` (flame icon from Lucide)
- Heatmap cells: filled = habit color, empty = `rgba(255,255,255,0.05)`

---

## 3.2 Calendar Widget

### Features
- Monthly calendar grid view
- Navigate previous/next month
- Display events as colored dots on their dates
- Click a date to see events for that day in a side panel
- Create a new event (title, date, optional description, color)
- Delete event

### Components
- `CalendarGrid` — 7-column month grid with day cells
- `CalendarDayCell` — day number + event dots (max 3 visible, then "+N more")
- `EventSidePanel` — list of events for selected date with create/delete
- `CreateEventForm` — title, date, description, color picker

### Supabase Hooks
- `useCalendarEvents(month, year)` — fetch events for the displayed month
- `useCreateEvent()` — insert
- `useDeleteEvent()` — delete

### Date Logic (date-fns)
```ts
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns'
```

### UI Details
- Today's date highlighted with accent circle
- Selected date highlighted with glass border
- Event dots use the event's stored color
- Smooth slide animation when switching months (Framer Motion)

---

## 3.3 Pomodoro Timer Widget

### Features
- 25-minute work session / 5-minute short break / 15-minute long break
- Customizable durations
- Visual circular countdown timer
- Auto-advance to break after work session completes
- Session counter (every 4 pomodoros = long break)
- Log completed sessions to Supabase
- Today's session count displayed

### Components
- `PomodoroTimer` — main widget with circular SVG timer
- `TimerControls` — Start / Pause / Reset buttons
- `TimerModeSelector` — Work / Short Break / Long Break tabs
- `SessionCounter` — dots showing progress toward long break (4 pomodoros)
- `PomodoroStats` — "X sessions completed today"

### Timer Logic
```ts
// Runs in useEffect with setInterval, cleaned up on unmount
// Uses ref for interval ID to avoid stale closures
// On completion: log to Supabase, auto-switch mode
```

### Supabase Hooks
- `useCreatePomodoroSession()` — insert completed session
- `useTodaysSessions()` — count of today's completed sessions

### UI Details
- Circular SVG progress ring with stroke-dashoffset animation
- Color changes by mode: purple (work), green (short break), blue (long break)
- Browser tab title updates to show remaining time: `"18:42 — Focus"`
- Optional browser notification on session complete (Web Notifications API)

---

## 3.4 Cross-Widget Integration

Connect widgets so they feel like a unified system:

| Trigger | Effect |
|---------|--------|
| Todo due date matches calendar event date | Show todo indicator on calendar day |
| Pomodoro session completed | Auto-log activity entry (category: "Work", duration: 25min) |
| Habit marked complete | Briefly animate the habit item with a pulse effect |

---

## Deliverables

- [ ] Habit Tracker — create habits, toggle daily completion, streak counter, 7-day heatmap
- [ ] Calendar — monthly view, event creation and deletion, day detail panel
- [ ] Pomodoro Timer — countdown, mode switching, session logging
- [ ] Cross-widget: Pomodoro → Activity Log auto-entry

---

## Phase Complete When
All six widgets are functional and data persists correctly in Supabase across page refreshes.
