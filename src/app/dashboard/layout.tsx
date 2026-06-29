import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { RealtimeProvider } from "@/components/providers/realtime-provider"
import { TodoReminder } from "@/components/dashboard/todo-reminder"
import { CommandPalette } from "@/components/dashboard/command-palette"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeProvider>
      <div className="flex h-dvh overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
      <TodoReminder />
      <CommandPalette />
    </RealtimeProvider>
  )
}
