/** Is a habit scheduled on the given date? null/empty schedule = every day. */
export function isScheduledOn(scheduleDays: number[] | null | undefined, dateStr: string): boolean {
  if (!scheduleDays || scheduleDays.length === 0) return true
  const day = new Date(dateStr + "T12:00:00").getDay()
  return scheduleDays.includes(day)
}
