'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Project } from '@/types'
import { useProjectStore } from '@/stores/projectStore'

type DragType = 'move' | 'resize-left' | 'resize-right'

interface DragState {
  projectId: string
  type: DragType
  startX: number
  originalStart: number
  originalDuration: number
}

export function useGanttDrag(zoomLevel: number) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const updateProject = useProjectStore((s) => s.updateProject)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, project: Project, type: DragType) => {
      e.preventDefault()
      e.stopPropagation()
      setDragState({
        projectId: project.id,
        type,
        startX: e.clientX,
        originalStart: project.plannedStartWeek,
        originalDuration: project.plannedDuration,
      })
    },
    []
  )

  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragState.startX
      const weekDelta = Math.round(dx / zoomLevel)

      if (dragState.type === 'move') {
        const newStart = Math.max(1, dragState.originalStart + weekDelta)
        updateProject(dragState.projectId, { plannedStartWeek: newStart })
      } else if (dragState.type === 'resize-left') {
        const newStart = Math.max(1, dragState.originalStart + weekDelta)
        const originalEnd =
          dragState.originalStart + dragState.originalDuration - 1
        const newDuration = Math.max(1, originalEnd - newStart + 1)
        updateProject(dragState.projectId, {
          plannedStartWeek: newStart,
          plannedDuration: newDuration,
        })
      } else if (dragState.type === 'resize-right') {
        const newDuration = Math.max(
          1,
          dragState.originalDuration + weekDelta
        )
        updateProject(dragState.projectId, { plannedDuration: newDuration })
      }
    }

    const handleMouseUp = () => {
      setDragState(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, zoomLevel, updateProject])

  return { dragState, handleMouseDown }
}
