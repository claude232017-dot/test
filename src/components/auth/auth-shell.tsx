import { LayoutDashboard, StickyNote, Target, BarChart2 } from "lucide-react"

const FEATURES = [
  { icon: StickyNote, title: "Capture everything", desc: "Notes, todos & calendar in one calm space." },
  { icon: Target, title: "Build momentum", desc: "Track habits and focus sessions with streaks." },
  { icon: BarChart2, title: "See your progress", desc: "Beautiful analytics that actually motivate." },
]

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-dvh grid lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <aside className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden brand-gradient">
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-black/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-black/15 backdrop-blur flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="text-xl font-semibold text-primary-foreground tracking-tight">DayFlow</span>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-semibold text-primary-foreground leading-tight">
              Your personal<br />productivity OS.
            </h2>
            <p className="text-primary-foreground/70 mt-3 max-w-sm">
              One dashboard for your notes, tasks, habits, focus and insights — designed to keep you in flow.
            </p>
          </div>
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/15 backdrop-blur flex items-center justify-center shrink-0">
                  <Icon className="w-[18px] h-[18px] text-primary-foreground" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-foreground">{title}</p>
                  <p className="text-sm text-primary-foreground/65">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/50">© {new Date().getFullYear()} DayFlow. Built for focus.</p>
      </aside>

      {/* Form panel */}
      <section className="flex items-center justify-center p-5 sm:p-8 relative">
        <div
          aria-hidden="true"
          className="lg:hidden fixed inset-0 overflow-hidden pointer-events-none"
        >
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-sm relative">
          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">DayFlow</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>

          {children}
        </div>
      </section>
    </main>
  )
}
