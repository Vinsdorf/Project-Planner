'use client'
import { forwardRef } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { TaskRow } from './TaskRow'

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

interface TaskTableProps {
  onAddProject: () => void
}

const TaskTable = forwardRef<HTMLDivElement, TaskTableProps>(
  ({ onAddProject }, ref) => {
    const getFilteredProjects = useProjectStore((s) => s.getFilteredProjects)
    const projects = getFilteredProjects()

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
          {COLUMNS.map((col) => (
            <div
              key={col.label}
              style={{ ...headerCellStyle, width: col.width }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ flex: 1 }}>
          {projects.map((project) => (
            <TaskRow key={project.id} project={project} height={ROW_HEIGHT} />
          ))}
        </div>

        {/* Add button */}
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
