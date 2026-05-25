'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useUIStore } from '@/stores/uiStore'
import type { Project } from '@/types'

const PRIORITY_COLORS: Record<string, string> = {
  Highest: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#3b82f6',
  Lowest: '#6b7280',
}

interface KanbanCardProps {
  project: Project
}

export function KanbanCard({ project }: KanbanCardProps) {
  const setSelectedProject = useUIStore((s) => s.setSelectedProject)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div
        onClick={() => setSelectedProject(project.id)}
        style={{
          background: '#222535',
          border: '1px solid #2a2d37',
          borderRadius: '8px',
          padding: '10px 12px',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.borderColor = '#3b82f6'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.borderColor = '#2a2d37'
        }}
      >
        {/* Name */}
        <div
          style={{
            fontSize: '13px',
            color: '#e8eaf6',
            fontWeight: 500,
            marginBottom: '8px',
            lineHeight: '1.4',
          }}
        >
          {project.name}
        </div>

        {/* Team badge */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
              background: 'rgba(59,130,246,0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            {project.team}
          </span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              color: PRIORITY_COLORS[project.priority] ?? '#9ca3af',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {project.priority}
          </span>
        </div>

        {/* Assignees */}
        {project.assignees.length > 0 && (
          <div
            style={{
              fontSize: '11px',
              color: '#6b7280',
              marginBottom: '8px',
            }}
          >
            {project.assignees.slice(0, 3).join(', ')}
            {project.assignees.length > 3 && ` +${project.assignees.length - 3}`}
          </div>
        )}

        {/* Progress bar */}
        {project.percentComplete > 0 && (
          <div
            style={{
              height: '3px',
              background: '#1e2130',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${project.percentComplete * 100}%`,
                background: '#22c55e',
                borderRadius: '2px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
