'use client'

import React, { useMemo } from 'react'
import { addDays, isWeekend, isToday } from 'date-fns'
import { ZoomLevel } from '@/types'

interface GanttGridProps {
  startDate: Date
  endDate: Date
  zoom: ZoomLevel
  rowCount: number
  rowHeight: number
}

const ZOOM_DAY_WIDTH: Record<ZoomLevel, number> = {
  day: 40,
  week: 20,
  month: 8,
  quarter: 4,
}

export function GanttGrid({ startDate, endDate, zoom, rowCount, rowHeight }: GanttGridProps) {
  const dayWidth = ZOOM_DAY_WIDTH[zoom]
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const totalWidth = totalDays * dayWidth
  const totalHeight = rowCount * rowHeight

  const columns = useMemo(() => {
    const cols: { left: number; width: number; isWeekend: boolean; isToday: boolean }[] = []
    for (let i = 0; i < totalDays; i++) {
      const day = addDays(startDate, i)
      cols.push({
        left: i * dayWidth,
        width: dayWidth,
        isWeekend: isWeekend(day),
        isToday: isToday(day),
      })
    }
    return cols
  }, [startDate, totalDays, dayWidth])

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={totalWidth}
      height={totalHeight}
      style={{ minWidth: totalWidth }}
    >
      {/* Weekend columns */}
      {columns.map((col, i) =>
        col.isWeekend ? (
          <rect
            key={`weekend-${i}`}
            x={col.left}
            y={0}
            width={col.width}
            height={totalHeight}
            fill="#0d0d0d"
            opacity={0.8}
          />
        ) : null
      )}

      {/* Today column highlight */}
      {columns.map((col, i) =>
        col.isToday ? (
          <rect
            key={`today-${i}`}
            x={col.left}
            y={0}
            width={col.width}
            height={totalHeight}
            fill="#1e40af"
            opacity={0.08}
          />
        ) : null
      )}

      {/* Vertical grid lines */}
      {columns.map((col, i) => (
        <line
          key={`vline-${i}`}
          x1={col.left + col.width}
          y1={0}
          x2={col.left + col.width}
          y2={totalHeight}
          stroke="#1a1a1a"
          strokeWidth={1}
        />
      ))}

      {/* Horizontal row lines */}
      {Array.from({ length: rowCount }).map((_, i) => (
        <line
          key={`hline-${i}`}
          x1={0}
          y1={(i + 1) * rowHeight}
          x2={totalWidth}
          y2={(i + 1) * rowHeight}
          stroke="#1a1a1a"
          strokeWidth={1}
        />
      ))}
    </svg>
  )
}
