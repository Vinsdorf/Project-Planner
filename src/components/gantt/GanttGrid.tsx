'use client'
import { TIMELINE_START, TIMELINE_END, TIMELINE_DAYS, isWeekend, isCzechHoliday } from '@/lib/workdays'

interface GanttGridProps {
  zoomLevel: number
  totalHeight: number
}

interface DayInfo {
  isWeekend: boolean
  isHoliday: boolean
  isMonday: boolean
  dayIndex: number
}

// Pre-compute day info
function buildDayInfos(): DayInfo[] {
  const infos: DayInfo[] = []
  const cur = new Date(TIMELINE_START)
  cur.setHours(0, 0, 0, 0)
  const end = new Date(TIMELINE_END)
  end.setHours(0, 0, 0, 0)
  let idx = 0
  while (cur <= end) {
    const dow = cur.getDay()
    infos.push({
      isWeekend: dow === 0 || dow === 6,
      isHoliday: isCzechHoliday(new Date(cur)),
      isMonday: dow === 1,
      dayIndex: idx,
    })
    cur.setDate(cur.getDate() + 1)
    idx++
  }
  return infos
}

const DAY_INFOS = buildDayInfos()

export function GanttGrid({ zoomLevel, totalHeight }: GanttGridProps) {
  const totalWidth = TIMELINE_DAYS * zoomLevel

  // Build SVG paths/rects for performance
  const weekendRects: string[] = []
  const holidayRects: string[] = []
  const mondayLines: string[] = []
  const regularLines: string[] = []

  for (const info of DAY_INFOS) {
    const x = info.dayIndex * zoomLevel
    if (info.isHoliday) {
      holidayRects.push(`M${x},0 h${zoomLevel} v${totalHeight} h-${zoomLevel} Z`)
    } else if (info.isWeekend) {
      weekendRects.push(`M${x},0 h${zoomLevel} v${totalHeight} h-${zoomLevel} Z`)
    }
    if (info.isMonday) {
      mondayLines.push(`M${x},0 v${totalHeight}`)
    } else {
      regularLines.push(`M${x},0 v${totalHeight}`)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${totalWidth}px`,
        height: `${totalHeight}px`,
        pointerEvents: 'none',
      }}
    >
      <svg
        width={totalWidth}
        height={totalHeight}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Weekend columns */}
        <path d={weekendRects.join(' ')} fill="rgba(255,255,255,0.02)" />
        {/* Holiday columns */}
        <path d={holidayRects.join(' ')} fill="rgba(239,68,68,0.06)" />
        {/* Regular day lines */}
        <path d={regularLines.join(' ')} stroke="#1a1d27" strokeWidth="1" fill="none" />
        {/* Monday lines (slightly more visible) */}
        <path d={mondayLines.join(' ')} stroke="#252836" strokeWidth="1" fill="none" />
      </svg>
    </div>
  )
}
