import { format } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "./user-menu"
import { MobileDrawer } from "./mobile-drawer"
import { SearchTrigger } from "./search-trigger"

export async function Topbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const name = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "there"
  const email = user?.email ?? ""
  const initial = name.charAt(0).toUpperCase()
  const today = format(new Date(), "EEEE, MMMM d")

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-6 h-16 border-b border-border/40 glass-strong">
      {/* Left: hamburger (mobile) + greeting (desktop) */}
      <div className="flex items-center gap-2 min-w-0">
        <MobileDrawer name={name} email={email} initial={initial} />
        <div className="md:hidden font-semibold text-foreground tracking-tight">DayFlow</div>
        <div className="hidden md:block">
          <p className="text-xs text-muted-foreground">{today}</p>
          <h2 className="text-sm font-medium text-foreground">
            Good day, {name.split(" ")[0]} 👋
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SearchTrigger />
        <UserMenu name={name} email={email} initial={initial} />
      </div>
    </header>
  )
}
