// Activity categories — shared by the activity widget, analytics charts, and
// the data store. Kept dependency-free so any module can import it without
// pulling in React components (avoids circular imports with the store).
export const ACTIVITY_CATEGORIES = [
  { name: "Work", color: "#7c3aed", bg: "bg-purple-500/20 text-purple-300" },
  { name: "Study", color: "#2563eb", bg: "bg-blue-500/20 text-blue-300" },
  { name: "Exercise", color: "#16a34a", bg: "bg-green-500/20 text-green-300" },
  { name: "Reading", color: "#06b6d4", bg: "bg-cyan-500/20 text-cyan-300" },
  { name: "Leisure", color: "#d97706", bg: "bg-yellow-500/20 text-yellow-300" },
  { name: "Sleep", color: "#6366f1", bg: "bg-indigo-500/20 text-indigo-300" },
] as const
