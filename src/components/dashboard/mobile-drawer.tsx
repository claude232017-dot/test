"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, LayoutDashboard, LogOut, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { navItems, isNavActive, GROUP_LABELS, type NavItem } from "./nav-items"

interface MobileDrawerProps {
  name: string
  email: string
  initial: string
}

export function MobileDrawer({ name, email, initial }: MobileDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll + Escape to close
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  async function handleLogout() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Signed out")
    router.push("/login")
    router.refresh()
  }

  const groups: NavItem["group"][] = ["main", "track"]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="md:hidden flex items-center justify-center w-10 h-10 -ml-1.5 rounded-lg text-foreground hover:bg-white/5 transition-colors cursor-pointer"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute left-0 top-0 bottom-0 w-[82%] max-w-xs glass-strong border-r border-white/10 flex flex-col py-5 px-3 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-2 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/30">
                    <LayoutDashboard className="w-[18px] h-[18px] text-white" aria-hidden="true" />
                  </div>
                  <div className="leading-tight">
                    <span className="font-semibold text-foreground tracking-tight">DayFlow</span>
                    <p className="text-[10px] text-muted-foreground">Productivity OS</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

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
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                            active
                              ? "bg-white/[0.08] border border-white/10 text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                          )}
                        >
                          <Icon className={cn("w-[18px] h-[18px] shrink-0", active && "text-purple-400")} aria-hidden="true" />
                          {label}
                          {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" aria-hidden="true" />}
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </nav>

              {/* User footer */}
              <div className="mt-4 pt-4 border-t border-white/8">
                <div className="flex items-center gap-3 px-2 mb-2">
                  <span className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center text-xs font-semibold text-white shrink-0">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  {signingOut
                    ? <Loader2 className="w-[18px] h-[18px] animate-spin" aria-hidden="true" />
                    : <LogOut className="w-[18px] h-[18px]" aria-hidden="true" />}
                  Sign out
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
