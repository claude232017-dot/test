export const dynamic = "force-dynamic"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
