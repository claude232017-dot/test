"use client"

import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { OverviewStats } from "@/components/dashboard/overview-stats"
import { NotesWidget } from "@/components/widgets/notes/notes-widget"
import { TodosWidget } from "@/components/widgets/todos/todos-widget"
import { ActivityWidget } from "@/components/widgets/activity/activity-widget"
import { HabitsWidget } from "@/components/widgets/habits/habits-widget"
import { CalendarWidget } from "@/components/widgets/calendar/calendar-widget"
import { PomodoroWidget } from "@/components/widgets/pomodoro/pomodoro-widget"
import { ErrorBoundary } from "@/components/ui/error-boundary"

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
}

function WidgetCard({
  title, href, children, className,
}: {
  title: string; href: string; children: React.ReactNode; className?: string
}) {
  return (
    <motion.div variants={item} className={`glass glass-hover rounded-2xl p-4 md:p-5 flex flex-col gap-3 ${className ?? ""}`}>
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
        <Link
          href={href}
          aria-label={`Open ${title}`}
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-0.5 transition-colors"
        >
          Open <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </motion.div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70 px-1">
      {children}
    </h2>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Your day <span className="text-gradient">at a glance</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everything you&apos;re tracking, in one calm place.
        </p>
      </motion.div>

      {/* KPI strip */}
      <ErrorBoundary>
        <OverviewStats />
      </ErrorBoundary>

      {/* Workspace */}
      <div className="space-y-3">
        <SectionLabel>Workspace</SectionLabel>
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <WidgetCard title="Notes" href="/dashboard/notes">
            <NotesWidget />
          </WidgetCard>
          <WidgetCard title="Todos" href="/dashboard/todos">
            <TodosWidget />
          </WidgetCard>
          <WidgetCard title="Pomodoro" href="/dashboard/pomodoro" className="items-center justify-center">
            <PomodoroWidget />
          </WidgetCard>
        </motion.div>
      </div>

      {/* Tracking */}
      <div className="space-y-3">
        <SectionLabel>Tracking</SectionLabel>
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <WidgetCard title="Habits" href="/dashboard/habits">
            <HabitsWidget />
          </WidgetCard>
          <WidgetCard title="Calendar" href="/dashboard/calendar" className="lg:col-span-2">
            <CalendarWidget />
          </WidgetCard>
        </motion.div>

        <motion.div variants={item} initial="hidden" animate="visible">
          <WidgetCard title="Activity" href="/dashboard/activity">
            <ActivityWidget />
          </WidgetCard>
        </motion.div>
      </div>
    </div>
  )
}
