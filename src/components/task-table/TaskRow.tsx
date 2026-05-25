'use client'

import React, { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Trash2, GripVertical, ChevronRight, ChevronDown, Flag } from 'lucide-react'
import { Task } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InlineEditor } from './InlineEditor'
import { getTaskColor } from '@/lib/scheduling'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  low: 'Nízká',
  medium: 'Střední',
  high: 'Vysoká',
  critical: 'Kritická',
}

const STATUS_LABELS: Record<Task['status'], string> = {
  'not-started': 'Nezahájeno',
  'in-progress': 'Probíhá',
  completed: 'Dokončeno',
  blocked: 'Blokováno',
}

const PRIORITY_VARIANTS: Record<Task['priority'], 'secondary' | 'warning' | 'danger' | 'info'> = {
  low: 'secondary',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
}

interface TaskRowProps {
  task: Task
  depth: number
  isExpanded: boolean
  hasChildren: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  onToggleExpand: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
}

export function TaskRow({
  task,
  depth,
  isExpanded,
  hasChildren,
  isSelected,
  onSelect,
  onToggleExpand,
  onUpdate,
  onDelete,
}: TaskRowProps) {
  const [editingName, setEditingName] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const color = getTaskColor(task.priority, task.color)

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-[#1a1a1a] cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-600/10' : 'hover:bg-[#111111]'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => onSelect(task.id)}
    >
      {/* Drag handle */}
      <td className="w-8 px-1">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-[#333333] hover:text-[#888888] cursor-grab"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3" />
        </button>
      </td>

      {/* Name */}
      <td className="py-2" style={{ paddingLeft: 8 + depth * 20 }}>
        <div className="flex items-center gap-1">
          <button
            className="w-4 h-4 flex items-center justify-center text-[#555555] hover:text-white shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              if (hasChildren) onToggleExpand(task.id)
            }}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
            ) : (
              task.isMilestone ? (
                <Flag className="w-3 h-3 text-yellow-400" />
              ) : (
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: color }} />
              )
            )}
          </button>

          {editingName ? (
            <InlineEditor
              value={task.name}
              onSave={(val) => {
                onUpdate(task.id, { name: val })
                setEditingName(false)
              }}
              onCancel={() => setEditingName(false)}
              className="flex-1"
            />
          ) : (
            <span
              className={`text-sm truncate max-w-[200px] ${
                task.isMilestone ? 'text-yellow-400 font-medium' :
                !task.parentId ? 'text-white font-medium' : 'text-[#cccccc]'
              }`}
              onDoubleClick={(e) => {
                e.stopPropagation()
                setEditingName(true)
              }}
            >
              {task.name}
            </span>
          )}
        </div>
      </td>

      {/* Start date */}
      <td className="px-3 py-2 text-xs text-[#888888] whitespace-nowrap">
        {format(parseISO(task.startDate), 'dd.MM.yyyy')}
      </td>

      {/* End date */}
      <td className="px-3 py-2 text-xs text-[#888888] whitespace-nowrap">
        {format(parseISO(task.endDate), 'dd.MM.yyyy')}
      </td>

      {/* Duration */}
      <td className="px-3 py-2 text-xs text-[#888888] text-center">
        {task.isMilestone ? '—' : `${task.duration}d`}
      </td>

      {/* Progress */}
      <td className="px-3 py-2 text-xs text-center">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${task.progress}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-[#888888] w-7 text-right">{task.progress}%</span>
        </div>
      </td>

      {/* Priority */}
      <td className="px-3 py-2">
        <Badge variant={PRIORITY_VARIANTS[task.priority]} className="text-[10px] py-0">
          {PRIORITY_LABELS[task.priority]}
        </Badge>
      </td>

      {/* Status */}
      <td className="px-3 py-2 text-xs text-[#888888]">
        {STATUS_LABELS[task.status]}
      </td>

      {/* Actions */}
      <td className="px-2 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task.id)
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </td>
    </tr>
  )
}
