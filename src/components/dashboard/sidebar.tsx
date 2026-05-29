"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  LayoutDashboard, StickyNote, CheckSquare, Activity,
  CalendarDays, Target, Timer, BarChart2, LogOut,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/notes", label: "Notes", icon: StickyNote },
  { href: "/dashboard/todos", label: "Todos", icon: CheckSquare },
  { href: "/dashboard/activity", label: "Activity", icon: Activity },
  { href: "/dashboard/habits", label: "Habits", icon: Target },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success("Signed out")
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-56 h-full glass border-r border-white/5 py-5 px-3">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
          <LayoutDashboard className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <span className="font-semibold text-foreground">DayFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-pill"
                  className="absolute inset-0 rounded-lg bg-white/10"
                  transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                />
              )}
              <Icon className={cn("w-4 h-4 shrink-0 relative z-10", isActive && "text-purple-400")} aria-hidden="true" />
              <span className="relative z-10">{label}</span>
              {isActive && (
                <span className="ml-auto w-1 h-4 rounded-full bg-purple-500 relative z-10" aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all duration-150 cursor-pointer"
        aria-label="Sign out of DayFlow"
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        Sign out
      </button>
    </aside>
  )
}
