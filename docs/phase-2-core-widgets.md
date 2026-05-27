# Phase 2 — Core Widgets (Notes, Todos, Activity Tracker)

## Goal
Build the three fundamental productivity widgets with full Supabase CRUD and real-time sync.

---

## 2.1 Notes Widget

### Features
- Create, edit, delete notes
- Auto-save on keystroke (debounced 500ms)
- Search/filter notes by title
- Display last updated timestamp

### Components
- `NotesList` — scrollable list of note cards
- `NoteEditor` — textarea with title input, auto-save indicator
- `NoteCard` — preview card with title + content excerpt

### Supabase Hooks
- `useNotes()` — fetch all notes for user, ordered by `updated_at desc`
- `useCreateNote()` — insert new note
- `useUpdateNote()` — debounced update on content change
- `useDeleteNote()` — delete with confirmation dialog

### UI Details
- Glass card with soft purple border on focus
- "Saved" / "Saving..." indicator in top-right corner
- Empty state with prompt to create first note

---

## 2.2 Todo List Widget

### Features
- Add tasks with title, priority (low / medium / high), optional due date
- Mark complete / incomplete (optimistic UI update)
- Delete tasks
- Filter by: All, Active, Completed
- Sort by: Due Date, Priority, Created

### Components
- `TodoList` — filtered + sorted list
- `TodoItem` — checkbox, title, priority badge, due date, delete button
- `AddTodoForm` — inline form with priority selector and date picker
- `TodoFilters` — tab-style filter bar

### Supabase Hooks
- `useTodos()` — fetch all todos, real-time subscription
- `useCreateTodo()` — insert
- `useToggleTodo()` — flip `completed` field (optimistic)
- `useDeleteTodo()` — delete

### UI Details
- Priority badge colors: red (high), yellow (medium), green (low)
- Completed tasks show strikethrough + reduced opacity
- Overdue tasks highlight due date in red

---

## 2.3 Activity Tracker Widget

### Features
- Log an activity: category + duration in minutes
- Predefined categories: Work, Study, Exercise, Reading, Leisure, Sleep
- View today's activity breakdown
- Edit / delete logged entries

### Components
- `ActivityLogger` — form to log a new activity entry
- `ActivityList` — today's logged activities with duration
- `ActivitySummary` — total minutes logged today + category breakdown as mini bar

### Supabase Hooks
- `useActivityLogs(date)` — fetch logs for a given date
- `useCreateActivityLog()` — insert new log
- `useDeleteActivityLog()` — delete entry

### UI Details
- Each category has a distinct accent color
- Duration displayed in `Xh Ym` format
- Category icons via Lucide

---

## 2.4 Global State (Zustand)

Set up stores for data that spans multiple widgets:

```ts
// stores/useDashboardStore.ts
interface DashboardStore {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}
```

---

## 2.5 Optimistic Updates Pattern

All mutations follow this pattern for snappy UX:
1. Update local state immediately
2. Fire Supabase mutation in background
3. On error: revert local state + show toast error

---

## 2.6 Real-time Subscriptions

Enable Supabase Realtime on `notes` and `todos` tables so changes sync across tabs instantly.

---

## Deliverables

- [ ] Notes widget — full CRUD with auto-save
- [ ] Todo widget — full CRUD with filters
- [ ] Activity Tracker widget — log and view today's activities
- [ ] Optimistic UI updates on all mutations
- [ ] Real-time sync on notes and todos

---

## Phase Complete When
User can create notes, manage todos, and log daily activities — all persisted in Supabase.
