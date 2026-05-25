'use client'

import { useCallback } from 'react'
import { useUiStore } from '@/stores/uiStore'
import { ZoomLevel } from '@/types'

const ZOOM_COLUMN_WIDTHS: Record<ZoomLevel, number> = {
  day: 40,
  week: 20,
  month: 8,
  quarter: 4,
}

export function useGanttZoom() {
  const { ganttZoom, setGanttZoom } = useUiStore()

  const columnWidth = ZOOM_COLUMN_WIDTHS[ganttZoom]

  const zoomIn = useCallback(() => {
    const levels: ZoomLevel[] = ['quarter', 'month', 'week', 'day']
    const idx = levels.indexOf(ganttZoom)
    if (idx < levels.length - 1) {
      setGanttZoom(levels[idx + 1])
    }
  }, [ganttZoom, setGanttZoom])

  const zoomOut = useCallback(() => {
    const levels: ZoomLevel[] = ['quarter', 'month', 'week', 'day']
    const idx = levels.indexOf(ganttZoom)
    if (idx > 0) {
      setGanttZoom(levels[idx - 1])
    }
  }, [ganttZoom, setGanttZoom])

  return { zoom: ganttZoom, setZoom: setGanttZoom, columnWidth, zoomIn, zoomOut }
}
