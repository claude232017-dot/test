# Phase 1 — Project Setup & Foundation

## Goal
Establish the project skeleton, design system, and authentication before any feature work begins.

---

## 1.1 Initialize Next.js Project

- [ ] Scaffold with `create-next-app` (TypeScript, App Router, Tailwind)
- [ ] Configure `tsconfig.json` with strict mode and path aliases (`@/`)
- [ ] Set up `.env.local` with Supabase env vars
- [ ] Configure `next.config.ts`

```bash
npx create-next-app@latest dashboard --typescript --tailwind --app --src-dir
```

---

## 1.2 Install Dependencies

| Package | Purpose |
|--------|---------|
| `@supabase/supabase-js` | Supabase client |
| `@supabase/ssr` | Server-side Supabase helpers for Next.js |
| `shadcn/ui` | Accessible component primitives |
| `framer-motion` | Animations & transitions |
| `recharts` | Charts |
| `lucide-react` | Icons |
| `date-fns` | Date formatting & manipulation |
| `zustand` | Lightweight global state management |
| `react-hook-form` | Form handling |
| `zod` | Schema validation |

---

## 1.3 Tailwind & Design System

- [ ] Configure `tailwind.config.ts` with custom dark glassmorphism tokens:
  - Background: `#0a0a0f`
  - Glass surface: `rgba(255,255,255,0.05)` with `backdrop-blur-md`
  - Accent colors: purple `#7c3aed`, blue `#2563eb`, cyan `#06b6d4`
  - Border: `rgba(255,255,255,0.08)`
- [ ] Create global CSS variables in `globals.css`
- [ ] Build reusable `GlassCard` component (base for all dashboard widgets)

---

## 1.4 shadcn/ui Setup

- [ ] Run `npx shadcn@latest init` with dark theme
- [ ] Install base components: `Button`, `Input`, `Textarea`, `Dialog`, `Badge`, `Avatar`, `Tooltip`, `Separator`, `ScrollArea`

---

## 1.5 Supabase Project Setup

- [ ] Create Supabase project
- [ ] Enable Email/Password auth
- [ ] Create all 7 database tables (see schema below)
- [ ] Enable Row Level Security (RLS) on every table
- [ ] Write RLS policies scoped to `auth.uid()`
- [ ] Generate TypeScript types with Supabase CLI

### Database Schema

```sql
-- Notes
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Todos
create table todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  completed boolean default false,
  priority text check (priority in ('low','medium','high')) default 'medium',
  due_date date,
  created_at timestamptz default now()
);

-- Habits
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  color text default '#7c3aed',
  created_at timestamptz default now()
);

-- Habit Logs
create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  completed_date date not null,
  unique(habit_id, completed_date)
);

-- Activity Logs
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  duration_minutes int not null,
  date date not null,
  created_at timestamptz default now()
);

-- Calendar Events
create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz,
  color text default '#7c3aed',
  created_at timestamptz default now()
);

-- Pomodoro Sessions
create table pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  duration_minutes int not null default 25,
  completed boolean default false,
  created_at timestamptz default now()
);
```

---

## 1.6 Supabase Auth in Next.js

- [ ] Create `lib/supabase/client.ts` — browser client
- [ ] Create `lib/supabase/server.ts` — server client (cookies)
- [ ] Create `middleware.ts` — protect all `/dashboard` routes, redirect unauthenticated users to `/login`

---

## 1.7 Auth Pages

- [ ] `/login` — Email/password login form with glassmorphism card
- [ ] `/signup` — Registration form with Zod validation
- [ ] `/auth/callback` — Supabase OAuth callback route

---

## 1.8 Base Layout

- [ ] `app/layout.tsx` — root layout with font (Geist or Inter)
- [ ] `app/dashboard/layout.tsx` — dashboard shell with sidebar nav
- [ ] Sidebar with icons for each section: Overview, Notes, Todos, Habits, Calendar, Pomodoro
- [ ] Top bar with user avatar + logout

---

## Deliverables

- [ ] Running Next.js app with dark glassmorphism base styles
- [ ] Supabase auth working (login, signup, session persistence)
- [ ] All DB tables created with RLS enabled
- [ ] Protected `/dashboard` route
- [ ] Reusable `GlassCard` component

---

## Phase Complete When
User can sign up, log in, see an empty dashboard shell, and log out.
