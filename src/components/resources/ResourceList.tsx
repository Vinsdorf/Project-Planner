'use client'
import { useState } from 'react'
import { useResourceStore } from '@/stores/resourceStore'
import { ResourceCard } from './ResourceCard'
import { TEAMS } from '@/lib/defaults'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#06b6d4', '#a855f7', '#ef4444']

const hdr: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700, color: '#4b5563',
  letterSpacing: '0.06em', padding: '0 4px',
}

export function ResourceList() {
  const resources = useResourceStore((s) => s.resources)
  const addResource = useResourceStore((s) => s.addResource)

  const [newName, setNewName] = useState('')

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    addResource({
      name,
      role: '',
      team: TEAMS[0],
      color: COLORS[resources.length % COLORS.length],
      capacityHoursPerDay: 8,
      isActive: true,
    })
    setNewName('')
  }

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '15px', color: '#9ca3af', fontWeight: 600 }}>
          Zdroje ({resources.length})
        </h2>
      </div>

      {/* Table header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', height: '28px',
        padding: '0 8px', background: '#141620', borderBottom: '1px solid #252836',
        position: 'sticky', top: 0, zIndex: 5,
      }}>
        <div style={{ ...hdr, width: '28px' }} />
        <div style={{ ...hdr, width: '140px' }}>JMÉNO</div>
        <div style={{ ...hdr, width: '110px' }}>ROLE</div>
        <div style={{ ...hdr, width: '130px' }}>TÝM</div>
        <div style={{ ...hdr, width: '52px', textAlign: 'center' }}>KAPAC.</div>
        <div style={{ ...hdr, marginLeft: 'auto' }}>STAV</div>
      </div>

      {/* Rows */}
      <div>
        {resources.map((r) => (
          <ResourceCard key={r.id} resource={r} />
        ))}
      </div>

      {/* Add row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderTop: '1px dashed #1e2130', marginTop: '4px' }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          placeholder="Jméno nového zdroje..."
          style={{
            flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid #2a2d37',
            color: '#e8eaf6', fontSize: '13px', padding: '4px 4px', outline: 'none',
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: '5px 14px', fontSize: '12px', background: 'rgba(59,130,246,0.15)',
            color: '#60a5fa', border: '1px solid rgba(59,130,246,0.35)', borderRadius: '6px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.25)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.15)' }}
        >
          + Přidat
        </button>
      </div>
    </div>
  )
}
