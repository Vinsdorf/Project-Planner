'use client'

import React from 'react'
import { parseISO, differenceInDays } from 'date-fns'
import { Task, Dependency } from '@/types'

interface GanttDependencyLineProps {
  fromTask: Task
  toTask: Task
  dependency: Dependency
  ganttStart: Date
  rowMap: Map<string, number>
  dayWidth: number
  rowHeight: number
}

export function GanttDependencyLine({
  fromTask,
  toTask,
  dependency,
  ganttStart,
  rowMap,
  dayWidth,
  rowHeight,
}: GanttDependencyLineProps) {
  const fromRow = rowMap.get(fromTask.id)
  const toRow = rowMap.get(toTask.id)

  if (fromRow === undefined || toRow === undefined) return null

  const fromEnd = parseISO(fromTask.endDate)
  const toStart = parseISO(toTask.startDate)
  const fromDuration = Math.max(1, differenceInDays(parseISO(fromTask.endDate), parseISO(fromTask.startDate)) + 1)

  const fromDaysFromStart = differenceInDays(fromEnd, ganttStart)
  const toDaysFromStart = differenceInDays(toStart, ganttStart)

  const x1 = (fromDaysFromStart + 1) * dayWidth
  const y1 = fromRow * rowHeight + rowHeight / 2
  const x2 = toDaysFromStart * dayWidth
  const y2 = toRow * rowHeight + rowHeight / 2

  const midX = (x1 + x2) / 2

  // Draw an L-shaped path
  const path = `M ${x1} ${y1} L ${x1 + 8} ${y1} L ${x1 + 8} ${y2} L ${x2 - 6} ${y2}`

  return (
    <g opacity={0.6}>
      <path
        d={path}
        stroke="#3b82f6"
        strokeWidth={1.5}
        fill="none"
        markerEnd="url(#arrowhead)"
      />
    </g>
  )
}

export function DependencyArrowMarker() {
  return (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="6"
        markerHeight="4"
        refX="6"
        refY="2"
        orient="auto"
      >
        <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" opacity={0.8} />
      </marker>
    </defs>
  )
}
