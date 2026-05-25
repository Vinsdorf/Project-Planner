'use client'
import { getWeeksInYear } from '@/lib/weekUtils'
import { CURRENT_YEAR } from '@/lib/defaults'

interface GanttGridProps {
  zoomLevel: number
  totalHeight: number
}

export function GanttGrid({ zoomLevel, totalHeight }: GanttGridProps) {
  const totalWeeks = getWeeksInYear(CURRENT_YEAR)

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${totalWeeks * zoomLevel}px`,
        height: `${totalHeight}px`,
        pointerEvents: 'none',
        display: 'flex',
      }}
    >
      {Array.from({ length: totalWeeks }, (_, i) => i).map((i) => (
        <div
          key={i}
          style={{
            width: `${zoomLevel}px`,
            height: '100%',
            flexShrink: 0,
            background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
            borderRight: '1px solid #1a1d27',
          }}
        />
      ))}
    </div>
  )
}
