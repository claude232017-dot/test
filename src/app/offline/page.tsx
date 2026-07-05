import { WifiOff } from "lucide-react"

export const metadata = { title: "Offline — DayFlow" }

export default function OfflinePage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[rgba(var(--overlay),0.05)] border border-[rgba(var(--overlay),0.08)] flex items-center justify-center">
        <WifiOff className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-foreground">You&rsquo;re offline</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          DayFlow needs a connection to load your data. Check your network and try again.
        </p>
      </div>
      {/* Plain anchor: a client-side router retry would just replay the cached failure */}
      <a
        href="/dashboard"
        className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Try again
      </a>
    </main>
  )
}
