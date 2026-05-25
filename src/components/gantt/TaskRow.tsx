'use client'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { InlineCell } from './InlineCell'
import { TrafficLightDots } from './TrafficLightDots'
import { TEAMS, PHASES, PRIORITIES } from '@/lib/defaults'
import type { Project, TrafficLight } from '@/types'

const PRIORITY_COLORS: Record<string, string> = {
  Highest: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#3b82f6',
  Lowest: '#6b7280',
}

interface TaskRowProps {
  project: Project
  height: number
  hasTasks?: boolean
}

export function TaskRow({ project, height, hasTasks = false }: TaskRowProps) {
  const updateProject = useProjectStore((s) => s.updateProject)
  const setSelectedProject = useUIStore((s) => s.setSelectedProject)
  const selectedId = useUIStore((s) => s.selectedProjectId)
  const isSelected = selectedId === project.id
  const isExpanded = useProjectStore((s) => s.isExpanded)
  const toggleExpanded = useProjectStore((s) => s.toggleExpanded)
  const expanded = isExpanded(project.id)

  const cellStyle: React.CSSProperties = {
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    fontSize: '12px',
    color: '#e8eaf6',
    overflow: 'hidden',
    flexShrink: 0,
  }

  const handleTLChange = (
    field: 'statusOverall' | 'statusScope' | 'statusTime' | 'statusBudget',
    value: TrafficLight
  ) => {
    updateProject(project.id, { [field]: value })
  }

  const assigneeDisplay =
    project.assignees.length === 0
      ? '—'
      : project.assignees.length <= 2
        ? project.assignees.join(', ')
        : `${project.assignees[0]}, ${project.assignees[1]} +${project.assignees.length - 2}`

  return (
    <div
      onClick={() => setSelectedProject(project.id)}
      style={{
        display: 'flex',
        height: `${height}px`,
        borderBottom: '1px solid #1e2130',
        background: isSelected ? 'rgba(59,130,246,0.08)' : 'transparent',
        borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
    >
      {/* NÁZEV — includes expand toggle (24px) + drag handle + name */}
      <div style={{ ...cellStyle, width: '280px', gap: '4px' }}>
        {/* Expand/collapse toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleExpanded(project.id)
          }}
          style={{
            width: '20px',
            height: '20px',
            flexShrink: 0,
            background: 'transparent',
            border: 'none',
            color: hasTasks ? '#6b7280' : '#2a2d37',
            cursor: hasTasks ? 'pointer' : 'default',
            fontSize: '10px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '3px',
          }}
          title={expanded ? 'Sbalit' : 'Rozbalit'}
        >
          {hasTasks ? (expanded ? '▼' : '►') : ''}
        </button>
        <span
          style={{ color: '#4b5563', fontSize: '10px', cursor: 'grab', flexShrink: 0 }}
        >
          ⠿
        </span>
        <InlineCell
          value={project.name}
          onSave={(v) => updateProject(project.id, { name: v })}
          style={{ flex: 1, minWidth: 0 }}
        />
      </div>

      {/* TÝM */}
      <div style={{ ...cellStyle, width: '120px' }}>
        <InlineCell
          value={project.team}
          onSave={(v) => updateProject(project.id, { team: v })}
          options={TEAMS}
          style={{ width: '100%', fontSize: '12px' }}
        />
      </div>

      {/* ŘEŠITEL */}
      <div
        style={{
          ...cellStyle,
          width: '120px',
          fontSize: '11px',
          color: '#9ca3af',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {assigneeDisplay}
      </div>

      {/* FÁZE */}
      <div style={{ ...cellStyle, width: '110px' }}>
        <InlineCell
          value={project.phase}
          onSave={(v) => updateProject(project.id, { phase: v as Project['phase'] })}
          options={PHASES}
          style={{ width: '100%', fontSize: '11px' }}
        />
      </div>

      {/* STATUS */}
      <div style={{ ...cellStyle, width: '80px', justifyContent: 'center' }}>
        <TrafficLightDots
          overall={project.statusOverall}
          scope={project.statusScope}
          time={project.statusTime}
          budget={project.statusBudget}
          onChange={handleTLChange}
        />
      </div>

      {/* PRIORITA */}
      <div style={{ ...cellStyle, width: '90px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <InlineCell
            value={project.priority}
            onSave={(v) =>
              updateProject(project.id, { priority: v as Project['priority'] })
            }
            options={PRIORITIES}
            style={{
              fontSize: '11px',
              color: PRIORITY_COLORS[project.priority] ?? '#9ca3af',
              fontWeight: 500,
            }}
          />
        </div>
      </div>

      {/* % */}
      <div style={{ ...cellStyle, width: '50px', justifyContent: 'center' }}>
        <InlineCell
          value={String(Math.round(project.percentComplete * 100))}
          onSave={(v) => {
            const num = parseInt(v, 10)
            if (!isNaN(num)) {
              updateProject(project.id, {
                percentComplete: Math.max(0, Math.min(100, num)) / 100,
              })
            }
          }}
          type="number"
          style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}
        />
      </div>
    </div>
  )
}
