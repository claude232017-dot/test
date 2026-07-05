-- DayFlow Dashboard Schema (canonical — matches the current app)
-- Run this in the Supabase SQL Editor for a FRESH database.
-- For an existing database, run the files in supabase/migrations/ instead.
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
  recurrence text check (recurrence in ('none','daily','weekly','monthly')) default 'none',
  position numeric default extract(epoch from now()),
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
  schedule_days integer[],          -- 0=Sun … 6=Sat; NULL = every day
  position numeric default extract(epoch from now()),
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

-- Goals / milestones
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null,
  description text,
  target_value numeric not null check (target_value > 0),
  current_value numeric not null default 0 check (current_value >= 0),
  unit text default '',
  deadline date,
  color text default '#7c3aed',
  completed boolean default false,
  position numeric default extract(epoch from now()),
  created_at timestamptz default now()
);
alter table goals enable row level security;
create policy "Users manage own goals" on goals
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
  todo_id uuid references todos(id) on delete set null,
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
