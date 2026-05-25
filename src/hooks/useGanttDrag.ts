'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Project, ProjectTask } from '@/types'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'

type DragType = 'move' | 'resize-left' | 'resize-right'

export type DragTarget =
  | { type: 'project'; id: string }
  | { type: 'task'; id: string }

interface DragState {
  target: DragTarget
  dragType: DragType
  startX: number
  originalStart: number
  originalDuration: number
  // live preview
  previewStart: number
  previewDuration: number
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
      setDragState({
        target,
        dragType,
        startX: e.clientX,
        originalStart: item.plannedStartWeek,
        originalDuration: item.plannedDuration,
        previewStart: item.plannedStartWeek,
        previewDuration: item.plannedDuration,
      })
    },
    []
  )

  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragState.startX
      const weekDelta = Math.round(dx / zoomLevel)

      let newStart = dragState.originalStart
      let newDuration = dragState.originalDuration

      if (dragState.dragType === 'move') {
        newStart = Math.max(1, dragState.originalStart + weekDelta)
      } else if (dragState.dragType === 'resize-left') {
        newStart = Math.max(1, dragState.originalStart + weekDelta)
        const originalEnd = dragState.originalStart + dragState.originalDuration - 1
        newDuration = Math.max(1, originalEnd - newStart + 1)
      } else if (dragState.dragType === 'resize-right') {
        newDuration = Math.max(1, dragState.originalDuration + weekDelta)
      }

      setDragState((prev) =>
        prev ? { ...prev, previewStart: newStart, previewDuration: newDuration } : prev
      )

      if (dragState.target.type === 'project') {
        updateProject(dragState.target.id, {
          plannedStartWeek: newStart,
          plannedDuration: newDuration,
        })
      } else {
        updateTask(dragState.target.id, {
          plannedStartWeek: newStart,
          plannedDuration: newDuration,
        })
      }
    }

    const handleMouseUp = () => {
      setDragState(null)
      // Rebuild conflicts after drag completes
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
