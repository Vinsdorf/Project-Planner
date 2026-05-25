'use client'

import React, { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { format, addDays } from 'date-fns'
import { Plus } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Task } from '@/types'
import { useTaskStore } from '@/stores/taskStore'
import { useUiStore } from '@/stores/uiStore'
import { buildTaskTree } from '@/lib/scheduling'
import { TaskRow } from './TaskRow'
import { Button } from '@/components/ui/button'

interface TaskTableProps {
  projectId: string
}

export function TaskTable({ projectId }: TaskTableProps) {
  const { getTasksByProject, addTask, updateTask, deleteTask, reorderTasks } = useTaskStore()
  const { selectedTaskId, setSelectedTask } = useUiStore()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const allTasks = getTasksByProject(projectId)
  const orderedTasks = buildTaskTree(allTasks)

  const visibleTasks = orderedTasks.filter((task) => {
    if (!task.parentId) return true
    return !collapsed.has(task.parentId)
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const hasChildren = useCallback(
    (taskId: string) => allTasks.some((t) => t.parentId === taskId),
    [allTasks]
  )

  const getDepth = useCallback(
    (task: Task): number => (task.parentId ? 1 : 0),
    []
  )

  const toggleCollapse = (taskId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const handleAddTask = () => {
    const today = new Date()
    const maxOrder = allTasks.reduce((max, t) => Math.max(max, t.sortOrder), -1)
    addTask({
      projectId,
      name: 'Nový úkol',
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(addDays(today, 4), 'yyyy-MM-dd'),
      duration: 5,
      progress: 0,
      priority: 'medium',
      status: 'not-started',
      assigneeIds: [],
      dependencies: [],
      isMilestone: false,
      sortOrder: maxOrder + 1,
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = visibleTasks.findIndex((t) => t.id === active.id)
    const newIndex = visibleTasks.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(visibleTasks, oldIndex, newIndex)
    reorderTasks(projectId, reordered.map((t) => t.id))
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#111111] text-xs text-[#888888] uppercase tracking-wider">
                <th className="w-8" />
                <th className="text-left py-2 px-3 font-medium min-w-[200px]">Název</th>
                <th className="text-left py-2 px-3 font-medium whitespace-nowrap">Začátek</th>
                <th className="text-left py-2 px-3 font-medium whitespace-nowrap">Konec</th>
                <th className="text-center py-2 px-3 font-medium">Dny</th>
                <th className="text-left py-2 px-3 font-medium min-w-[120px]">Průběh</th>
                <th className="text-left py-2 px-3 font-medium">Priorita</th>
                <th className="text-left py-2 px-3 font-medium">Stav</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="group">
              <SortableContext
                items={visibleTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {visibleTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    depth={getDepth(task)}
                    isExpanded={!collapsed.has(task.id)}
                    hasChildren={hasChildren(task.id)}
                    isSelected={selectedTaskId === task.id}
                    onSelect={setSelectedTask}
                    onToggleExpand={toggleCollapse}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>

      {/* Add task button */}
      <div className="p-3 border-t border-[#2a2a2a]">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-[#888888] hover:text-white"
          onClick={handleAddTask}
        >
          <Plus className="w-4 h-4" />
          Přidat úkol
        </Button>
      </div>
    </div>
  )
}
