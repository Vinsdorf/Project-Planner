'use client'
import { useCallback } from 'react'
import { useUIStore } from '@/stores/uiStore'

const ZOOM_LEVELS = [20, 30, 40, 60, 80]

export function useGanttZoom() {
  const zoomLevel = useUIStore((s) => s.zoomLevel)
  const setZoomLevel = useUIStore((s) => s.setZoomLevel)

  const zoomIn = useCallback(() => {
    const idx = ZOOM_LEVELS.indexOf(zoomLevel)
    if (idx < ZOOM_LEVELS.length - 1) {
      setZoomLevel(ZOOM_LEVELS[idx + 1])
    }
  }, [zoomLevel, setZoomLevel])

  const zoomOut = useCallback(() => {
    const idx = ZOOM_LEVELS.indexOf(zoomLevel)
    if (idx > 0) {
      setZoomLevel(ZOOM_LEVELS[idx - 1])
    }
  }, [zoomLevel, setZoomLevel])

  return { zoomLevel, zoomIn, zoomOut }
}
