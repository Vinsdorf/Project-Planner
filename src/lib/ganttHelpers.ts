import { TIMELINE_START, TIMELINE_DAYS, parseISODate, addWorkdays, isWeekend, isCzechHoliday } from './workdays'

export { isWeekend, isCzechHoliday }

// Default zoom: 8px per day
// Zoom levels: 4, 6, 8, 12, 20 px per day

export function dateToPixel(date: Date, pxPerDay: number): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const days = Math.floor((date.getTime() - TIMELINE_START.getTime()) / msPerDay)
  return Math.max(0, days) * pxPerDay
}

export function pixelToDate(px: number, pxPerDay: number): Date {
  const days = Math.round(px / pxPerDay)
  const date = new Date(TIMELINE_START)
  date.setDate(date.getDate() + days)
  return date
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
  // endDate = start + (md - 1) workdays
  const endDate = addWorkdays(startDate, md - 1)
  const msPerDay = 1000 * 60 * 60 * 24
  const calendarDays = Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay) + 1
  const width = Math.max(calendarDays * pxPerDay, pxPerDay)
  return { left, width }
}

// Total timeline width in pixels
export function getTimelineWidth(pxPerDay: number): number {
  return TIMELINE_DAYS * pxPerDay
}
