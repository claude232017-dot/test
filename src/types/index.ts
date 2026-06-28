export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface Todo {
  id: string
  user_id: string
  title: string
  completed: boolean
  priority: "low" | "medium" | "high"
  due_date: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  category: string
  duration_minutes: number
  date: string
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  color: string
  created_at: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  duration_minutes: number
  completed: boolean
  todo_id: string | null
  created_at: string
}
