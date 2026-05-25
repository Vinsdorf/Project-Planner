'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TeamMember } from '@/types'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  members: TeamMember[]
  color: string
  onCardClick: (task: Task) => void
}

export function KanbanColumn({ id, title, tasks, members, color, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <span className="text-xs text-[#555555] bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg border transition-colors p-2 min-h-[200px] space-y-2 ${
          isOver
            ? 'border-blue-500/50 bg-blue-500/5'
            : 'border-[#1a1a1a] bg-[#0d0d0d]'
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              members={members}
              onClick={onCardClick}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-[#333333]">
            Přetáhněte úkoly sem
          </div>
        )}
      </div>
    </div>
  )
}
