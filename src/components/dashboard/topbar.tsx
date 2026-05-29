import { LayoutDashboard } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "./user-menu"

export async function Topbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const name = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "there"
  const email = user?.email ?? ""
  const initial = name.charAt(0).toUpperCase()
  const today = format(new Date(), "EEEE, MMMM d")

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      {/* Brand — shown on mobile where the sidebar is hidden */}
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
          <LayoutDashboard className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <span className="font-semibold text-foreground">DayFlow</span>
      </div>

      {/* Greeting — desktop */}
      <div className="hidden md:block">
        <p className="text-xs text-muted-foreground">{today}</p>
        <h2 className="text-sm font-medium text-foreground">
          Good day, {name.split(" ")[0]} 👋
        </h2>
      </div>

      <UserMenu name={name} email={email} initial={initial} />
    </header>
  )
}
