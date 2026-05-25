'use client'
import { useState } from 'react'
import type { Project } from '@/types'
import { getBarStyle, getActualBarStyle } from '@/lib/ganttHelpers'
import { useGanttDrag } from '@/hooks/useGanttDrag'

interface GanttBarProps {
  project: Project
  zoomLevel: number
}

const isDone = (phase: string) =>
  phase.startsWith('Hotovo') || phase === 'Zastaveno'

export function GanttBar({ project, zoomLevel }: GanttBarProps) {
  const [tooltip, setTooltip] = useState(false)
  const { handleMouseDown } = useGanttDrag(zoomLevel)
  const planned = getBarStyle(project, zoomLevel)
  const actual = getActualBarStyle(project, zoomLevel)
  const done = isDone(project.phase)

  const barBg = done ? '#374151' : 'rgba(59,130,246,0.35)'
  const progressBg = done ? '#6b7280' : '#22c55e'

  const tooltipText = `${project.name} | Týden ${project.plannedStartWeek} → ${project.plannedStartWeek + project.plannedDuration - 1} | ${project.plannedDuration} týdnů | ${Math.round(project.percentComplete * 100)}%`

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Planned bar */}
      <div
        className="gantt-bar"
        style={{
          left: `${planned.left}px`,
          width: `${Math.max(planned.width, 4)}px`,
          background: barBg,
          border: '1px solid rgba(59,130,246,0.4)',
          userSelect: 'none',
        }}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
      >
        {/* Left resize handle */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '6px',
            height: '100%',
            cursor: 'col-resize',
            zIndex: 2,
          }}
          onMouseDown={(e) => handleMouseDown(e, project, 'resize-left')}
        />

        {/* Progress fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${project.percentComplete * 100}%`,
            height: '100%',
            background: progressBg,
            borderRadius: '4px',
            opacity: 0.5,
          }}
        />

        {/* Drag area */}
        <div
          style={{
            position: 'absolute',
            left: '6px',
            right: '6px',
            top: 0,
            height: '100%',
            cursor: 'grab',
            zIndex: 1,
          }}
          onMouseDown={(e) => handleMouseDown(e, project, 'move')}
        />

        {/* Right resize handle */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '6px',
            height: '100%',
            cursor: 'col-resize',
            zIndex: 2,
          }}
          onMouseDown={(e) => handleMouseDown(e, project, 'resize-right')}
        />

        {/* Label */}
        {planned.width > 60 && (
          <div
            style={{
              position: 'absolute',
              left: '8px',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.8)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            {project.name}
          </div>
        )}
      </div>

      {/* Actual bar (on top of planned) */}
      {actual && !done && (
        <div
          className="gantt-bar"
          style={{
            left: `${actual.left}px`,
            width: `${Math.max(actual.width, 4)}px`,
            background: 'rgba(59,130,246,0.7)',
            border: '1px solid #3b82f6',
            top: '4px',
            height: '12px',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            top: '-36px',
            left: `${planned.left}px`,
            background: '#111827',
            color: '#e8eaf6',
            fontSize: '11px',
            padding: '4px 8px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            zIndex: 200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            border: '1px solid #2a2d37',
          }}
        >
          {tooltipText}
        </div>
      )}
    </div>
  )
}
