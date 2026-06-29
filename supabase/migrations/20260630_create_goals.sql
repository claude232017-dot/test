-- Goals / milestones tracker
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
  created_at timestamptz default now()
);
alter table goals enable row level security;
create policy "Users manage own goals" on goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
