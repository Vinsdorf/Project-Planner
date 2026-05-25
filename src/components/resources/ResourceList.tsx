'use client'
import { useState } from 'react'
import { useResourceStore } from '@/stores/resourceStore'
import { ResourceCard } from './ResourceCard'
import { TEAMS } from '@/lib/defaults'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#06b6d4']

export function ResourceList() {
  const resources = useResourceStore((s) => s.resources)
  const addResource = useResourceStore((s) => s.addResource)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    name: '',
    role: '',
    team: TEAMS[0],
    color: COLORS[0],
    capacityHoursPerDay: 8,
    isActive: true,
  })

  const handleAdd = () => {
    if (!form.name.trim()) return
    addResource(form)
    setForm({ name: '', role: '', team: TEAMS[0], color: COLORS[0], capacityHoursPerDay: 8, isActive: true })
    setAdding(false)
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '15px', color: '#9ca3af', fontWeight: 600 }}>
          Zdroje ({resources.length})
        </h2>
        <button
          onClick={() => setAdding(!adding)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          + Přidat zdroj
        </button>
      </div>

      {adding && (
        <div
          style={{
            background: '#222535',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}
        >
          {(['name', 'role'] as const).map((field) => (
            <input
              key={field}
              placeholder={field === 'name' ? 'Jméno' : 'Role'}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              style={{
                background: '#0f1117',
                border: '1px solid #2a2d37',
                borderRadius: '6px',
                color: '#e8eaf6',
                padding: '7px 10px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          ))}
          <select
            value={form.team}
            onChange={(e) => setForm({ ...form, team: e.target.value })}
            style={{
              background: '#0f1117',
              border: '1px solid #2a2d37',
              borderRadius: '6px',
              color: '#e8eaf6',
              padding: '7px 10px',
              fontSize: '13px',
              outline: 'none',
            }}
          >
            {TEAMS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: c,
                  border: form.color === c ? '2px solid white' : '2px solid transparent',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', gridColumn: '1 / -1' }}>
            <button
              onClick={handleAdd}
              style={{
                padding: '7px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Přidat
            </button>
            <button
              onClick={() => setAdding(false)}
              style={{
                padding: '7px 12px',
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #2a2d37',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {resources.map((r) => (
          <ResourceCard key={r.id} resource={r} />
        ))}
      </div>
    </div>
  )
}
