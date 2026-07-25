// Activity categories — shared by the activity widget, analytics charts, and
// the data store. Kept dependency-free so any module can import it without
// pulling in React components (avoids circular imports with the store).
// PRISM-X palette: gold / cyan / violet / green / red steps.
export const ACTIVITY_CATEGORIES = [
  { name: "Work", color: "#c98500", bg: "bg-primary/15 text-gold" },
  { name: "Study", color: "#0f9bbd", bg: "bg-cyan-500/15 text-cyan-400" },
  { name: "Exercise", color: "#0ca30c", bg: "bg-green-500/15 text-green-400" },
  { name: "Reading", color: "#9085e9", bg: "bg-violet-500/15 text-violet-400" },
  { name: "Leisure", color: "#e66767", bg: "bg-red-500/15 text-red-400" },
  { name: "Sleep", color: "#37d67a", bg: "bg-emerald-500/15 text-emerald-400" },
] as const
