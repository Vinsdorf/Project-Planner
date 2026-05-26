'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Project, ProjectTask } from '@/types'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { pixelToDate, dateToPixel } from '@/lib/ganttHelpers'
import { nextWorkday, workdaysBetween, parseISODate, addWorkdays } from '@/lib/workdays'

type DragType = 'move' | 'resize-left' | 'resize-right'

export type DragTarget =
  | { type: 'project'; id: string }
  | { type: 'task'; id: string }

function toISOString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

interface DragState {
  target: DragTarget
  dragType: DragType
  startX: number
  originalStartDate: string
  originalDuration: number
  // live preview (pixel offset)
  previewLeftPx: number
}

export function useGanttDrag(zoomLevel: number) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const updateProject = useProjectStore((s) => s.updateProject)
  const updateTask = useProjectStore((s) => s.updateTask)
  const projects = useProjectStore((s) => s.projects)
  const tasks = useProjectStore((s) => s.tasks)
  const rebuildConflictMap = useUIStore((s) => s.rebuildConflictMap)
  const setSaveStatus = useUIStore((s) => s.setSaveStatus)

  const handleMouseDown = useCallback(
    (
      e: React.MouseEvent,
      item: Project | ProjectTask,
      dragType: DragType,
      target: DragTarget
    ) => {
      e.preventDefault()
      e.stopPropagation()
      const startDate = item.startDate ?? ''
      const leftPx = startDate
        ? dateToPixel(parseISODate(startDate), zoomLevel)
        : 0
      setDragState({
        target,
        dragType,
        startX: e.clientX,
        originalStartDate: startDate,
        originalDuration: item.plannedDuration,
        previewLeftPx: leftPx,
      })
    },
    [zoomLevel]
  )

  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragState.startX

      if (!dragState.originalStartDate) return
      const origStart = parseISODate(dragState.originalStartDate)
      const origLeftPx = dateToPixel(origStart, zoomLevel)

      if (dragState.dragType === 'move') {
        const newLeftPx = origLeftPx + dx
        const rawDate = pixelToDate(Math.max(0, newLeftPx), zoomLevel)
        const newStart = nextWorkday(rawDate)
        const newStartStr = toISOString(newStart)

        setDragState((prev) =>
          prev ? { ...prev, previewLeftPx: newLeftPx } : prev
        )

        if (dragState.target.type === 'project') {
          updateProject(dragState.target.id, { startDate: newStartStr })
        } else {
          updateTask(dragState.target.id, { startDate: newStartStr })
        }
      } else if (dragState.dragType === 'resize-right') {
        // Compute new right edge
        const origEnd = addWorkdays(origStart, dragState.originalDuration - 1)
        const origRightPx = dateToPixel(origEnd, zoomLevel) + zoomLevel
        const newRightPx = Math.max(origLeftPx + zoomLevel, origRightPx + dx)
        const rawEndDate = pixelToDate(newRightPx - zoomLevel, zoomLevel)
        const newEnd = nextWorkday(rawEndDate)
        const newMD = Math.max(1, workdaysBetween(origStart, newEnd))

        if (dragState.target.type === 'project') {
          updateProject(dragState.target.id, { plannedDuration: newMD })
        } else {
          updateTask(dragState.target.id, { plannedDuration: newMD })
        }
      } else if (dragState.dragType === 'resize-left') {
        const newLeftPx = origLeftPx + dx
        const rawDate = pixelToDate(Math.max(0, newLeftPx), zoomLevel)
        const newStart = nextWorkday(rawDate)
        const origEnd = addWorkdays(origStart, dragState.originalDuration - 1)
        // Ensure new start doesn't pass the original end
        if (newStart <= origEnd) {
          const newMD = Math.max(1, workdaysBetween(newStart, origEnd))
          const newStartStr = toISOString(newStart)
          setDragState((prev) =>
            prev ? { ...prev, previewLeftPx: newLeftPx } : prev
          )
          if (dragState.target.type === 'project') {
            updateProject(dragState.target.id, { startDate: newStartStr, plannedDuration: newMD })
          } else {
            updateTask(dragState.target.id, { startDate: newStartStr, plannedDuration: newMD })
          }
        }
      }
    }

    const handleMouseUp = () => {
      setDragState(null)
      rebuildConflictMap(projects, tasks)
      setSaveStatus('saved')
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, zoomLevel, updateProject, updateTask, rebuildConflictMap, projects, tasks, setSaveStatus])

  return { dragState, handleMouseDown }
}
