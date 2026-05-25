'use client'
import { useProjectStore } from '@/stores/projectStore'
import { useResourceStore } from '@/stores/resourceStore'
import { calculateConflicts } from '@/lib/capacity'

interface ConflictDialogProps {
  open: boolean
  onClose: () => void
}

export function ConflictDialog({ open, onClose }: ConflictDialogProps) {
  const projects = useProjectStore((s) => s.projects)
  const tasks = useProjectStore((s) => s.tasks)

  if (!open) return null

  const { heatmapData } = calculateConflicts(projects, tasks)
  const conflictEntries: Array<{ resource: string; week: number; projects: string[] }> = []

  for (const [resourceName, weekMap] of heatmapData.entries()) {
    for (const [week, projectNames] of weekMap.entries()) {
      if (projectNames.length >= 2) {
        conflictEntries.push({ resource: resourceName, week, projects: projectNames })
      }
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1d27',
          border: '1px solid #2a2d37',
          borderRadius: '12px',
          padding: '24px',
          width: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#ef4444' }}>
          ⚠ Kapacitní konflikty ({conflictEntries.length})
        </h3>

        {conflictEntries.length === 0 ? (
          <p style={{ color: '#22c55e', fontSize: '14px' }}>Žádné konflikty</p>
        ) : (
          conflictEntries.map((e, i) => (
            <div
              key={i}
              style={{
                padding: '10px',
                borderRadius: '6px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>
                {e.resource} — Týden {e.week}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                {e.projects.join(', ')}
              </div>
            </div>
          ))
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Zavřít
        </button>
      </div>
    </div>
  )
}
