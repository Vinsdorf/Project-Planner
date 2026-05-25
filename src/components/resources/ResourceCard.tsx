'use client'
import { useResourceStore } from '@/stores/resourceStore'
import type { Resource } from '@/types'

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const updateResource = useResourceStore((s) => s.updateResource)
  const deleteResource = useResourceStore((s) => s.deleteResource)

  return (
    <div
      style={{
        background: '#222535',
        border: '1px solid #2a2d37',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* Color dot */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: resource.color,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 600,
          color: 'white',
        }}
      >
        {resource.name.charAt(0)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#e8eaf6' }}>
          {resource.name}
        </div>
        <div style={{ fontSize: '11px', color: '#6b7280' }}>
          {resource.role} · {resource.team}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button
          onClick={() => updateResource(resource.id, { isActive: !resource.isActive })}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            background: resource.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)',
            color: resource.isActive ? '#22c55e' : '#6b7280',
            border: `1px solid ${resource.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(107,114,128,0.3)'}`,
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          {resource.isActive ? 'Aktivní' : 'Neaktivní'}
        </button>
        <button
          onClick={() => {
            if (confirm(`Smazat ${resource.name}?`)) deleteResource(resource.id)
          }}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            background: 'transparent',
            color: '#4b5563',
            border: '1px solid #2a2d37',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
