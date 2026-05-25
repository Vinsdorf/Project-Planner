'use client'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'
import type { Project, ProjectPhase } from '@/types'

const PHASE_COLORS: Record<string, string> = {
  'Idea': '#6b7280',
  'Čeká na schválení': '#8b5cf6',
  'Zařazeno': '#3b82f6',
  'Rozpracováno': '#f59e0b',
  'Zastaveno': '#ef4444',
  'Hotovo Q1': '#22c55e',
  'Hotovo Q2': '#16a34a',
  'Hotovo Q3': '#15803d',
  'Hotovo Q4': '#14532d',
}

interface KanbanColumnProps {
  phase: ProjectPhase
  projects: Project[]
}

export function KanbanColumn({ phase, projects }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: phase })

  return (
    <div
      style={{
        width: '220px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: isOver ? 'rgba(59,130,246,0.05)' : '#1a1d27',
        border: `1px solid ${isOver ? '#3b82f6' : '#2a2d37'}`,
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #2a2d37',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: PHASE_COLORS[phase] ?? '#6b7280',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#9ca3af',
            flex: 1,
          }}
        >
          {phase}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: '#4b5563',
            background: '#222535',
            padding: '1px 6px',
            borderRadius: '10px',
          }}
        >
          {projects.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          minHeight: '80px',
        }}
      >
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {projects.map((project) => (
            <KanbanCard key={project.id} project={project} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
