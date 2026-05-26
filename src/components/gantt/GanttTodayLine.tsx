'use client'
import { dateToPixel } from '@/lib/ganttHelpers'
import { formatDateCZ } from '@/lib/workdays'

interface GanttTodayLineProps {
  zoomLevel: number
  totalHeight: number
}

export function GanttTodayLine({ zoomLevel, totalHeight }: GanttTodayLineProps) {
  const today = new Date()
  const left = dateToPixel(today, zoomLevel)
  const label = formatDateCZ(today)

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
        Dnes {label}
      </div>
    </div>
  )
}
