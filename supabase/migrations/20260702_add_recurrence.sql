-- Recurring todos + habit weekday schedules

-- Todos: recurrence rule. Completing a recurring todo spawns the next
-- occurrence with due_date advanced by the interval.
alter table todos
  add column if not exists recurrence text
    check (recurrence in ('none','daily','weekly','monthly'))
    default 'none';
update todos set recurrence = 'none' where recurrence is null;

-- Habits: which weekdays the habit applies to (0=Sun … 6=Sat).
-- NULL means every day (the previous behavior).
alter table habits
  add column if not exists schedule_days integer[];
