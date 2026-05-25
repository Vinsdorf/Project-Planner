import { addDays, isWeekend, parseISO, differenceInDays, format } from 'date-fns'

export function isWorkday(date: Date): boolean {
  return !isWeekend(date)
}

export function addWorkdays(date: Date, days: number): Date {
  let current = date
  let remaining = days
  while (remaining > 0) {
    current = addDays(current, 1)
    if (isWorkday(current)) {
      remaining--
    }
  }
  return current
}

export function countWorkdays(start: Date, end: Date): number {
  let count = 0
  let current = new Date(start)
  while (current <= end) {
    if (isWorkday(current)) count++
    current = addDays(current, 1)
  }
  return count
}

export function getWorkdaysBetween(startStr: string, endStr: string): number {
  const start = parseISO(startStr)
  const end = parseISO(endStr)
  return countWorkdays(start, end)
}

export function formatDateCz(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd.MM.yyyy')
}

export function getDaysArray(start: Date, end: Date): Date[] {
  const days: Date[] = []
  let current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current = addDays(current, 1)
  }
  return days
}
