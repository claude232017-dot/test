import { create } from "zustand"

type Mode = "work" | "short" | "long"

const MODE_SECONDS: Record<Mode, number> = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
}

interface PomodoroState {
  mode: Mode
  running: boolean
  sessionCount: number
  targetTime: number | null
  pausedRemaining: number
  linkedTodoId: string | null
  linkedTodoTitle: string | null

  getSecondsLeft: () => number
  start: () => void
  pause: () => void
  reset: () => void
  switchMode: (mode: Mode) => void
  completeSession: () => Mode
  setLinkedTodo: (id: string | null, title?: string | null) => void
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: "work",
  running: false,
  sessionCount: 0,
  targetTime: null,
  pausedRemaining: MODE_SECONDS.work,
  linkedTodoId: null,
  linkedTodoTitle: null,

  getSecondsLeft: () => {
    const { running, targetTime, pausedRemaining } = get()
    if (!running || !targetTime) return pausedRemaining
    const remaining = Math.ceil((targetTime - Date.now()) / 1000)
    return Math.max(0, remaining)
  },

  start: () => {
    const { pausedRemaining } = get()
    set({
      running: true,
      targetTime: Date.now() + pausedRemaining * 1000,
    })
  },

  pause: () => {
    const secondsLeft = get().getSecondsLeft()
    set({
      running: false,
      targetTime: null,
      pausedRemaining: secondsLeft,
    })
  },

  reset: () => {
    const { mode } = get()
    set({
      running: false,
      targetTime: null,
      pausedRemaining: MODE_SECONDS[mode],
    })
  },

  switchMode: (mode: Mode) => {
    set({
      mode,
      running: false,
      targetTime: null,
      pausedRemaining: MODE_SECONDS[mode],
    })
  },

  completeSession: () => {
    const { mode, sessionCount } = get()
    if (mode === "work") {
      const newCount = sessionCount + 1
      const nextMode: Mode = newCount % 4 === 0 ? "long" : "short"
      set({
        sessionCount: newCount,
        mode: nextMode,
        running: false,
        targetTime: null,
        pausedRemaining: MODE_SECONDS[nextMode],
      })
      return nextMode
    } else {
      set({
        mode: "work",
        running: false,
        targetTime: null,
        pausedRemaining: MODE_SECONDS.work,
      })
      return "work"
    }
  },

  setLinkedTodo: (id, title) => {
    set({ linkedTodoId: id, linkedTodoTitle: title ?? null })
  },
}))
