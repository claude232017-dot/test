import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"

export async function Topbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const name = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "there"
  const initial = name.charAt(0).toUpperCase()
  const today = format(new Date(), "EEEE, MMMM d")

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
      <div>
        <p className="text-xs text-muted-foreground">{today}</p>
        <h2 className="text-sm font-medium text-foreground">Good day, {name.split(" ")[0]} 👋</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-semibold text-white">
          {initial}
        </div>
      </div>
    </header>
  )
}
