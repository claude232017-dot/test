"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronDown, LogOut, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  name: string
  email: string
  initial: string
}

export function UserMenu({ name, email, initial }: UserMenuProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleLogout() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Signed out")
    router.push("/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full p-0.5 pr-1 transition-colors hover:bg-[rgba(var(--overlay),0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 cursor-pointer"
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
          {initial}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={(e) => { e.preventDefault(); handleLogout() }}>
          {signingOut
            ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            : <LogOut className="w-4 h-4" aria-hidden="true" />}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
