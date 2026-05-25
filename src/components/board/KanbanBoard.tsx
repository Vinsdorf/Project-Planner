'use client'

import React, { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Task, TeamMember } from '@/types'
import { useTaskStore } from '@/stores/taskStore'
import { useTeamStore } from '@/stores/teamStore'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'

interface KanbanBoardProps {
  projectId: string
}

const COLUMNS: { id: Task['status']; title: string; color: string }[] = [
  { id: 'not-started', title: 'Nezahájeno', color: '#6b7280' },
  { id: 'in-progress', title: 'Probíhá', color: '#3b82f6' },
  { id: 'completed', title: 'Dokončeno', color: '#22c55e' },
  { id: 'blocked', title: 'Blokováno', color: '#ef4444' },
]

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { getTasksByProject, updateTask, moveTaskToStatus } = useTaskStore()
  const { members } = useTeamStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const tasks = getTasksByProject(projectId).filter((t) => !t.isMilestone)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const getTasksByStatus = (status: Task['status']) =>
    tasks.filter((t) => t.status === status)

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Check if dropped on a column
    const columnIds = COLUMNS.map((c) => c.id)
    if (columnIds.includes(overId as Task['status'])) {
      moveTaskToStatus(taskId, overId as Task['status'])
      return
    }

    // Check if dropped on another card - use that card's status
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask && overTask.status !== activeTask?.status) {
      moveTaskToStatus(taskId, overTask.status)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const overId = over.id as string
    const columnIds = COLUMNS.map((c) => c.id)

    if (columnIds.includes(overId as Task['status'])) {
      const task = tasks.find((t) => t.id === active.id)
      if (task && task.status !== overId) {
        moveTaskToStatus(active.id as string, overId as Task['status'])
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={getTasksByStatus(col.id)}
            members={members}
            color={col.color}
            onCardClick={(task) => {}}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <KanbanCard
            task={activeTask}
            members={members}
            onClick={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
