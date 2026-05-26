'use client'
import { TIMELINE_START, TIMELINE_END, isWeekend, isCzechHoliday } from '@/lib/workdays'

const CZECH_MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
]

interface GanttTimelineProps {
  zoomLevel: number
}

interface MonthSegment {
  label: string
  days: number
  startDay: number // index offset into the full day list
}

export function GanttTimeline({ zoomLevel }: GanttTimelineProps) {
  // Build month segments and day list
  const monthSegments: MonthSegment[] = []
  const days: Date[] = []

  const cur = new Date(TIMELINE_START)
  cur.setHours(0, 0, 0, 0)
  const end = new Date(TIMELINE_END)
  end.setHours(0, 0, 0, 0)

  let currentMonth = -1
  let currentYear = -1
  let segStart = 0
  let segDays = 0

  while (cur <= end) {
    const dayIndex = days.length
    days.push(new Date(cur))

    const m = cur.getMonth()
    const y = cur.getFullYear()
    if (m !== currentMonth || y !== currentYear) {
      if (segDays > 0) {
        const label = currentMonth === 0
          ? `${CZECH_MONTHS[currentMonth]} ${currentYear}`
          : CZECH_MONTHS[currentMonth]
        monthSegments.push({ label, days: segDays, startDay: segStart })
      }
      currentMonth = m
      currentYear = y
      segStart = dayIndex
      segDays = 1
    } else {
      segDays++
    }
    cur.setDate(cur.getDate() + 1)
  }
  // push last segment
  if (segDays > 0) {
    const label = currentMonth === 0
      ? `${CZECH_MONTHS[currentMonth]} ${currentYear}`
      : CZECH_MONTHS[currentMonth]
    monthSegments.push({ label, days: segDays, startDay: segStart })
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#222535',
        borderBottom: '1px solid #2a2d37',
        flexShrink: 0,
      }}
    >
      {/* Row 1: Month header */}
      <div style={{ display: 'flex', height: '22px', borderBottom: '1px solid #2a2d37' }}>
        {monthSegments.map((seg) => (
          <div
            key={seg.label + seg.startDay}
            style={{
              width: `${seg.days * zoomLevel}px`,
              flexShrink: 0,
              borderRight: '1px solid #2a2d37',
              display: 'flex',
              alignItems: 'center',
              padding: '0 6px',
              fontSize: '10px',
              fontWeight: 600,
              color: '#6b7280',
              letterSpacing: '0.05em',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {seg.label}
          </div>
        ))}
      </div>

      {/* Row 2: Day numbers */}
      <div style={{ display: 'flex', height: '20px' }}>
        {days.map((day, i) => {
          const weekend = isWeekend(day)
          const holiday = isCzechHoliday(day)
          const dayNum = day.getDate()

          // decide whether to show the day number
          let showDay = true
          if (zoomLevel < 5) {
            showDay = dayNum % 10 === 0
          } else if (zoomLevel < 8) {
            showDay = dayNum % 5 === 0
          }

          let bg = 'transparent'
          let textColor = '#4b5563'
          if (holiday) {
            bg = 'rgba(239,68,68,0.08)'
            textColor = '#f87171'
          } else if (weekend) {
            bg = 'rgba(255,255,255,0.03)'
            textColor = '#4b5563'
          }

          return (
            <div
              key={i}
              style={{
                width: `${zoomLevel}px`,
                flexShrink: 0,
                borderRight: '1px solid #1e2130',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                color: textColor,
                background: bg,
                overflow: 'hidden',
              }}
            >
              {showDay ? dayNum : ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}
