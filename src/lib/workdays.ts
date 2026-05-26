// Czech public holidays 2025-2027

// Fixed holidays (MM-DD format, same every year)
const FIXED_HOLIDAYS_MMDD = [
  '01-01', // Nový rok
  '05-01', // Svátek práce
  '05-08', // Den vítězství
  '07-05', // Den slovanských věrozvěstů Cyrila a Metoděje
  '07-06', // Den upálení mistra Jana Husa
  '09-28', // Den české státnosti
  '10-28', // Den vzniku samostatného československého státu
  '11-17', // Den boje za svobodu a demokracii
  '12-24', // Štědrý den
  '12-25', // 1. svátek vánoční
  '12-26', // 2. svátek vánoční
]

// Variable holidays (Easter-based), pre-calculated
const VARIABLE_HOLIDAYS: string[] = [
  // Good Friday (Velký pátek)
  '2025-04-18', '2026-04-03', '2027-03-26',
  // Easter Monday (Velikonoční pondělí)
  '2025-04-21', '2026-04-06', '2027-03-29',
]

function toLocalISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isCzechHoliday(date: Date): boolean {
  const iso = toLocalISO(date)
  if (VARIABLE_HOLIDAYS.includes(iso)) return true
  const mmdd = iso.slice(5) // "MM-DD"
  return FIXED_HOLIDAYS_MMDD.includes(mmdd)
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

export function isNonWorkday(date: Date): boolean {
  return isWeekend(date) || isCzechHoliday(date)
}

export function isWorkday(date: Date): boolean {
  return !isNonWorkday(date)
}

// Get next workday on or after date
export function nextWorkday(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  while (isNonWorkday(d)) {
    d.setDate(d.getDate() + 1)
  }
  return d
}

// Add N man-days to a start date, skipping non-workdays
// If md = 0, returns same date (if workday) or next workday
export function addWorkdays(startDate: Date, md: number): Date {
  const d = nextWorkday(new Date(startDate))
  let remaining = md
  while (remaining > 0) {
    d.setDate(d.getDate() + 1)
    if (isWorkday(d)) {
      remaining--
    }
  }
  return d
}

// Count workdays between two dates (inclusive start, inclusive end)
export function workdaysBetween(start: Date, end: Date): number {
  const s = new Date(start)
  s.setHours(0, 0, 0, 0)
  const e = new Date(end)
  e.setHours(0, 0, 0, 0)
  if (s > e) return 0
  let count = 0
  const cur = new Date(s)
  while (cur <= e) {
    if (isWorkday(cur)) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

// Format date as Czech short format "1.3.2025" or "1.3." (no year)
export function formatDateCZ(date: Date, includeYear = true): string {
  const d = date.getDate()
  const m = date.getMonth() + 1
  if (includeYear) {
    return `${d}.${m}.${date.getFullYear()}`
  }
  return `${d}.${m}.`
}

// Parse "YYYY-MM-DD" string to Date (local time, midnight)
export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Get ISO week number for a date
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Timeline constants
export const TIMELINE_START = new Date(2025, 0, 1)  // Jan 1, 2025
export const TIMELINE_END = new Date(2027, 11, 31)  // Dec 31, 2027
export const TIMELINE_DAYS = 1095  // approx 3 years
