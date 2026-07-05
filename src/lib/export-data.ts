import { createClient } from "@/lib/supabase/client"

export const EXPORT_TABLES = [
  { key: "notes", label: "Notes", columns: "id,title,content,created_at,updated_at" },
  { key: "todos", label: "Todos", columns: "id,title,completed,priority,due_date,recurrence,created_at" },
  { key: "habits", label: "Habits", columns: "id,name,color,schedule_days,created_at" },
  { key: "habit_logs", label: "Habit logs", columns: "id,habit_id,completed_date" },
  { key: "goals", label: "Goals", columns: "id,title,description,target_value,current_value,unit,deadline,color,completed,created_at" },
  { key: "calendar_events", label: "Calendar events", columns: "id,title,description,start_date,end_date,color,created_at" },
  { key: "activity_logs", label: "Activity logs", columns: "id,category,duration_minutes,date,created_at" },
  { key: "pomodoro_sessions", label: "Pomodoro sessions", columns: "id,duration_minutes,completed,todo_id,created_at" },
] as const

export type ExportTableKey = (typeof EXPORT_TABLES)[number]["key"]

type Row = Record<string, unknown>

/** Fetch every row of one table (RLS scopes it to the signed-in user). */
export async function fetchTable(key: ExportTableKey): Promise<Row[]> {
  const supabase = createClient()
  const table = EXPORT_TABLES.find(t => t.key === key)!
  const hasCreatedAt = table.columns.split(",").includes("created_at")
  let query = supabase.from(key).select(table.columns)
  if (hasCreatedAt) query = query.order("created_at", { ascending: true })
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Row[]
}

/** Fetch all tables for a full JSON export. */
export async function fetchAllData(): Promise<Record<string, Row[]>> {
  const results = await Promise.all(EXPORT_TABLES.map(t => fetchTable(t.key)))
  const out: Record<string, Row[]> = {}
  EXPORT_TABLES.forEach((t, i) => { out[t.key] = results[i] })
  return out
}

/** Serialize rows to CSV with proper escaping. */
export function toCSV(rows: Row[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return ""
    const s = Array.isArray(v) ? v.join(";") : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(",")]
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(","))
  }
  return lines.join("\r\n")
}

/** Trigger a browser download of the given content. */
export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
