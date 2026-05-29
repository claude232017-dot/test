"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Timer } from "lucide-react"
import { usePomodoroSessions } from "@/hooks/usePomodoroSessions"
import { cn } from "@/lib/utils"

type Mode = "work" | "short" | "long"

const MODES: { value: Mode; label: string; minutes: number; color: string; ring: string }[] = [
  { value: "work", label: "Focus", minutes: 25, color: "text-purple-400", ring: "#7c3aed" },
  { value: "short", label: "Short Break", minutes: 5, color: "text-green-400", ring: "#16a34a" },
  { value: "long", label: "Long Break", minutes: 15, color: "text-blue-400", ring: "#2563eb" },
]

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

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

  // Update browser tab title
  useEffect(() => {
    if (running) {
      document.title = `${timeStr} — ${currentMode.label} | DayFlow`
    } else {
      document.title = "DayFlow — Personal Dashboard"
    }
    return () => { document.title = "DayFlow — Personal Dashboard" }
  }, [timeStr, running])

  // Timer tick
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
      // Browser notification
      if (Notification.permission === "granted") {
        new Notification("Focus session complete! 🎉", { body: "Time for a break." })
      }
      // Auto-switch to break
      const nextMode = newCount % 4 === 0 ? "long" : "short"
      switchMode(nextMode)
    } else {
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
    <div className="flex flex-col items-center gap-5">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {MODES.map(m => (
          <button
            key={m.value}
            onClick={() => switchMode(m.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              mode === m.value ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className="relative" onClick={requestNotificationPermission}>
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
          {/* Track */}
          <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          {/* Progress */}
          <motion.circle
            cx="70" cy="70" r={RADIUS}
            fill="none"
            stroke={currentMode.ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "linear" }}
            style={{ filter: `drop-shadow(0 0 8px ${currentMode.ring}80)` }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold tabular-nums", currentMode.color)}>{timeStr}</span>
          <span className="text-xs text-muted-foreground mt-0.5">{currentMode.label}</span>
        </div>
      </div>

      {/* Session dots */}
      <div className="flex gap-2 items-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i < (sessionCount % 4) ? "bg-purple-500" : "bg-white/10"
            )}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">session {(sessionCount % 4) + 1}/4</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setRunning(v => !v)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg",
            running
              ? "bg-white/10 hover:bg-white/15"
              : "text-white shadow-purple-900/30"
          )}
          style={!running ? { backgroundColor: currentMode.ring } : {}}
        >
          {running
            ? <Pause className="w-6 h-6 text-foreground" />
            : <Play className="w-6 h-6 ml-0.5" />
          }
        </motion.button>

        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
          <Timer className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Stats */}
      <AnimatePresence>
        {todayCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground"
          >
            {todayCount} session{todayCount !== 1 ? "s" : ""} completed today
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
