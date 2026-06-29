"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LayoutDashboard } from "lucide-react"
import { navItems, isNavActive, GROUP_LABELS, type NavItem } from "./nav-items"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Sidebar() {
  const pathname = usePathname()

  const groups: NavItem["group"][] = ["main", "track"]

  return (
    <aside className="hidden md:flex flex-col w-60 h-full glass-strong border-r border-border/40 py-5 px-3">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 px-3 mb-7 group">
        <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/30 transition-transform group-hover:scale-105">
          <LayoutDashboard className="w-[18px] h-[18px] text-white" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <span className="font-semibold text-foreground tracking-tight">DayFlow</span>
          <p className="text-[10px] text-muted-foreground">Productivity OS</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto scrollbar-none" aria-label="Main navigation">
        {groups.map(group => (
          <div key={group} className="space-y-0.5">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
              {GROUP_LABELS[group]}
            </p>
            {navItems.filter(i => i.group === group).map(({ href, label, icon: Icon }) => {
              const active = isNavActive(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-pill"
                      className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/15"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.18 }}
                    />
                  )}
                  <Icon
                    className={cn("w-[18px] h-[18px] shrink-0 relative z-10 transition-colors", active && "text-purple-400")}
                    aria-hidden="true"
                  />
                  <span className="relative z-10">{label}</span>
                  {active && (
                    <motion.span
                      layoutId="sidebar-dot"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 relative z-10 shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pt-3 border-t border-border/40">
        <ThemeToggle className="w-full justify-center" />
      </div>
    </aside>
  )
}
