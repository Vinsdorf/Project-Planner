import { TIMELINE_START, TIMELINE_DAYS, parseISODate, addWorkdays, isWeekend, isCzechHoliday } from './workdays'

export { isWeekend, isCzechHoliday }

// Default zoom: 8px per day
// Zoom levels: 4, 6, 8, 12, 20 px per day

// Use UTC-based day arithmetic to avoid DST off-by-one errors.
// CZ clocks shift by 1h in spring/autumn; using .getTime() directly
// can give 154.958 days instead of 155 → Math.floor shifts bar 1 day early.
function utcDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
}
const TIMELINE_START_DAY = utcDay(TIMELINE_START)

export function dateToPixel(date: Date, pxPerDay: number): number {
  const days = utcDay(date) - TIMELINE_START_DAY
  return Math.max(0, days) * pxPerDay
}

export function pixelToDate(px: number, pxPerDay: number): Date {
  const days = Math.round(px / pxPerDay)
  return new Date(TIMELINE_START.getFullYear(), TIMELINE_START.getMonth(), TIMELINE_START.getDate() + days)
}

// Get bar positioning for a project/task
// Returns { left: px, width: px }
// width = calendar days from startDate to endDate (endDate = addWorkdays(startDate, md-1))
export function getBarPosition(
  startDateStr: string,
  md: number,
  pxPerDay: number
): { left: number; width: number } {
  if (!startDateStr) return { left: 0, width: 0 }
  let startDate: Date
  try {
    startDate = parseISODate(startDateStr)
  } catch {
    return { left: 0, width: 0 }
  }
  const left = dateToPixel(startDate, pxPerDay)
  if (md <= 0) {
    return { left, width: pxPerDay } // at least 1 day wide
  }
  // endDate = start + (md - 1) workdays (inclusive)
  const endDate = addWorkdays(startDate, md - 1)
  // Use UTC day arithmetic to avoid DST issues across spring/autumn boundary
  const calendarDays = utcDay(endDate) - utcDay(startDate) + 1
  const width = Math.max(calendarDays * pxPerDay, pxPerDay)
  return { left, width }
}

// Total timeline width in pixels
export function getTimelineWidth(pxPerDay: number): number {
  return TIMELINE_DAYS * pxPerDay
}
