'use client'
import { useState, useRef, useEffect } from 'react'
import { useResourceStore } from '@/stores/resourceStore'
import type { Resource } from '@/types'
import { TEAMS } from '@/lib/defaults'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#06b6d4', '#a855f7', '#ef4444']

// Inline text cell
function InlineText({
  value, placeholder, onCommit, width, fontSize = '12px', color,
}: {
  value: string; placeholder?: string; onCommit: (v: string) => void
  width: number; fontSize?: string; color?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  if (editing) {
    return (
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); if (draft !== value) onCommit(draft) }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); setEditing(false); if (draft !== value) onCommit(draft) }
          if (e.key === 'Escape') { setEditing(false); setDraft(value) }
        }}
        placeholder={placeholder}
        style={{
          width: `${width}px`, background: '#0d0f1a', border: '1px solid #3b82f6',
          borderRadius: '3px', color: '#e8eaf6', fontSize, padding: '2px 5px', outline: 'none',
        }}
      />
    )
  }
  return (
    <div
      onClick={() => setEditing(true)}
      title={value}
      style={{
        width: `${width}px`, cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', fontSize, color: color ?? '#e8eaf6', padding: '2px 0',
      }}
    >
      {value || <span style={{ color: '#3a3d4a' }}>{placeholder ?? '—'}</span>}
    </div>
  )
}

// Inline number cell
function InlineNumber({ value, onCommit, width }: { value: number; onCommit: (v: number) => void; width: number }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { setDraft(String(value)) }, [value])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  const commit = () => {
    setEditing(false)
    const n = parseFloat(draft)
    if (!isNaN(n) && n !== value) onCommit(n)
  }

  if (editing) {
    return (
      <input
        ref={ref}
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); commit() } if (e.key === 'Escape') { setEditing(false); setDraft(String(value)) } }}
        style={{
          width: `${width}px`, background: '#0d0f1a', border: '1px solid #3b82f6',
          borderRadius: '3px', color: '#e8eaf6', fontSize: '12px', padding: '2px 4px',
          outline: 'none', textAlign: 'center',
        }}
      />
    )
  }
  return (
    <div
      onClick={() => setEditing(true)}
      style={{ width: `${width}px`, cursor: 'text', fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '2px 0' }}
    >
      {value}
    </div>
  )
}

// Inline team select
function InlineSelect({ value, options, onCommit, width }: { value: string; options: string[]; onCommit: (v: string) => void; width: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', width: `${width}px` }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          cursor: 'pointer', fontSize: '12px', color: '#9ca3af', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</span>
        <span style={{ color: '#4b5563', fontSize: '8px', flexShrink: 0 }}>▾</span>
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 2px)', left: 0, zIndex: 50,
            background: '#1a1d27', border: '1px solid #2a2d37', borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)', minWidth: '140px', maxHeight: '200px', overflowY: 'auto',
          }}>
            {options.map((opt) => (
              <div
                key={opt}
                onMouseDown={() => { onCommit(opt); setOpen(false) }}
                style={{
                  padding: '6px 12px', fontSize: '12px', cursor: 'pointer',
                  color: opt === value ? '#a5b4fc' : '#e8eaf6',
                  background: opt === value ? 'rgba(99,102,241,0.12)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (opt !== value) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={(e) => { if (opt !== value) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                {opt}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Color picker dot
function ColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: '22px', height: '22px', borderRadius: '50%', background: color,
          cursor: 'pointer', border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: 'white', fontWeight: 700,
        }}
      />
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
            background: '#1a1d27', border: '1px solid #2a2d37', borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)', padding: '8px',
            display: 'flex', flexWrap: 'wrap', gap: '5px', width: '132px',
          }}>
            {COLORS.map((c) => (
              <div
                key={c}
                onMouseDown={() => { onChange(c); setOpen(false) }}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%', background: c, cursor: 'pointer',
                  border: c === color ? '2px solid white' : '2px solid transparent',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const updateResource = useResourceStore((s) => s.updateResource)
  const deleteResource = useResourceStore((s) => s.deleteResource)
  const [hovered, setHovered] = useState(false)

  const up = (patch: Partial<Resource>) => updateResource(resource.id, patch)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', height: '36px',
        padding: '0 8px', borderBottom: '1px solid #1a1d2e',
        background: hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        transition: 'background 0.08s',
      }}
    >
      {/* Color dot + picker */}
      <div style={{ width: '28px', display: 'flex', justifyContent: 'center' }}>
        <ColorPicker color={resource.color} onChange={(c) => up({ color: c })} />
      </div>

      {/* Name */}
      <InlineText value={resource.name} placeholder="Jméno" onCommit={(v) => up({ name: v })} width={140} fontSize="13px" />

      {/* Role */}
      <InlineText value={resource.role ?? ''} placeholder="Role" onCommit={(v) => up({ role: v })} width={110} color="#9ca3af" />

      {/* Team */}
      <InlineSelect value={resource.team} options={TEAMS} onCommit={(v) => up({ team: v })} width={130} />

      {/* Kapacita */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <InlineNumber value={resource.capacityHoursPerDay} onCommit={(v) => up({ capacityHoursPerDay: v })} width={36} />
        <span style={{ fontSize: '10px', color: '#4b5563' }}>h/d</span>
      </div>

      {/* Active toggle */}
      <button
        onClick={() => up({ isActive: !resource.isActive })}
        style={{
          marginLeft: 'auto', padding: '3px 8px', fontSize: '11px', cursor: 'pointer',
          background: resource.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.1)',
          color: resource.isActive ? '#22c55e' : '#6b7280',
          border: `1px solid ${resource.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(107,114,128,0.25)'}`,
          borderRadius: '10px', flexShrink: 0,
        }}
      >
        {resource.isActive ? 'Aktivní' : 'Neaktivní'}
      </button>

      {/* Delete */}
      <button
        onClick={() => { if (confirm(`Smazat ${resource.name}?`)) deleteResource(resource.id) }}
        style={{
          background: 'transparent', border: 'none', color: hovered ? '#6b7280' : 'transparent',
          cursor: 'pointer', fontSize: '14px', padding: '2px 4px', borderRadius: '3px',
          lineHeight: 1, flexShrink: 0, transition: 'color 0.1s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = hovered ? '#6b7280' : 'transparent' }}
      >
        ×
      </button>
    </div>
  )
}
