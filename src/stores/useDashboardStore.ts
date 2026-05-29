import { create } from "zustand"

interface DashboardStore {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}))
