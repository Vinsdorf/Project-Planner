'use client'

import React from 'react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Calendar, AlertTriangle } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, TeamMember } from '@/types'
import { Badge } from '@/components/ui/badge'
import { getTaskColor } from '@/lib/scheduling'

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  low: 'Nízká',
  medium: 'Střední',
  high: 'Vysoká',
  critical: 'Kritická',
}

const PRIORITY_VARIANTS: Record<Task['priority'], 'secondary' | 'warning' | 'danger' | 'info'> = {
  low: 'secondary',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
}

interface KanbanCardProps {
  task: Task
  members: TeamMember[]
  onClick: (task: Task) => void
}

export function KanbanCard({ task, members, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const assignees = members.filter((m) => task.assigneeIds.includes(m.id))
  const daysLeft = differenceInDays(parseISO(task.endDate), new Date())
  const isOverdue = daysLeft < 0
  const isUrgent = daysLeft >= 0 && daysLeft <= 2
  const color = getTaskColor(task.priority, task.color)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-[#111111] border rounded-lg p-3 cursor-grab active:cursor-grabbing select-none transition-all ${
        isDragging ? 'shadow-xl' : 'hover:border-[#3a3a3a]'
      } ${isOverdue ? 'border-red-600/40' : 'border-[#2a2a2a]'}`}
      onClick={() => onClick(task)}
    >
      {/* Color indicator */}
      <div
        className="h-0.5 rounded-full mb-2 -mt-1"
        style={{ backgroundColor: color, opacity: 0.6 }}
      />

      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-white leading-snug">{task.name}</span>
        <Badge variant={PRIORITY_VARIANTS[task.priority]} className="text-[10px] py-0 shrink-0">
          {PRIORITY_LABELS[task.priority]}
        </Badge>
      </div>

      {task.description && (
        <p className="text-xs text-[#666666] mb-2 line-clamp-2">{task.description}</p>
      )}

      {/* Progress bar */}
      {task.progress > 0 && (
        <div className="h-1 rounded-full bg-[#2a2a2a] mb-2">
          <div
            className="h-full rounded-full"
            style={{ width: `${task.progress}%`, backgroundColor: color }}
          />
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-2">
        {/* Assignees */}
        <div className="flex -space-x-1.5">
          {assignees.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="w-6 h-6 rounded-full border-2 border-[#111111] flex items-center justify-center text-[9px] font-bold text-white"
              style={{ backgroundColor: member.color }}
              title={member.name}
            >
              {member.name.slice(0, 1)}
            </div>
          ))}
          {assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-[#111111] bg-[#2a2a2a] flex items-center justify-center text-[9px] text-[#888888]">
              +{assignees.length - 3}
            </div>
          )}
        </div>

        {/* Deadline */}
        <div className={`flex items-center gap-1 text-[10px] ${
          isOverdue ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-[#555555]'
        }`}>
          {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
          {format(parseISO(task.endDate), 'dd.MM.')}
        </div>
      </div>
    </div>
  )
}
