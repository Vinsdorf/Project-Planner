'use client'
import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { TEAMS, PHASES, PRIORITIES } from '@/lib/defaults'

export function FilterBar() {
  const filters = useProjectStore((s) => s.filters)
  const setFilter = useProjectStore((s) => s.setFilter)
  const projects = useProjectStore((s) => s.projects)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const allAssignees = Array.from(
    new Set(projects.flatMap((p) => p.assignees))
  ).sort()

  const filterDefs = [
    { key: 'team' as const, label: 'Tým', options: TEAMS },
    { key: 'phase' as const, label: 'Fáze', options: PHASES },
    { key: 'priority' as const, label: 'Priorita', options: PRIORITIES },
    { key: 'assignee' as const, label: 'Řešitel', options: allAssignees },
  ]

  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: '#1a1d27',
        borderBottom: '1px solid #2a2d37',
        flexWrap: 'wrap',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '12px', color: '#6b7280', marginRight: '4px' }}>
        Filtr:
      </span>

      {filterDefs.map((f) => (
        <div key={f.key} style={{ position: 'relative' }}>
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === f.key ? null : f.key)
            }
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              background: filters[f.key] ? '#1d4ed8' : '#222535',
              color: filters[f.key] ? 'white' : '#9ca3af',
              border: `1px solid ${filters[f.key] ? '#3b82f6' : '#2a2d37'}`,
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {filters[f.key] ? `${f.label}: ${filters[f.key]}` : f.label}
            {filters[f.key] && (
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  setFilter(f.key, '')
                  setOpenDropdown(null)
                }}
                style={{ marginLeft: '2px', opacity: 0.8 }}
              >
                ×
              </span>
            )}
          </button>

          {openDropdown === f.key && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                background: '#222535',
                border: '1px solid #2a2d37',
                borderRadius: '8px',
                minWidth: '160px',
                zIndex: 100,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              <button
                onClick={() => {
                  setFilter(f.key, '')
                  setOpenDropdown(null)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: '#6b7280',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Vše
              </button>
              {f.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setFilter(f.key, opt)
                    setOpenDropdown(null)
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: filters[f.key] === opt ? '#3b82f6' : '#e8eaf6',
                    background:
                      filters[f.key] === opt
                        ? 'rgba(59,130,246,0.1)'
                        : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {activeCount > 0 && (
        <button
          onClick={() => {
            setFilter('team', '')
            setFilter('phase', '')
            setFilter('priority', '')
            setFilter('assignee', '')
          }}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            background: 'transparent',
            color: '#ef4444',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Vymazat vše ({activeCount})
        </button>
      )}
    </div>
  )
}
