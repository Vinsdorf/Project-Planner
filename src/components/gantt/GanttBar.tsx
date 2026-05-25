'use client'
import { useState } from 'react'
import type { Project, ProjectTask } from '@/types'
import { getBarStyle, getActualBarStyle } from '@/lib/ganttHelpers'
import { useGanttDrag } from '@/hooks/useGanttDrag'

// Phase badge colors
const PHASE_COLORS: Record<string, string> = {
  Zadání: '#6366f1',
  Analýza: '#8b5cf6',
  Vývoj: '#3b82f6',
  Test: '#f59e0b',
  Release: '#22c55e',
}

const isDone = (phase: string) =>
  phase.startsWith('Hotovo') || phase === 'Zastaveno'

interface GanttBarProjectProps {
  mode: 'project'
  project: Project
  zoomLevel: number
  hasConflict?: boolean
  isSummary?: boolean
}

interface GanttBarTaskProps {
  mode: 'task'
  task: ProjectTask
  projectName: string
  zoomLevel: number
  hasConflict?: boolean
}

type GanttBarProps = GanttBarProjectProps | GanttBarTaskProps

export function GanttBar(props: GanttBarProps) {
  const [tooltip, setTooltip] = useState(false)
  const { handleMouseDown } = useGanttDrag(props.zoomLevel)

  if (props.mode === 'project') {
    const { project, zoomLevel, hasConflict, isSummary } = props
    const planned = getBarStyle(project, zoomLevel)
    const actual = getActualBarStyle(project, zoomLevel)
    const done = isDone(project.phase)

    const barBg = hasConflict
      ? 'rgba(239,68,68,0.25)'
      : isSummary
        ? 'rgba(99,102,241,0.2)'
        : done
          ? '#374151'
          : 'rgba(59,130,246,0.3)'
    const progressBg = hasConflict ? '#ef4444' : done ? '#6b7280' : '#22c55e'
    const borderColor = hasConflict
      ? '#ef4444'
      : isSummary
        ? 'rgba(99,102,241,0.5)'
        : 'rgba(59,130,246,0.4)'
    const borderWidth = hasConflict ? '2px' : '1px'

    const tooltipText = `${project.name} | Týden ${project.plannedStartWeek} → ${
      project.plannedStartWeek + project.plannedDuration - 1
    } | ${project.plannedDuration} týdnů | ${Math.round(project.percentComplete * 100)}%`

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Planned bar */}
        <div
          className="gantt-bar"
          style={{
            left: `${planned.left}px`,
            width: `${Math.max(planned.width, 4)}px`,
            background: barBg,
            border: `${borderWidth} solid ${borderColor}`,
            boxShadow: hasConflict ? '0 0 10px rgba(239,68,68,0.6), inset 0 0 12px rgba(239,68,68,0.1)' : undefined,
            transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
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
            onMouseDown={(e) =>
              handleMouseDown(e, project, 'resize-left', {
                type: 'project',
                id: project.id,
              })
            }
          />

          {/* Progress fill */}
          {!isSummary && (
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
          )}

          {/* Diamond endpoints for summary bar */}
          {isSummary && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: '-4px',
                  top: '50%',
                  transform: 'translateY(-50%) rotate(45deg)',
                  width: '8px',
                  height: '8px',
                  background: '#6366f1',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: '-4px',
                  top: '50%',
                  transform: 'translateY(-50%) rotate(45deg)',
                  width: '8px',
                  height: '8px',
                  background: '#6366f1',
                }}
              />
            </>
          )}

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
            onMouseDown={(e) =>
              handleMouseDown(e, project, 'move', {
                type: 'project',
                id: project.id,
              })
            }
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
            onMouseDown={(e) =>
              handleMouseDown(e, project, 'resize-right', {
                type: 'project',
                id: project.id,
              })
            }
          />

          {/* Label */}
          {planned.width > 60 && (
            <div
              style={{
                position: 'absolute',
                left: '8px',
                right: hasConflict ? '20px' : '8px',
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

          {/* Conflict badge */}
          {hasConflict && (
            <div
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                background: '#ef4444',
                borderRadius: '3px',
                width: '14px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                zIndex: 4,
                pointerEvents: 'none',
              }}
            >
              ⚠
            </div>
          )}
        </div>

        {/* Actual bar */}
        {actual && !done && !isSummary && (
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

  // Task bar mode
  const { task, projectName, zoomLevel, hasConflict } = props
  const left = (task.plannedStartWeek - 1) * zoomLevel
  const width = task.plannedDuration * zoomLevel
  const phaseColor = hasConflict ? '#ef4444' : (PHASE_COLORS[task.name] ?? '#6b7280')
  const tooltipText = `${projectName} – ${task.name} | Týden ${task.plannedStartWeek} → ${
    task.plannedStartWeek + task.plannedDuration - 1
  } | ${task.plannedDuration} týdnů | ${Math.round(task.percentComplete * 100)}%`

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        className="gantt-bar"
        style={{
          left: `${left}px`,
          width: `${Math.max(width, 4)}px`,
          background: hasConflict ? 'rgba(239,68,68,0.22)' : `${phaseColor}33`,
          border: `${hasConflict ? '2px' : '1px'} solid ${hasConflict ? '#ef4444' : phaseColor}`,
          boxShadow: hasConflict ? '0 0 10px rgba(239,68,68,0.55), inset 0 0 8px rgba(239,68,68,0.1)' : undefined,
          transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
          userSelect: 'none',
          height: '26px',
          top: '7px',
          borderRadius: '4px',
          position: 'absolute',
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
            width: '5px',
            height: '100%',
            cursor: 'col-resize',
            zIndex: 2,
          }}
          onMouseDown={(e) =>
            handleMouseDown(e, task, 'resize-left', { type: 'task', id: task.id })
          }
        />

        {/* Progress fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${task.percentComplete * 100}%`,
            height: '100%',
            background: phaseColor,
            borderRadius: '3px',
            opacity: 0.4,
          }}
        />

        {/* Drag area */}
        <div
          style={{
            position: 'absolute',
            left: '5px',
            right: '5px',
            top: 0,
            height: '100%',
            cursor: 'grab',
            zIndex: 1,
          }}
          onMouseDown={(e) =>
            handleMouseDown(e, task, 'move', { type: 'task', id: task.id })
          }
        />

        {/* Right resize handle */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '5px',
            height: '100%',
            cursor: 'col-resize',
            zIndex: 2,
          }}
          onMouseDown={(e) =>
            handleMouseDown(e, task, 'resize-right', { type: 'task', id: task.id })
          }
        />

        {/* Label */}
        {width > 40 && (
          <div
            style={{
              position: 'absolute',
              left: '6px',
              right: hasConflict ? '18px' : '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '9px',
              color: 'rgba(255,255,255,0.85)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            {task.name}
          </div>
        )}

        {/* Conflict badge */}
        {hasConflict && (
          <div
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ef4444',
              borderRadius: '3px',
              width: '12px',
              height: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              zIndex: 4,
              pointerEvents: 'none',
            }}
          >
            ⚠
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            top: '-36px',
            left: `${left}px`,
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
