import {
  LayoutDashboard, StickyNote, CheckSquare, Activity,
  CalendarDays, Target, Timer, BarChart2, type LucideIcon,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  group: "main" | "track"
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, group: "main" },
  { href: "/dashboard/notes", label: "Notes", icon: StickyNote, group: "main" },
  { href: "/dashboard/todos", label: "Todos", icon: CheckSquare, group: "main" },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays, group: "main" },
  { href: "/dashboard/activity", label: "Activity", icon: Activity, group: "track" },
  { href: "/dashboard/habits", label: "Habits", icon: Target, group: "track" },
  { href: "/dashboard/pomodoro", label: "Pomodoro", icon: Timer, group: "track" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2, group: "track" },
]

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)
}

export const GROUP_LABELS: Record<NavItem["group"], string> = {
  main: "Workspace",
  track: "Tracking",
}
