'use client'
import { forwardRef } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { TaskRow } from './TaskRow'
import { TaskSubRow } from './TaskSubRow'

const ROW_HEIGHT = 40

const COLUMNS = [
  { label: 'NÁZEV', width: 280 },
  { label: 'TÝM', width: 120 },
  { label: 'ŘEŠITEL', width: 120 },
  { label: 'FÁZE', width: 110 },
  { label: 'STATUS', width: 80 },
  { label: 'PRIORITA', width: 90 },
  { label: '%', width: 50 },
]

const PHASE_OPTIONS = ['Zadání', 'Analýza', 'Vývoj', 'Test', 'Release']

interface TaskTableProps {
  onAddProject: () => void
}

const TaskTable = forwardRef<HTMLDivElement, TaskTableProps>(
  ({ onAddProject }, ref) => {
    const getFilteredProjects = useProjectStore((s) => s.getFilteredProjects)
    const projects = getFilteredProjects()
    const getTasksForProject = useProjectStore((s) => s.getTasksForProject)
    const isExpanded = useProjectStore((s) => s.isExpanded)
    const addTask = useProjectStore((s) => s.addTask)

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      height: '36px',
      background: '#222535',
      borderBottom: '1px solid #2a2d37',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      flexShrink: 0,
    }

    const headerCellStyle: React.CSSProperties = {
      padding: '0 8px',
      display: 'flex',
      alignItems: 'center',
      fontSize: '11px',
      fontWeight: 600,
      color: '#6b7280',
      letterSpacing: '0.05em',
      flexShrink: 0,
    }

    return (
      <div
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#0f1117',
        }}
      >
        {/* Header */}
        <div style={headerStyle}>
          {COLUMNS.map((col, i) => (
            <div
              key={col.label}
              style={{
                ...headerCellStyle,
                width: col.width,
                // first column accounts for expand toggle (24px) inside
                paddingLeft: i === 0 ? '32px' : '8px',
              }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ flex: 1 }}>
          {projects.map((project) => {
            const tasks = getTasksForProject(project.id)
            const expanded = isExpanded(project.id)

            return (
              <div key={project.id}>
                <TaskRow
                  project={project}
                  height={ROW_HEIGHT}
                  hasTasks={tasks.length > 0}
                />
                {expanded && (
                  <>
                    {tasks.map((task) => (
                      <TaskSubRow key={task.id} task={task} height={ROW_HEIGHT} />
                    ))}

                    {/* Add phase button */}
                    <div
                      style={{
                        display: 'flex',
                        height: '32px',
                        background: '#1a1d2e',
                        borderBottom: '1px solid #1e2130',
                        borderLeft: '2px solid #3b82f6',
                        alignItems: 'center',
                        paddingLeft: '32px',
                        gap: '4px',
                      }}
                    >
                      {PHASE_OPTIONS.map((phaseName) => {
                        const exists = tasks.some((t) => t.name === phaseName)
                        return (
                          <button
                            key={phaseName}
                            disabled={exists}
                            onClick={() => {
                              const lastTask = tasks[tasks.length - 1]
                              const newStart = lastTask
                                ? lastTask.plannedStartWeek + lastTask.plannedDuration
                                : project.plannedStartWeek
                              addTask({
                                projectId: project.id,
                                name: phaseName,
                                assignees: [],
                                plannedStartWeek: newStart,
                                plannedDuration: 2,
                                percentComplete: 0,
                                sortOrder: tasks.length,
                              })
                            }}
                            style={{
                              background: exists
                                ? 'rgba(59,130,246,0.05)'
                                : 'rgba(59,130,246,0.15)',
                              border: `1px solid ${exists ? '#1e3a5f' : '#3b82f6'}`,
                              borderRadius: '4px',
                              color: exists ? '#1e3a5f' : '#60a5fa',
                              cursor: exists ? 'default' : 'pointer',
                              fontSize: '10px',
                              padding: '2px 6px',
                              opacity: exists ? 0.4 : 1,
                            }}
                          >
                            + {phaseName}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Add project button */}
        <button
          onClick={onAddProject}
          style={{
            margin: '8px',
            padding: '8px',
            background: 'transparent',
            border: '1px dashed #2a2d37',
            borderRadius: '6px',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '13px',
            textAlign: 'left',
          }}
        >
          + Přidat projekt
        </button>
      </div>
    )
  }
)

TaskTable.displayName = 'TaskTable'

export { TaskTable, ROW_HEIGHT }
