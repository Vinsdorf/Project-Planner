'use client'
import { useState } from 'react'
import type { Project, ProjectTask } from '@/types'
import { getBarPosition } from '@/lib/ganttHelpers'
import { addWorkdays, formatDateCZ, parseISODate } from '@/lib/workdays'
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

function formatEndDate(startDateStr: string, md: number): string {
  if (!startDateStr) return ''
  try {
    const start = parseISODate(startDateStr)
    const end = md > 0 ? addWorkdays(start, md - 1) : start
    return formatDateCZ(end)
  } catch {
    return ''
  }
}

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
    const planned = getBarPosition(project.startDate, project.plannedDuration, zoomLevel)
    const done = isDone(project.phase)

    const hasActual = !!(project.actualStartDate || project.actualDuration != null)
    const actualStartStr = project.actualStartDate ?? project.startDate
    const actualDur = project.actualDuration ?? project.plannedDuration
    const actual = hasActual ? getBarPosition(actualStartStr, actualDur, zoomLevel) : null

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

    const endDateStr = formatEndDate(project.startDate, project.plannedDuration)
    const startDateFormatted = project.startDate
      ? formatDateCZ(parseISODate(project.startDate))
      : ''

    const actualEndStr = hasActual ? formatEndDate(actualStartStr ?? '', actualDur) : ''
    const actualStartFormatted = actualStartStr ? formatDateCZ(parseISODate(actualStartStr)) : ''

    const tooltipText = hasActual
      ? `${project.name} | Plán: ${startDateFormatted} → ${endDateStr} (${project.plannedDuration} MD) | Skutečnost: ${actualStartFormatted} → ${actualEndStr} (${actualDur} MD)`
      : `${project.name} | ${startDateFormatted} → ${endDateStr} | ${project.plannedDuration} MD`

    const tooltipLeft = hasActual && actual ? Math.min(planned.left, actual.left) : planned.left

    if (hasActual && actual) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* Thin gray planned bar (background reference) */}
          <div
            style={{
              position: 'absolute',
              left: `${planned.left}px`,
              width: `${Math.max(planned.width, 4)}px`,
              top: '4px',
              height: '6px',
              background: 'rgba(107,114,128,0.15)',
              border: '1px solid rgba(107,114,128,0.35)',
              borderRadius: '3px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Actual bar (main, interactive) */}
          <div
            style={{
              position: 'absolute',
              left: `${actual.left}px`,
              width: `${Math.max(actual.width, 4)}px`,
              top: '14px',
              height: '22px',
              background: barBg,
              border: `${borderWidth} solid ${borderColor}`,
              borderRadius: '6px',
              boxShadow: hasConflict ? '0 0 10px rgba(239,68,68,0.6), inset 0 0 12px rgba(239,68,68,0.1)' : undefined,
              transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
              userSelect: 'none',
              cursor: 'grab',
            }}
            onMouseEnter={() => setTooltip(true)}
            onMouseLeave={() => setTooltip(false)}
          >
            {/* Left resize handle */}
            <div
              style={{ position: 'absolute', left: 0, top: 0, width: '6px', height: '100%', cursor: 'col-resize', zIndex: 2 }}
              onMouseDown={(e) => handleMouseDown(e, project, 'resize-left', { type: 'project', id: project.id, actual: true })}
            />

            {/* Progress fill */}
            {!isSummary && (
              <div
                style={{
                  position: 'absolute', left: 0, top: 0,
                  width: `${project.percentComplete * 100}%`,
                  height: '100%',
                  background: progressBg,
                  borderRadius: '4px',
                  opacity: 0.5,
                }}
              />
            )}

            {/* Drag area */}
            <div
              style={{ position: 'absolute', left: '6px', right: '6px', top: 0, height: '100%', cursor: 'grab', zIndex: 1 }}
              onMouseDown={(e) => handleMouseDown(e, project, 'move', { type: 'project', id: project.id, actual: true })}
            />

            {/* Right resize handle */}
            <div
              style={{ position: 'absolute', right: 0, top: 0, width: '6px', height: '100%', cursor: 'col-resize', zIndex: 2 }}
              onMouseDown={(e) => handleMouseDown(e, project, 'resize-right', { type: 'project', id: project.id, actual: true })}
            />

            {/* Label */}
            {actual.width > 60 && (
              <div
                style={{
                  position: 'absolute', left: '8px', right: hasConflict ? '20px' : '8px',
                  top: '50%', transform: 'translateY(-50%)',
                  fontSize: '10px', color: 'rgba(255,255,255,0.8)',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  pointerEvents: 'none', zIndex: 3,
                }}
              >
                {project.name}
              </div>
            )}

            {/* Conflict badge */}
            {hasConflict && (
              <div
                style={{
                  position: 'absolute', top: '2px', right: '2px',
                  background: '#ef4444', borderRadius: '3px',
                  width: '14px', height: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', zIndex: 4, pointerEvents: 'none',
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
                position: 'absolute', top: '-42px', left: `${tooltipLeft}px`,
                background: '#111827', color: '#e8eaf6', fontSize: '11px',
                padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap',
                zIndex: 200, boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                pointerEvents: 'none', border: '1px solid #2a2d37',
              }}
            >
              {tooltipText}
            </div>
          )}
        </div>
      )
    }

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Standard bar (no actual data) */}
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
  const pos = getBarPosition(task.startDate, task.plannedDuration, zoomLevel)
  const { left, width } = pos
  const phaseColor = hasConflict ? '#ef4444' : (PHASE_COLORS[task.name] ?? '#6b7280')

  const endDateStr = formatEndDate(task.startDate, task.plannedDuration)
  const startDateFormatted = task.startDate
    ? formatDateCZ(parseISODate(task.startDate))
    : ''
  const tooltipText = `${projectName} – ${task.name} | ${startDateFormatted} → ${endDateStr} | ${task.plannedDuration} MD`

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
