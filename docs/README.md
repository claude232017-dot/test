# Dashboard — Implementation Plan

A personal productivity dashboard with dark glassmorphism design, built with Next.js, Supabase, and Framer Motion.

---

## Phases Overview

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| [Phase 1](./phase-1-setup.md) | Setup & Foundation | Auth, DB schema, design system, base layout |
| [Phase 2](./phase-2-core-widgets.md) | Core Widgets | Notes, Todos, Activity Tracker |
| [Phase 3](./phase-3-advanced-widgets.md) | Advanced Widgets | Habit Tracker, Calendar, Pomodoro Timer |
| [Phase 4](./phase-4-charts-analytics.md) | Charts & Analytics | 4 charts, stat cards, analytics page |
| [Phase 5](./phase-5-polish.md) | Polish & Deploy | Animations, responsive, optimization, Vercel |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Charts | Recharts |
| Backend | Supabase (Auth + PostgreSQL + Realtime) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Design System

- **Background:** `#0a0a0f`
- **Glass surface:** `rgba(255,255,255,0.05)` + `backdrop-blur-md`
- **Accents:** Purple `#7c3aed` · Blue `#2563eb` · Cyan `#06b6d4`
- **Border:** `rgba(255,255,255,0.08)`
- **Layout:** Bento grid (3-col desktop, 2-col tablet, 1-col mobile)

---

## Widgets

1. Notes — auto-save, search
2. Todo List — priority, due dates, filters
3. Activity Tracker — categories, duration logging
4. Habit Tracker — streaks, 7-day heatmap
5. Calendar — monthly view, events
6. Pomodoro Timer — circular countdown, session logging
