'use client'
import { useCallback } from 'react'
import { useUIStore } from '@/stores/uiStore'

const ZOOM_LEVELS = [4, 6, 8, 12, 20]

export function useGanttZoom() {
  const zoomLevel = useUIStore((s) => s.zoomLevel)
  const setZoomLevel = useUIStore((s) => s.setZoomLevel)

  const zoomIn = useCallback(() => {
    const idx = ZOOM_LEVELS.indexOf(zoomLevel)
    if (idx < ZOOM_LEVELS.length - 1) {
      setZoomLevel(ZOOM_LEVELS[idx + 1])
    } else if (idx === -1) {
      // Snap to nearest level above
      const above = ZOOM_LEVELS.find((l) => l > zoomLevel)
      if (above !== undefined) setZoomLevel(above)
    }
  }, [zoomLevel, setZoomLevel])

  const zoomOut = useCallback(() => {
    const idx = ZOOM_LEVELS.indexOf(zoomLevel)
    if (idx > 0) {
      setZoomLevel(ZOOM_LEVELS[idx - 1])
    } else if (idx === -1) {
      // Snap to nearest level below
      const below = [...ZOOM_LEVELS].reverse().find((l) => l < zoomLevel)
      if (below !== undefined) setZoomLevel(below)
    }
  }, [zoomLevel, setZoomLevel])

  return { zoomLevel, zoomIn, zoomOut }
}
