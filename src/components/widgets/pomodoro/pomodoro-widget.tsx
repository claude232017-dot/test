"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw } from "lucide-react"
import { toast } from "sonner"
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
  const [mode, setMode] = useState<Mode>("work")
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { todayCount, logSession } = usePomodoroSessions()

  const currentMode = MODES.find(m => m.value === mode)!
  const totalSeconds = currentMode.minutes * 60
  const progress = secondsLeft / totalSeconds
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeStr = `${pad(mins)}:${pad(secs)}`

  useEffect(() => {
    if (running) {
      document.title = `${timeStr} — ${currentMode.label} | DayFlow`
    } else {
      document.title = "DayFlow — Personal Dashboard"
    }
    return () => { document.title = "DayFlow — Personal Dashboard" }
  }, [timeStr, running])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  async function handleComplete() {
    if (mode === "work") {
      await logSession(currentMode.minutes)
      const newCount = sessionCount + 1
      setSessionCount(newCount)
      toast.success(`Focus session complete! Time for a ${newCount % 4 === 0 ? "long" : "short"} break.`, { duration: 4000 })
      if (Notification.permission === "granted") {
        new Notification("Focus session complete! 🎉", { body: "Time for a break." })
      }
      switchMode(newCount % 4 === 0 ? "long" : "short")
    } else {
      toast("Break over — time to focus!", { duration: 3000 })
      switchMode("work")
    }
  }

  function switchMode(newMode: Mode) {
    setMode(newMode)
    const m = MODES.find(m => m.value === newMode)!
    setSecondsLeft(m.minutes * 60)
    setRunning(false)
  }

  function handleReset() {
    setRunning(false)
    setSecondsLeft(currentMode.minutes * 60)
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
            onClick={() => switchMode(m.value)}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              mode === m.value ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Screen reader live region */}
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {running ? `${timeStr} remaining in ${currentMode.label} session` : `${currentMode.label} timer paused at ${timeStr}`}
      </span>

      {/* Circular timer */}
      <div
        className="relative w-52 max-w-full aspect-square cursor-pointer"
        onClick={requestNotificationPermission}
      >
        <svg width="100%" height="100%" viewBox="0 0 200 200" className="-rotate-90">
          {/* Track */}
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
          {/* Glow track */}
          <circle cx="100" cy="100" r={R} fill="none" stroke={currentMode.ring} strokeWidth="10" opacity="0.08" />
          {/* Progress */}
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

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-5xl font-bold tabular-nums tracking-tight leading-none", currentMode.color)}>
            {timeStr}
          </span>
          <span className="text-xs text-muted-foreground mt-2 font-medium">{currentMode.label}</span>
          {running && (
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
              i < (sessionCount % 4) ? "bg-purple-500 shadow-[0_0_6px_rgba(124,58,237,0.8)]" : "bg-white/10"
            )}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          {sessionCount % 4 + 1}/4
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>

        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setRunning(v => !v)}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer",
            running
              ? "bg-white/[0.08] hover:bg-white/[0.12] border border-white/10"
              : "text-white shadow-xl"
          )}
          style={!running ? {
            backgroundColor: currentMode.ring,
            boxShadow: `0 8px 32px ${currentMode.ring}60`
          } : {}}
        >
          {running
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
