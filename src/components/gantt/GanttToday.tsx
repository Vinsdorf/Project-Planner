'use client'

import React from 'react'
import { differenceInDays } from 'date-fns'
import { ZoomLevel } from '@/types'

interface GanttTodayProps {
  startDate: Date
  zoom: ZoomLevel
  height: number
}

const ZOOM_DAY_WIDTH: Record<ZoomLevel, number> = {
  day: 40,
  week: 20,
  month: 8,
  quarter: 4,
}

export function GanttToday({ startDate, zoom, height }: GanttTodayProps) {
  const dayWidth = ZOOM_DAY_WIDTH[zoom]
  const today = new Date()
  const daysFromStart = differenceInDays(today, startDate)

  if (daysFromStart < 0) return null

  // Position the line in the middle of today's column
  const x = daysFromStart * dayWidth + dayWidth / 2

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{ overflow: 'visible' }}
      width={0}
      height={0}
    >
      <line
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="#ef4444"
        strokeWidth={2}
        strokeDasharray="4 3"
        opacity={0.8}
      />
      <polygon
        points={`${x - 6},0 ${x + 6},0 ${x},8`}
        fill="#ef4444"
        opacity={0.9}
      />
    </svg>
  )
}
