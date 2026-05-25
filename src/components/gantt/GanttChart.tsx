'use client'
import { forwardRef } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { GanttTimeline } from './GanttTimeline'
import { GanttBar } from './GanttBar'
import { GanttGrid } from './GanttGrid'
import { GanttTodayLine } from './GanttTodayLine'
import { GanttZoomControls } from './GanttZoomControls'
import { getWeeksInYear } from '@/lib/weekUtils'
import { CURRENT_YEAR } from '@/lib/defaults'

const ROW_HEIGHT = 36  // matches ExcelTable ROW_H
const HEADER_HEIGHT = 32 // matches ExcelTable header

interface GanttChartProps {
  onScrollLeft?: (x: number) => void
}

const GanttChart = forwardRef<HTMLDivElement, GanttChartProps>(
  ({ onScrollLeft }, ref) => {
    const getFilteredProjects = useProjectStore((s) => s.getFilteredProjects)
    const projects = getFilteredProjects()
    const getTasksForProject = useProjectStore((s) => s.getTasksForProject)
    const isExpanded = useProjectStore((s) => s.isExpanded)
    const zoomLevel = useUIStore((s) => s.zoomLevel)
    const slotConflicts = useUIStore((s) => s.slotConflicts)
    const totalWeeks = getWeeksInYear(CURRENT_YEAR)
    const totalWidth = totalWeeks * zoomLevel

    // Build all rows in order: project row, then (if expanded) task rows
    const rows: Array<
      | { kind: 'project'; projectId: string; rowIndex: number }
      | { kind: 'task'; taskId: string; projectId: string; rowIndex: number }
    > = []
    let rowIndex = 0
    for (const project of projects) {
      rows.push({ kind: 'project', projectId: project.id, rowIndex })
      rowIndex++
      if (isExpanded(project.id)) {
        const tasks = getTasksForProject(project.id)
        for (const task of tasks) {
          rows.push({ kind: 'task', taskId: task.id, projectId: project.id, rowIndex })
          rowIndex++
        }
      }
    }

    const bodyHeight = Math.max(rows.length * ROW_HEIGHT + 48, 200)

    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          background: '#0f1117',
        }}
      >
        {/* Zoom controls */}
        <GanttZoomControls />

        {/* Scrollable area */}
        <div
          ref={ref}
          onScroll={(e) => {
            onScrollLeft?.(e.currentTarget.scrollLeft)
          }}
          style={{
            flex: 1,
            overflowX: 'auto',
            overflowY: 'auto',
          }}
        >
          <div style={{ width: `${totalWidth}px`, minHeight: '100%' }}>
            {/* Timeline header */}
            <GanttTimeline zoomLevel={zoomLevel} />

            {/* Body */}
            <div
              style={{
                position: 'relative',
                width: `${totalWidth}px`,
                height: `${bodyHeight}px`,
              }}
            >
              <GanttGrid zoomLevel={zoomLevel} totalHeight={bodyHeight} />
              <GanttTodayLine zoomLevel={zoomLevel} totalHeight={bodyHeight} />

              {/* Bars */}
              {rows.map((row) => {
                if (row.kind === 'project') {
                  const project = projects.find((p) => p.id === row.projectId)
                  if (!project) return null
                  const tasks = getTasksForProject(project.id)
                  const hasTasks = tasks.length > 0
                  const expanded = isExpanded(project.id)
                  // For summary bar: compute min start and max end from tasks
                  let summaryProject = project
                  if (hasTasks && expanded) {
                    const minStart = Math.min(...tasks.map((t) => t.plannedStartWeek))
                    const maxEnd = Math.max(
                      ...tasks.map((t) => t.plannedStartWeek + t.plannedDuration - 1)
                    )
                    summaryProject = {
                      ...project,
                      plannedStartWeek: minStart,
                      plannedDuration: maxEnd - minStart + 1,
                    }
                  }
                  const hasConflict = slotConflicts.has(`project-${project.id}`)
                  return (
                    <div
                      key={`project-${project.id}`}
                      style={{
                        position: 'absolute',
                        top: `${row.rowIndex * ROW_HEIGHT}px`,
                        left: 0,
                        width: '100%',
                        height: `${ROW_HEIGHT}px`,
                      }}
                    >
                      <GanttBar
                        mode="project"
                        project={summaryProject}
                        zoomLevel={zoomLevel}
                        hasConflict={hasConflict}
                        isSummary={hasTasks && expanded}
                      />
                    </div>
                  )
                } else {
                  // task row
                  const project = projects.find((p) => p.id === row.projectId)
                  const tasks = project ? getTasksForProject(project.id) : []
                  const task = tasks.find((t) => t.id === row.taskId)
                  if (!task || !project) return null
                  const hasConflict = slotConflicts.has(`task-${task.id}`)
                  return (
                    <div
                      key={`task-${task.id}`}
                      style={{
                        position: 'absolute',
                        top: `${row.rowIndex * ROW_HEIGHT}px`,
                        left: 0,
                        width: '100%',
                        height: `${ROW_HEIGHT}px`,
                        borderLeft: '2px solid rgba(59,130,246,0.3)',
                      }}
                    >
                      <GanttBar
                        mode="task"
                        task={task}
                        projectName={project.name}
                        zoomLevel={zoomLevel}
                        hasConflict={hasConflict}
                      />
                    </div>
                  )
                }
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

GanttChart.displayName = 'GanttChart'

export { GanttChart, ROW_HEIGHT, HEADER_HEIGHT }
