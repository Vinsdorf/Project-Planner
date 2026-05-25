export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function getWeeksInYear(year: number): number {
  const dec28 = new Date(year, 11, 28)
  return getWeekNumber(dec28)
}

const CZECH_MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
]

export function weekToMonth(week: number, year: number): string {
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const weekStart = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000 + (week - 1) * 7 * 86400000)
  return CZECH_MONTHS[weekStart.getMonth()]
}

export function getMonthsForTimeline(year: number): Array<{ name: string; startWeek: number; endWeek: number }> {
  const totalWeeks = getWeeksInYear(year)
  const months: Array<{ name: string; startWeek: number; endWeek: number }> = []
  let currentMonth = ''
  let startWeek = 1

  for (let w = 1; w <= totalWeeks; w++) {
    const month = weekToMonth(w, year)
    if (month !== currentMonth) {
      if (currentMonth !== '') {
        months.push({ name: currentMonth, startWeek, endWeek: w - 1 })
      }
      currentMonth = month
      startWeek = w
    }
  }
  if (currentMonth !== '') {
    months.push({ name: currentMonth, startWeek, endWeek: totalWeeks })
  }
  return months
}

export function getCurrentWeek(): number {
  return getWeekNumber(new Date())
}
