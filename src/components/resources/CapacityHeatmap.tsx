'use client'
import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { useResourceStore } from '@/stores/resourceStore'
import { useUIStore } from '@/stores/uiStore'
import { calculateConflicts, getHeatmapColor } from '@/lib/capacity'
import { getWeeksInYear } from '@/lib/weekUtils'
import { CURRENT_YEAR } from '@/lib/defaults'

const CELL_W = 16
const CELL_H = 28
const LABEL_W = 100

export function CapacityHeatmap() {
  const projects = useProjectStore((s) => s.projects)
  const tasks = useProjectStore((s) => s.tasks)
  const resources = useResourceStore((s) => s.resources)
  const zoomLevel = useUIStore((s) => s.zoomLevel)
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    text: string
  } | null>(null)

  const activeResources = resources.filter((r) => r.isActive)
  const { heatmapData } = calculateConflicts(projects, tasks)
  const totalWeeks = getWeeksInYear(CURRENT_YEAR)
  const cellWidth = Math.max(CELL_W, zoomLevel / 2)

  return (
    <div style={{ padding: '16px', flex: 1, overflow: 'auto' }}>
      <h2 style={{ margin: '0 0 12px', fontSize: '15px', color: '#9ca3af', fontWeight: 600 }}>
        Kapacitní heatmapa
      </h2>

      <div style={{ overflowX: 'auto' }}>
        {/* Header row — week numbers */}
        <div style={{ display: 'flex', marginLeft: `${LABEL_W}px`, marginBottom: '2px' }}>
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
            <div
              key={w}
              style={{
                width: `${cellWidth}px`,
                flexShrink: 0,
                fontSize: '9px',
                color: '#4b5563',
                textAlign: 'center',
              }}
            >
              {w % 4 === 1 ? w : ''}
            </div>
          ))}
        </div>

        {/* Resource rows */}
        {activeResources.map((resource) => {
          const weekMap = heatmapData.get(resource.name) ?? new Map()

          return (
            <div
              key={resource.id}
              style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}
            >
              {/* Name label */}
              <div
                style={{
                  width: `${LABEL_W}px`,
                  flexShrink: 0,
                  fontSize: '12px',
                  color: '#9ca3af',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: resource.color,
                    flexShrink: 0,
                  }}
                />
                {resource.name}
              </div>

              {/* Week cells */}
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => {
                const projectsInWeek = weekMap.get(w) ?? []
                const count = projectsInWeek.length
                const bg = getHeatmapColor(count)
                const isConflict = count >= 2

                return (
                  <div
                    key={w}
                    style={{
                      width: `${cellWidth}px`,
                      height: `${CELL_H}px`,
                      flexShrink: 0,
                      background: bg,
                      border: '1px solid rgba(255,255,255,0.02)',
                      borderRadius: '2px',
                      cursor: count > 0 ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                    }}
                    onMouseEnter={(e) => {
                      if (count > 0) {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltip({
                          x: rect.left,
                          y: rect.top,
                          text: `T${w}: ${projectsInWeek.join(', ')}`,
                        })
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {isConflict && cellWidth > 14 ? '⚠' : ''}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            top: `${tooltip.y - 32}px`,
            left: `${tooltip.x}px`,
            background: '#111827',
            color: '#e8eaf6',
            fontSize: '11px',
            padding: '4px 8px',
            borderRadius: '6px',
            zIndex: 1000,
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            border: '1px solid #2a2d37',
            pointerEvents: 'none',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '11px', color: '#6b7280' }}>
        {[
          { color: 'transparent', label: '0 úkolů', border: '1px solid #2a2d37' },
          { color: 'rgba(34,197,94,0.6)', label: '1 úkol', border: 'none' },
          { color: 'rgba(234,179,8,0.7)', label: '2 úkoly', border: 'none' },
          { color: 'rgba(239,68,68,0.8)', label: '3+ konflikt', border: 'none' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                background: item.color,
                border: item.border,
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
