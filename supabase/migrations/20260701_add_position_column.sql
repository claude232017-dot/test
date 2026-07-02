-- Manual drag-and-drop reorder support:
-- Add a numeric `position` column to todos, habits, and goals.
-- Using numeric (fractional) so we can insert between two rows by picking a
-- midpoint instead of renumbering the whole list.

alter table todos  add column if not exists position numeric;
alter table habits add column if not exists position numeric;
alter table goals  add column if not exists position numeric;

-- Backfill from created_at so existing rows have a stable initial order.
update todos  set position = extract(epoch from created_at) where position is null;
update habits set position = extract(epoch from created_at) where position is null;
update goals  set position = extract(epoch from created_at) where position is null;

-- Default for new rows (client also sets it explicitly to max+1000)
alter table todos  alter column position set default extract(epoch from now());
alter table habits alter column position set default extract(epoch from now());
alter table goals  alter column position set default extract(epoch from now());
