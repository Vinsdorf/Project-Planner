'use client'
import { useState, useRef, useEffect } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { useResourceStore } from '@/stores/resourceStore'
import type { ProjectTask } from '@/types'

const PHASE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  Zadání: { bg: 'rgba(99,102,241,0.2)', text: '#a5b4fc' },
  Analýza: { bg: 'rgba(139,92,246,0.2)', text: '#c4b5fd' },
  Vývoj: { bg: 'rgba(59,130,246,0.2)', text: '#93c5fd' },
  Test: { bg: 'rgba(245,158,11,0.2)', text: '#fcd34d' },
  Release: { bg: 'rgba(34,197,94,0.2)', text: '#86efac' },
}

interface TaskSubRowProps {
  task: ProjectTask
  height: number
}

interface AssigneePickerProps {
  assignees: string[]
  allNames: string[]
  onChange: (assignees: string[]) => void
}

function AssigneePicker({ assignees, allNames, onChange }: AssigneePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toggle = (name: string) => {
    if (assignees.includes(name)) {
      onChange(assignees.filter((a) => a !== name))
    } else {
      onChange([...assignees, name])
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '11px',
          padding: 0,
          width: '100%',
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {assignees.length === 0 ? (
          <span style={{ color: '#4b5563' }}>—</span>
        ) : (
          <span style={{ color: '#93c5fd' }}>
            {assignees.length <= 2
              ? assignees.join(', ')
              : `${assignees[0]} +${assignees.length - 1}`}
          </span>
        )}
      </button>
      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: '#222535',
              border: '1px solid #2a2d37',
              borderRadius: '6px',
              zIndex: 50,
              minWidth: '140px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {allNames.map((name) => {
              const selected = assignees.includes(name)
              return (
                <button
                  key={name}
                  onClick={() => toggle(name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '7px 12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    color: selected ? '#3b82f6' : '#e8eaf6',
                    background: selected ? 'rgba(59,130,246,0.1)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '2px',
                      border: `1px solid ${selected ? '#3b82f6' : '#4b5563'}`,
                      background: selected ? '#3b82f6' : 'transparent',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: 'white',
                    }}
                  >
                    {selected ? '✓' : ''}
                  </span>
                  {name}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

interface InlineTextProps {
  value: string
  onSave: (v: string) => void
  style?: React.CSSProperties
}

function InlineText({ value, onSave, style }: InlineTextProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false)
          if (draft !== value) onSave(draft)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setEditing(false)
            if (draft !== value) onSave(draft)
          }
          if (e.key === 'Escape') {
            setEditing(false)
            setDraft(value)
          }
        }}
        style={{
          background: '#0f1117',
          border: '1px solid #3b82f6',
          borderRadius: '4px',
          color: '#e8eaf6',
          fontSize: 'inherit',
          padding: '2px 6px',
          width: '100%',
          outline: 'none',
          ...style,
        }}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      style={{
        cursor: 'text',
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {value || <span style={{ color: '#4b5563' }}>—</span>}
    </span>
  )
}

export function TaskSubRow({ task, height }: TaskSubRowProps) {
  const updateTask = useProjectStore((s) => s.updateTask)
  const deleteTask = useProjectStore((s) => s.deleteTask)
  const resources = useResourceStore((s) => s.resources)
  const allNames = resources.filter((r) => r.isActive).map((r) => r.name)

  const phaseBadge = PHASE_BADGE_COLORS[task.name] ?? { bg: 'rgba(107,114,128,0.2)', text: '#9ca3af' }

  const cellStyle: React.CSSProperties = {
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    fontSize: '11px',
    color: '#cbd5e1',
    overflow: 'hidden',
    flexShrink: 0,
  }

  return (
    <div
      style={{
        display: 'flex',
        height: `${height}px`,
        borderBottom: '1px solid #1a1d2e',
        background: '#1f2235',
        borderLeft: '2px solid #3b82f6',
        position: 'relative',
      }}
    >
      {/* Toggle column placeholder (24px) */}
      <div style={{ width: '24px', flexShrink: 0 }} />

      {/* NÁZEV — indented 24px, width 256px (280 - 24) */}
      <div style={{ ...cellStyle, width: '256px', gap: '4px' }}>
        <InlineText
          value={task.name}
          onSave={(v) => updateTask(task.id, { name: v })}
          style={{ flex: 1, minWidth: 0, fontSize: '11px', color: '#cbd5e1' }}
        />
      </div>

      {/* TÝM — 120px, inherited/read-only */}
      <div style={{ ...cellStyle, width: '120px' }}>
        <span style={{ color: '#4b5563', fontSize: '10px' }}>—</span>
      </div>

      {/* ŘEŠITEL — 120px, multi-select */}
      <div style={{ ...cellStyle, width: '120px' }}>
        <AssigneePicker
          assignees={task.assignees}
          allNames={allNames}
          onChange={(a) => updateTask(task.id, { assignees: a })}
        />
      </div>

      {/* FÁZE — 110px, phase badge */}
      <div style={{ ...cellStyle, width: '110px' }}>
        <span
          style={{
            background: phaseBadge.bg,
            color: phaseBadge.text,
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {task.name}
        </span>
      </div>

      {/* STATUS — 80px, empty for tasks */}
      <div style={{ ...cellStyle, width: '80px', justifyContent: 'center' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background:
              task.percentComplete >= 1
                ? '#22c55e'
                : task.percentComplete > 0
                  ? '#f59e0b'
                  : '#4b5563',
            display: 'block',
          }}
        />
      </div>

      {/* PRIORITA — 90px, empty */}
      <div style={{ ...cellStyle, width: '90px' }} />

      {/* % — 50px */}
      <div style={{ ...cellStyle, width: '50px', justifyContent: 'center' }}>
        <InlineText
          value={String(Math.round(task.percentComplete * 100))}
          onSave={(v) => {
            const num = parseInt(v, 10)
            if (!isNaN(num)) {
              updateTask(task.id, {
                percentComplete: Math.max(0, Math.min(100, num)) / 100,
              })
            }
          }}
          style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', width: '40px' }}
        />
      </div>

      {/* Delete task button */}
      <button
        onClick={() => deleteTask(task.id)}
        style={{
          position: 'absolute',
          right: '4px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          color: '#4b5563',
          cursor: 'pointer',
          fontSize: '11px',
          padding: '2px 4px',
          borderRadius: '3px',
          lineHeight: 1,
        }}
        title="Smazat fázi"
      >
        ×
      </button>
    </div>
  )
}
