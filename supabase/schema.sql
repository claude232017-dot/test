-- DayFlow Dashboard Schema
-- Run this in the Supabase SQL Editor
--
-- Note: `user_id` defaults to `auth.uid()` and every RLS policy has a matching
-- `with check`, so inserts are scoped to the signed-in user automatically.
-- The client also sends `user_id` explicitly; RLS validates it either way.

-- Notes
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text default '',
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table notes enable row level security;
create policy "Users manage own notes" on notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Todos
create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null,
  completed boolean default false,
  priority text check (priority in ('low','medium','high')) default 'medium',
  due_date date,
  created_at timestamptz default now()
);
alter table todos enable row level security;
create policy "Users manage own todos" on todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Habits
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  color text default '#7c3aed',
  created_at timestamptz default now()
);
alter table habits enable row level security;
create policy "Users manage own habits" on habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Habit Logs
create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  completed_date date not null,
  unique(habit_id, completed_date)
);
alter table habit_logs enable row level security;
create policy "Users manage own habit logs" on habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Activity Logs
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  category text not null,
  duration_minutes int not null check (duration_minutes > 0),
  date date not null,
  created_at timestamptz default now()
);
alter table activity_logs enable row level security;
create policy "Users manage own activity logs" on activity_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Calendar Events
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz,
  color text default '#7c3aed',
  created_at timestamptz default now()
);
alter table calendar_events enable row level security;
create policy "Users manage own calendar events" on calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Pomodoro Sessions
create table if not exists pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  duration_minutes int not null default 25,
  completed boolean default false,
  created_at timestamptz default now()
);
alter table pomodoro_sessions enable row level security;
create policy "Users manage own pomodoro sessions" on pomodoro_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-update updated_at on notes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at
  before update on notes
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Migration for an EXISTING database (already created with the old schema):
-- run these once to add the user_id default + with-check guard.
--
--   alter table notes            alter column user_id set default auth.uid();
--   alter table todos            alter column user_id set default auth.uid();
--   alter table habits           alter column user_id set default auth.uid();
--   alter table habit_logs       alter column user_id set default auth.uid();
--   alter table activity_logs    alter column user_id set default auth.uid();
--   alter table calendar_events  alter column user_id set default auth.uid();
--   alter table pomodoro_sessions alter column user_id set default auth.uid();
-- ─────────────────────────────────────────────────────────────────────────
