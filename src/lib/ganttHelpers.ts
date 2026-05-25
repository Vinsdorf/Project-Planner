import type { Project } from '@/types'

export function weekToPixel(week: number, zoomLevel: number): number {
  return (week - 1) * zoomLevel
}

export function pixelToWeek(px: number, zoomLevel: number): number {
  return Math.max(1, Math.round(px / zoomLevel) + 1)
}

export function getBarStyle(
  project: Project,
  zoomLevel: number
): { left: number; width: number } {
  const left = weekToPixel(project.plannedStartWeek, zoomLevel)
  const width = project.plannedDuration * zoomLevel
  return { left, width }
}

export function getActualBarStyle(
  project: Project,
  zoomLevel: number
): { left: number; width: number } | null {
  if (project.actualStartWeek == null) return null
  const left = weekToPixel(project.actualStartWeek, zoomLevel)
  const duration = project.actualDuration ?? project.plannedDuration
  const width = duration * zoomLevel
  return { left, width }
}
