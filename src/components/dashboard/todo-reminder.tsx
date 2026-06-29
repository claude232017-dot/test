"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTodoBadge } from "@/hooks/useTodoBadge"
import { useDataStore } from "@/stores/useDataStore"

export function TodoReminder() {
  const { overdue, dueToday } = useTodoBadge()
  const todosHydrated = useDataStore(s => s.todosHydrated)
  const loadTodos = useDataStore(s => s.loadTodos)
  const firedRef = useRef(false)
  const router = useRouter()

  useEffect(() => { loadTodos() }, [])

  useEffect(() => {
    if (!todosHydrated || firedRef.current) return
    if (overdue === 0 && dueToday === 0) return

    firedRef.current = true

    const parts: string[] = []
    if (overdue > 0) parts.push(`${overdue} overdue`)
    if (dueToday > 0) parts.push(`${dueToday} due today`)

    toast.warning(`You have ${parts.join(" and ")} task${overdue + dueToday !== 1 ? "s" : ""}`, {
      duration: 6000,
      action: {
        label: "View",
        onClick: () => router.push("/dashboard/todos"),
      },
    })
  }, [todosHydrated, overdue, dueToday])

  return null
}
