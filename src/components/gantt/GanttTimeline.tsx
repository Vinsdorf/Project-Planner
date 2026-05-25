'use client'
import { getMonthsForTimeline, getWeeksInYear } from '@/lib/weekUtils'
import { CURRENT_YEAR } from '@/lib/defaults'

interface GanttTimelineProps {
  zoomLevel: number
}

export function GanttTimeline({ zoomLevel }: GanttTimelineProps) {
  const months = getMonthsForTimeline(CURRENT_YEAR)
  const totalWeeks = getWeeksInYear(CURRENT_YEAR)

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
      {/* Month row */}
      <div style={{ display: 'flex', height: '20px', borderBottom: '1px solid #2a2d37' }}>
        {months.map((m) => (
          <div
            key={m.name + m.startWeek}
            style={{
              width: `${(m.endWeek - m.startWeek + 1) * zoomLevel}px`,
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
            {m.name}
          </div>
        ))}
      </div>

      {/* Week numbers row */}
      <div style={{ display: 'flex', height: '16px' }}>
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
          <div
            key={w}
            style={{
              width: `${zoomLevel}px`,
              flexShrink: 0,
              borderRight: '1px solid #1e2130',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              color: '#4b5563',
            }}
          >
            {zoomLevel >= 30 ? w : w % 4 === 1 ? w : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
