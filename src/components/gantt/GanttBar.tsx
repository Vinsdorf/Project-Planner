'use client'

import React, { useCallback } from 'react'
import { differenceInDays, parseISO, addDays, format } from 'date-fns'
import { Task } from '@/types'
import { getTaskColor } from '@/lib/scheduling'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTaskStore } from '@/stores/taskStore'

interface GanttBarProps {
  task: Task
  ganttStart: Date
  rowIndex: number
  rowHeight: number
  dayWidth: number
  isSelected: boolean
  onClick: (taskId: string) => void
  onUpdate: (taskId: string, updates: Partial<Task>) => void
}

export function GanttBar({
  task,
  ganttStart,
  rowIndex,
  rowHeight,
  dayWidth,
  isSelected,
  onClick,
  onUpdate,
}: GanttBarProps) {
  const taskStart = parseISO(task.startDate)
  const taskEnd = parseISO(task.endDate)
  const daysFromStart = differenceInDays(taskStart, ganttStart)
  const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1)

  const left = daysFromStart * dayWidth
  const width = Math.max(duration * dayWidth - 2, task.isMilestone ? 16 : 4)
  const top = rowIndex * rowHeight + 4
  const barHeight = rowHeight - 8

  const color = getTaskColor(task.priority, task.color)

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const origLeft = daysFromStart

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX
        const daysDelta = Math.round(dx / dayWidth)
        if (daysDelta === 0) return

        const newStart = addDays(taskStart, daysDelta)
        const newEnd = addDays(taskEnd, daysDelta)
        onUpdate(task.id, {
          startDate: format(newStart, 'yyyy-MM-dd'),
          endDate: format(newEnd, 'yyyy-MM-dd'),
        })
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [daysFromStart, dayWidth, task.id, taskStart, taskEnd, onUpdate]
  )

  const handleResizeRight = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const startX = e.clientX

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX
        const daysDelta = Math.round(dx / dayWidth)
        if (daysDelta === 0) return

        const newEnd = addDays(taskEnd, daysDelta)
        if (newEnd <= taskStart) return
        onUpdate(task.id, {
          endDate: format(newEnd, 'yyyy-MM-dd'),
          duration: Math.max(1, differenceInDays(newEnd, taskStart) + 1),
        })
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [dayWidth, task.id, taskEnd, taskStart, onUpdate]
  )

  if (task.isMilestone) {
    const cx = left + dayWidth / 2
    const cy = top + barHeight / 2
    const size = Math.min(barHeight * 0.6, 12)

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <g
              style={{ cursor: 'pointer' }}
              onClick={() => onClick(task.id)}
              transform={`translate(${cx}, ${cy}) rotate(45)`}
            >
              <rect
                x={-size}
                y={-size}
                width={size * 2}
                height={size * 2}
                fill={color}
                stroke={isSelected ? '#ffffff' : 'transparent'}
                strokeWidth={isSelected ? 2 : 0}
                rx={2}
              />
            </g>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-semibold">{task.name}</div>
              <div className="text-[#888888]">{format(taskStart, 'dd.MM.yyyy')}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <g
            style={{ cursor: 'grab' }}
            onClick={() => onClick(task.id)}
            onMouseDown={handleDragStart}
          >
            {/* Background bar */}
            <rect
              x={left + 1}
              y={top}
              width={width}
              height={barHeight}
              fill={color}
              fillOpacity={0.25}
              rx={3}
              stroke={isSelected ? '#ffffff' : color}
              strokeWidth={isSelected ? 2 : 1}
              strokeOpacity={0.6}
              className="gantt-bar"
            />
            {/* Progress fill */}
            {task.progress > 0 && (
              <rect
                x={left + 1}
                y={top}
                width={Math.max(0, (width * task.progress) / 100)}
                height={barHeight}
                fill={color}
                fillOpacity={0.7}
                rx={3}
                className="pointer-events-none"
              />
            )}
            {/* Label */}
            {width > 30 && (
              <text
                x={left + 6}
                y={top + barHeight / 2 + 4}
                fontSize={10}
                fill="white"
                fillOpacity={0.9}
                className="pointer-events-none select-none"
                style={{ fontFamily: 'sans-serif' }}
              >
                {task.name.slice(0, Math.floor(width / 6))}
                {task.name.length > Math.floor(width / 6) ? '…' : ''}
              </text>
            )}
            {/* Resize handle right */}
            <rect
              x={left + width - 4}
              y={top + 2}
              width={6}
              height={barHeight - 4}
              fill="white"
              fillOpacity={0.2}
              rx={2}
              style={{ cursor: 'ew-resize' }}
              onMouseDown={handleResizeRight}
            />
          </g>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <div className="font-semibold">{task.name}</div>
            <div className="text-[#888888]">
              {format(taskStart, 'dd.MM.yyyy')} – {format(taskEnd, 'dd.MM.yyyy')}
            </div>
            <div className="text-[#888888]">Průběh: {task.progress}%</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
