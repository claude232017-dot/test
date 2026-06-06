"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { usePomodoroStore } from "@/stores/usePomodoroStore"
import { usePomodoroSessions } from "@/hooks/usePomodoroSessions"
import { cn } from "@/lib/utils"

type Mode = "work" | "short" | "long"

const MODES: { value: Mode; label: string; minutes: number; color: string; ring: string }[] = [
  { value: "work", label: "Focus", minutes: 25, color: "text-purple-400", ring: "#7c3aed" },
  { value: "short", label: "Short Break", minutes: 5, color: "text-green-400", ring: "#16a34a" },
  { value: "long", label: "Long Break", minutes: 15, color: "text-blue-400", ring: "#2563eb" },
]

const R = 80
const CIRCUMFERENCE = 2 * Math.PI * R

function pad(n: number) { return String(n).padStart(2, "0") }

export function PomodoroWidget() {
  const store = usePomodoroStore()
  const { todayCount, logSession } = usePomodoroSessions()
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(() => store.getSecondsLeft())
  const completingRef = useRef(false)

  const currentMode = MODES.find(m => m.value === store.mode)!
  const totalSeconds = currentMode.minutes * 60
  const progress = secondsLeft / totalSeconds
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeStr = `${pad(mins)}:${pad(secs)}`

  useEffect(() => {
    if (store.running) {
      tickRef.current = setInterval(() => {
        const left = store.getSecondsLeft()
        setSecondsLeft(left)
        if (left <= 0 && !completingRef.current) {
          completingRef.current = true
          clearInterval(tickRef.current!)
          handleComplete()
        }
      }, 200)
    } else {
      setSecondsLeft(store.getSecondsLeft())
      if (tickRef.current) clearInterval(tickRef.current)
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [store.running, store.mode])

  useEffect(() => {
    if (store.running) {
      document.title = `${timeStr} — ${currentMode.label} | DayFlow`
    } else {
      document.title = "DayFlow — Personal Dashboard"
    }
    return () => { document.title = "DayFlow — Personal Dashboard" }
  }, [timeStr, store.running])

  async function handleComplete() {
    const prevMode = store.mode
    const prevModeData = MODES.find(m => m.value === prevMode)!

    if (prevMode === "work") {
      await logSession(prevModeData.minutes)
      const nextMode = store.completeSession()
      toast.success(`Focus session complete! Time for a ${nextMode === "long" ? "long" : "short"} break.`, { duration: 4000 })
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Focus session complete!", { body: "Time for a break." })
      }
    } else {
      store.completeSession()
      toast("Break over — time to focus!", { duration: 3000 })
    }

    setSecondsLeft(store.getSecondsLeft())
    completingRef.current = false
  }

  function handleToggle() {
    if (store.running) {
      store.pause()
    } else {
      store.start()
    }
  }

  function requestNotificationPermission() {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xs mx-auto">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 w-full">
        {MODES.map(m => (
          <button
            key={m.value}
            onClick={() => { store.switchMode(m.value); setSecondsLeft(m.minutes * 60) }}
            className={cn(
              "flex-1 px-3 py-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[40px] sm:min-h-0",
              store.mode === m.value ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Screen reader live region */}
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {store.running ? `${timeStr} remaining in ${currentMode.label} session` : `${currentMode.label} timer paused at ${timeStr}`}
      </span>

      {/* Circular timer */}
      <div
        className="relative w-52 max-w-full aspect-square cursor-pointer"
        onClick={requestNotificationPermission}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 200" className="-rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
          <circle cx="100" cy="100" r={R} fill="none" stroke={currentMode.ring} strokeWidth="10" opacity="0.08" />
          <motion.circle
            cx="100" cy="100" r={R}
            fill="none"
            stroke={currentMode.ring}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "linear" }}
            style={{ filter: `drop-shadow(0 0 12px ${currentMode.ring}90)` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-5xl font-bold tabular-nums tracking-tight leading-none", currentMode.color)}>
            {timeStr}
          </span>
          <span className="text-xs text-muted-foreground mt-2 font-medium">{currentMode.label}</span>
          {store.running && (
            <span className="text-[10px] text-muted-foreground/50 mt-1 animate-pulse">in progress</span>
          )}
        </div>
      </div>

      {/* Session dots */}
      <div className="flex gap-2 items-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i < (store.sessionCount % 4) ? "bg-purple-500 shadow-[0_0_6px_rgba(124,58,237,0.8)]" : "bg-white/10"
            )}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          {store.sessionCount % 4 + 1}/4
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => { store.reset(); setSecondsLeft(currentMode.minutes * 60) }}
          className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>

        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={handleToggle}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer",
            store.running
              ? "bg-white/[0.08] hover:bg-white/[0.12] border border-white/10"
              : "text-white shadow-xl"
          )}
          style={!store.running ? {
            backgroundColor: currentMode.ring,
            boxShadow: `0 8px 32px ${currentMode.ring}60`
          } : {}}
        >
          {store.running
            ? <Pause className="w-6 h-6 text-foreground" />
            : <Play className="w-6 h-6 ml-0.5" />
          }
        </motion.button>

        <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
            {todayCount > 0 ? todayCount : "–"}
          </span>
        </div>
      </div>

      {/* Today count label */}
      <AnimatePresence>
        {todayCount > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground -mt-2"
          >
            {todayCount} session{todayCount !== 1 ? "s" : ""} completed today
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
