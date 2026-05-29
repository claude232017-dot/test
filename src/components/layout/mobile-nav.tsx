"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, StickyNote, CheckSquare, Activity,
  CalendarDays, Target, Timer, BarChart2,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/notes", icon: StickyNote, label: "Notes" },
  { href: "/dashboard/todos", icon: CheckSquare, label: "Todos" },
  { href: "/dashboard/habits", icon: Target, label: "Habits" },
  { href: "/dashboard/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/dashboard/activity", icon: Activity, label: "Activity" },
  { href: "/dashboard/pomodoro", icon: Timer, label: "Pomodoro" },
  { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5">
      <div className="flex items-center justify-around px-2 py-2 overflow-x-auto scrollbar-none">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-150 min-w-[44px]",
                isActive ? "text-purple-400" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
