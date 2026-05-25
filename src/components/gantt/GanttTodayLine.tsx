'use client'
import { getCurrentWeek } from '@/lib/weekUtils'
import { weekToPixel } from '@/lib/ganttHelpers'

interface GanttTodayLineProps {
  zoomLevel: number
  totalHeight: number
}

export function GanttTodayLine({ zoomLevel, totalHeight }: GanttTodayLineProps) {
  const week = getCurrentWeek()
  const left = weekToPixel(week, zoomLevel) + zoomLevel / 2

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: `${left}px`,
        width: '2px',
        height: `${totalHeight}px`,
        background: '#ef4444',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '4px',
          background: '#ef4444',
          color: 'white',
          fontSize: '10px',
          padding: '1px 4px',
          borderRadius: '3px',
          whiteSpace: 'nowrap',
          fontWeight: 600,
        }}
      >
        Dnes
      </div>
    </div>
  )
}
