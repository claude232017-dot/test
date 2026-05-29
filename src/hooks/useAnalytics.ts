"use client"

import { useEffect, useState } from "react"
import { useDataStore } from "@/stores/useDataStore"

// Analytics types are re-exported from the store's shared types so existing
// importers (chart components) keep working.
export type {
  WeeklyActivityPoint,
  TrendPoint,
  PomodoroPoint,
  HabitRadialPoint,
  StatCards,
} from "@/lib/store/types"

export function useAnalytics() {
  const analytics = useDataStore(s => s.analytics)
  const hydrated = useDataStore(s => s.analyticsHydrated)
  const loadAnalytics = useDataStore(s => s.loadAnalytics)

  const [loading, setLoading] = useState(!hydrated)

  useEffect(() => {
    loadAnalytics().finally(() => setLoading(false))
  }, [])

  return {
    weeklyActivity: analytics.weeklyActivity,
    trend: analytics.trend,
    pomodoroData: analytics.pomodoroData,
    habitRadial: analytics.habitRadial,
    stats: analytics.stats,
    loading,
  }
}
