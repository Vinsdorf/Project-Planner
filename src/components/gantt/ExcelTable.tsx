'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { useResourceStore } from '@/stores/resourceStore'
import { TrafficLightDots } from './TrafficLightDots'
import type { Project, ProjectTask, TrafficLight } from '@/types'
import { TEAMS } from '@/lib/defaults'
import { formatDateCZ, parseISODate, addWorkdays } from '@/lib/workdays'

export const ROW_H = 36

// ─── visual row type ───────────────────────────────────────────────────────
type VRow =
  | { kind: 'project'; project: Project; expanded: boolean; tasks: ProjectTask[] }
  | { kind: 'task'; task: ProjectTask; projectId: string }

// ─── tiny helpers ─────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}
function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function parsePct(s: string) {
  const n = parseInt(s, 10)
  return isNaN(n) ? 0 : clamp(n, 0, 100) / 100
}
function parseDur(s: string) {
  const n = parseInt(s, 10)
  return isNaN(n) ? 1 : Math.max(1, n)
}

// ─── cell input ────────────────────────────────────────────────────────────
interface CellProps {
  value: string
  onCommit: (v: string) => void
  onTabOut?: () => void
  onEnterOut?: () => void
  type?: 'text' | 'number'
  options?: string[]
  placeholder?: string
  style?: React.CSSProperties
}

function Cell({ value, onCommit, onTabOut, onEnterOut, type = 'text', options, placeholder, style }: CellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [dropOpen, setDropOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setDraft(value) }, [value])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  // close dropdown on outside click
  useEffect(() => {
    if (!dropOpen) return
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropOpen])

  const commit = (v: string) => {
    setEditing(false)
    setDropOpen(false)
    if (v !== value) onCommit(v)
  }

  const baseInput: React.CSSProperties = {
    background: '#0d0f1a',
    border: '1px solid #3b82f6',
    borderRadius: '3px',
    color: '#e8eaf6',
    fontSize: '12px',
    padding: '2px 5px',
    width: '100%',
    outline: 'none',
    ...style,
  }

  if (editing || (options && dropOpen)) {
    return (
      <div ref={dropRef} style={{ position: 'relative', width: '100%' }}>
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(draft); onEnterOut?.() }
            if (e.key === 'Escape') { setEditing(false); setDropOpen(false); setDraft(value) }
            if (e.key === 'Tab') { e.preventDefault(); commit(draft); onTabOut?.() }
          }}
          style={baseInput}
          placeholder={placeholder}
        />
        {options && dropOpen && draft.length === 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 100,
            background: '#1a1d27', border: '1px solid #2a2d37',
            borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            maxHeight: '200px', overflowY: 'auto', minWidth: '120px',
          }}>
            {options.map((opt) => (
              <div
                key={opt}
                onMouseDown={() => { setDraft(opt); commit(opt) }}
                style={{
                  padding: '6px 12px', fontSize: '12px', color: '#e8eaf6',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(59,130,246,0.15)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={() => { setEditing(true); if (options) setDropOpen(true) }}
      title={value}
      style={{
        cursor: 'text', width: '100%', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...style,
      }}
    >
      {value || <span style={{ color: '#3a3d4a' }}>{placeholder ?? '—'}</span>}
    </div>
  )
}

// ─── date cell ────────────────────────────────────────────────────────────
function DateCell({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const display = value ? formatDateCZ(parseISODate(value)) : '—'

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="date"
        value={value}
        min="2026-01-01"
        max="2027-12-31"
        onChange={(e) => { if (e.target.value) onCommit(e.target.value) }}
        onBlur={() => setEditing(false)}
        style={{
          background: '#0d0f1a', border: '1px solid #3b82f6', borderRadius: '3px',
          color: '#e8eaf6', fontSize: '10px', padding: '1px 2px', width: '100%', outline: 'none',
        }}
      />
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      style={{ cursor: 'text', fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%' }}
    >
      {display}
    </div>
  )
}

// ─── single-select owner dropdown (for projects) ──────────────────────────
function OwnerDropdown({ value, options, onChange }: {
  value: string        // single name or ''
  options: string[]
  onChange: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}
      >
        {value
          ? <span style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '3px', padding: '1px 6px', fontSize: '11px', color: '#a5b4fc', whiteSpace: 'nowrap' }}>{value}</span>
          : <span style={{ color: '#3a3d4a', fontSize: '11px' }}>—</span>
        }
        <span style={{ color: '#4b5563', fontSize: '8px', flexShrink: 0 }}>▾</span>
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 2px)', left: 0, zIndex: 50,
            background: '#1a1d27', border: '1px solid #2a2d37', borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)', minWidth: '140px', maxHeight: '220px', overflowY: 'auto',
          }}>
            {/* clear option */}
            <div
              onMouseDown={() => { onChange(''); setOpen(false) }}
              style={{ padding: '6px 12px', fontSize: '11px', color: '#6b7280', cursor: 'pointer', borderBottom: '1px solid #252836' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >— žádný vlastník</div>
            {options.map((name) => (
              <div
                key={name}
                onMouseDown={() => { onChange(name); setOpen(false) }}
                style={{
                  padding: '7px 12px', fontSize: '12px', cursor: 'pointer',
                  color: name === value ? '#a5b4fc' : '#e8eaf6',
                  background: name === value ? 'rgba(99,102,241,0.12)' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
                onMouseEnter={(e) => { if (name !== value) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={(e) => { if (name !== value) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                {name === value && <span style={{ fontSize: '9px' }}>✓</span>}
                {name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── multi-select assignee dropdown (for tasks) ───────────────────────────
function AssigneeDropdown({ assignees, options, onChange }: {
  assignees: string[]
  options: string[]
  onChange: (a: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const toggle = (name: string) =>
    onChange(assignees.includes(name) ? assignees.filter((a) => a !== name) : [...assignees, name])

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', overflow: 'hidden' }}
      >
        {assignees.length === 0
          ? <span style={{ color: '#3a3d4a', fontSize: '11px' }}>—</span>
          : <>
              {assignees.slice(0, 2).map((a) => (
                <span key={a} style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.35)', borderRadius: '3px', padding: '1px 5px', fontSize: '10px', color: '#93c5fd', whiteSpace: 'nowrap' }}>{a}</span>
              ))}
              {assignees.length > 2 && <span style={{ color: '#6b7280', fontSize: '10px' }}>+{assignees.length - 2}</span>}
            </>
        }
        <span style={{ color: '#4b5563', fontSize: '8px', flexShrink: 0, marginLeft: 'auto' }}>▾</span>
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 2px)', left: 0, zIndex: 50,
            background: '#1a1d27', border: '1px solid #2a2d37', borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)', minWidth: '150px', maxHeight: '220px', overflowY: 'auto',
          }}>
            {options.length === 0
              ? <div style={{ padding: '10px 12px', fontSize: '11px', color: '#4b5563' }}>Žádní řešitelé — přidejte je ve Zdrojích</div>
              : options.map((name) => {
                  const sel = assignees.includes(name)
                  return (
                    <div
                      key={name}
                      onMouseDown={() => toggle(name)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '7px 12px', fontSize: '12px', cursor: 'pointer',
                        color: sel ? '#93c5fd' : '#e8eaf6',
                        background: sel ? 'rgba(59,130,246,0.1)' : 'transparent',
                      }}
                      onMouseEnter={(e) => { if (!sel) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={(e) => { if (!sel) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                    >
                      <span style={{
                        width: '13px', height: '13px', borderRadius: '3px', flexShrink: 0,
                        border: `1px solid ${sel ? '#3b82f6' : '#4b5563'}`,
                        background: sel ? '#3b82f6' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '9px', color: 'white',
                      }}>{sel ? '✓' : ''}</span>
                      {name}
                    </div>
                  )
                })
            }
          </div>
        </>
      )}
    </div>
  )
}

// ─── context menu ──────────────────────────────────────────────────────────
interface CtxMenu { x: number; y: number; rowKind: 'project' | 'task'; rowId: string; projectId?: string }

// ─── main component ────────────────────────────────────────────────────────
export function ExcelTable({ tableRef }: { tableRef: React.RefObject<HTMLDivElement | null> }) {
  const {
    projects, tasks,
    addProject, updateProject, deleteProject,
    addTask, updateTask, deleteTask,
    getTasksForProject, isExpanded, toggleExpanded,
  } = useProjectStore()
  const setSelectedProject = useUIStore((s) => s.setSelectedProject)
  const selectedId = useUIStore((s) => s.selectedProjectId)
  const resources = useResourceStore((s) => s.resources)
  const allNames = resources.filter((r) => r.isActive).map((r) => r.name)

  const [ctx, setCtx] = useState<CtxMenu | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // close context menu on outside click
  useEffect(() => {
    if (!ctx) return
    const h = () => setCtx(null)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ctx])

  // build flat list of visual rows
  const rows: VRow[] = []
  const sortedProjects = [...projects].sort((a, b) => a.sortOrder - b.sortOrder)
  for (const project of sortedProjects) {
    const ptasks = getTasksForProject(project.id)
    const expanded = isExpanded(project.id)
    rows.push({ kind: 'project', project, expanded, tasks: ptasks })
    if (expanded) {
      for (const task of ptasks) {
        rows.push({ kind: 'task', task, projectId: project.id })
      }
    }
  }

  const addProjectAfter = useCallback((afterSortOrder?: number) => {
    const newSortOrder = afterSortOrder !== undefined ? afterSortOrder + 1 : projects.length
    const p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      name: '', type: 'Projekt', team: TEAMS[0], assignees: [],
      phase: 'Idea', statusOverall: 'N/A', statusScope: 'N/A',
      statusTime: 'N/A', statusBudget: 'N/A', priority: 'Medium',
      startDate: '2026-01-05', plannedDuration: 10, percentComplete: 0,
      sortOrder: newSortOrder,
    }
    addProject(p)
  }, [projects.length, addProject])

  const addTaskAfter = useCallback((projectId: string, afterSortOrder?: number) => {
    const projectTasks = getTasksForProject(projectId)
    const newSortOrder = afterSortOrder !== undefined ? afterSortOrder + 1 : projectTasks.length
    const lastTask = projectTasks[projectTasks.length - 1]
    const newStart = lastTask && lastTask.startDate
      ? toISODate(addWorkdays(parseISODate(lastTask.startDate), lastTask.plannedDuration))
      : '2026-01-05'
    addTask({
      projectId,
      name: '',
      assignees: [],
      startDate: newStart,
      plannedDuration: 5,
      percentComplete: 0,
      sortOrder: newSortOrder,
    })
    // auto-expand parent
    if (!isExpanded(projectId)) toggleExpanded(projectId)
  }, [getTasksForProject, addTask, isExpanded, toggleExpanded])

  // column widths
  const COL = { expand: 28, name: 210, owner: 130, assignee: 150, status: 80, start: 82, dur: 58, end: 82, pct: 48, actions: 32 }
  const totalW = Object.values(COL).reduce((a, b) => a + b, 0)

  const headerCell: React.CSSProperties = {
    padding: '0 6px', fontSize: '10px', fontWeight: 700, color: '#4b5563',
    letterSpacing: '0.06em', display: 'flex', alignItems: 'center', flexShrink: 0,
  }

  const cell: React.CSSProperties = {
    padding: '0 6px', display: 'flex', alignItems: 'center',
    fontSize: '12px', color: '#e8eaf6', overflow: 'hidden', flexShrink: 0,
  }

  return (
    <div
      ref={tableRef as React.RefObject<HTMLDivElement>}
      style={{ display: 'flex', flexDirection: 'column', background: '#0f1117', userSelect: 'none' }}
    >
      {/* ── header ── */}
      <div style={{
        display: 'flex', height: '32px', background: '#141620',
        borderBottom: '1px solid #252836', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
        minWidth: `${totalW}px`,
      }}>
        <div style={{ ...headerCell, width: COL.expand }} />
        <div style={{ ...headerCell, width: COL.name }}>NÁZEV</div>
        <div style={{ ...headerCell, width: COL.owner }}>VLASTNÍK</div>
        <div style={{ ...headerCell, width: COL.assignee }}>ŘEŠITELÉ</div>
        <div style={{ ...headerCell, width: COL.status, justifyContent: 'center' }}>STATUS</div>
        <div style={{ ...headerCell, width: COL.start, justifyContent: 'center' }}>ZAČÁTEK</div>
        <div style={{ ...headerCell, width: COL.dur, justifyContent: 'center' }}>PRACNOST</div>
        <div style={{ ...headerCell, width: COL.end, justifyContent: 'center' }}>KONEC</div>
        <div style={{ ...headerCell, width: COL.pct, justifyContent: 'center' }}>%</div>
        <div style={{ ...headerCell, width: COL.actions }} />
      </div>

      {/* ── rows ── */}
      <div style={{ minWidth: `${totalW}px` }}>
        {rows.map((row) => {
          const isProject = row.kind === 'project'
          const rowId = isProject ? row.project.id : row.task.id
          const isSelected = isProject && selectedId === row.project.id
          const isHovered = hoveredId === rowId

          // derived values
          const name = isProject ? row.project.name : row.task.name
          // project: assignees[0] = business owner; tasks: assignees = multi
          const ownerName = isProject ? (row.project.assignees[0] ?? '') : ''
          const taskAssignees = !isProject ? row.task.assignees : []
          const startDate = isProject ? row.project.startDate : row.task.startDate
          const duration = isProject ? row.project.plannedDuration : row.task.plannedDuration
          const endDateStr = startDate && duration > 0
            ? formatDateCZ(addWorkdays(parseISODate(startDate), duration - 1))
            : '—'
          const pct = isProject
            ? Math.round(row.project.percentComplete * 100)
            : Math.round(row.task.percentComplete * 100)

          const bg = isProject
            ? isSelected ? 'rgba(59,130,246,0.08)' : isHovered ? 'rgba(255,255,255,0.02)' : 'transparent'
            : isHovered ? '#1d2033' : '#181b2a'

          const leftBorder = isProject
            ? isSelected ? '2px solid #3b82f6' : '2px solid transparent'
            : '2px solid rgba(59,130,246,0.4)'

          // update helpers
          const updateName = (v: string) => isProject
            ? updateProject(row.project.id, { name: v })
            : updateTask(row.task.id, { name: v })

          const updateOwner = (name: string) =>
            updateProject((row as { project: Project }).project.id, { assignees: name ? [name] : [] })

          const updateTaskAssignees = (a: string[]) =>
            updateTask((row as { task: ProjectTask }).task.id, { assignees: a })

          const updateStart = (v: string) => {
            isProject ? updateProject(row.project.id, { startDate: v }) : updateTask(row.task.id, { startDate: v })
          }

          const updateDur = (v: string) => {
            const d = parseDur(v)
            isProject ? updateProject(row.project.id, { plannedDuration: d }) : updateTask(row.task.id, { plannedDuration: d })
          }

          const updatePct = (v: string) => {
            const p = parsePct(v)
            isProject ? updateProject(row.project.id, { percentComplete: p }) : updateTask(row.task.id, { percentComplete: p })
          }

          const handleDelete = () => {
            if (isProject) deleteProject(row.project.id)
            else deleteTask(row.task.id)
          }

          const handleAddBelow = () => {
            if (isProject) {
              addTaskAfter(row.project.id)
            } else {
              addTaskAfter(row.projectId, row.task.sortOrder)
            }
          }

          return (
            <div key={rowId}>
              {/* ── row ── */}
              <div
                onClick={() => { if (isProject) setSelectedProject(row.project.id) }}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setCtx({ x: e.clientX, y: e.clientY, rowKind: row.kind, rowId, projectId: isProject ? row.project.id : row.projectId })
                }}
                onMouseEnter={() => setHoveredId(rowId)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'flex', height: `${ROW_H}px`, background: bg,
                  borderBottom: '1px solid #1a1d2e', borderLeft: leftBorder,
                  cursor: isProject ? 'pointer' : 'default', transition: 'background 0.08s',
                }}
              >
                {/* expand toggle */}
                <div style={{ ...cell, width: COL.expand, justifyContent: 'center' }}>
                  {isProject ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpanded(row.project.id) }}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: row.tasks.length > 0 ? '#6b7280' : '#2a2d37',
                        fontSize: '9px', padding: '3px', borderRadius: '3px', lineHeight: 1,
                      }}
                    >
                      {row.tasks.length > 0 ? (row.expanded ? '▼' : '▶') : '◦'}
                    </button>
                  ) : (
                    <span style={{ color: '#2a3050', fontSize: '9px', paddingLeft: '8px' }}>└</span>
                  )}
                </div>

                {/* NÁZEV */}
                <div style={{ ...cell, width: COL.name, paddingLeft: isProject ? '4px' : '16px', fontWeight: isProject ? 500 : 400, color: isProject ? '#e8eaf6' : '#c0c8e0' }}>
                  <Cell
                    value={name}
                    onCommit={updateName}
                    placeholder={isProject ? 'Název projektu...' : 'Název aktivity...'}
                    style={{ fontSize: isProject ? '12px' : '11px' }}
                  />
                </div>

                {/* VLASTNÍK — single select, projects only */}
                <div style={{ ...cell, width: COL.owner }}>
                  {isProject
                    ? <OwnerDropdown value={ownerName} options={allNames} onChange={updateOwner} />
                    : <span style={{ color: '#252840', fontSize: '11px', paddingLeft: '4px' }}>—</span>
                  }
                </div>

                {/* ŘEŠITELÉ — multi-select, tasks only */}
                <div style={{ ...cell, width: COL.assignee }}>
                  {!isProject
                    ? <AssigneeDropdown assignees={taskAssignees} options={allNames} onChange={updateTaskAssignees} />
                    : <span style={{ color: '#252840', fontSize: '11px', paddingLeft: '4px' }}>—</span>
                  }
                </div>

                {/* STATUS — traffic lights, projects only */}
                <div style={{ ...cell, width: COL.status, justifyContent: 'center' }}>
                  {isProject ? (
                    <TrafficLightDots
                      overall={row.project.statusOverall}
                      scope={row.project.statusScope}
                      time={row.project.statusTime}
                      budget={row.project.statusBudget}
                      onChange={(field, val) => updateProject(row.project.id, { [field]: val as TrafficLight })}
                    />
                  ) : null}
                </div>

                {/* ZAČÁTEK */}
                <div style={{ ...cell, width: COL.start, justifyContent: 'center' }}>
                  <DateCell value={startDate ?? ''} onCommit={updateStart} />
                </div>

                {/* PRACNOST */}
                <div style={{ ...cell, width: COL.dur, justifyContent: 'center', color: '#9ca3af' }}>
                  <Cell value={String(duration)} onCommit={updateDur} type="number" style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px' }} />
                </div>

                {/* KONEC (calculated, read-only) */}
                <div style={{ ...cell, width: COL.end, justifyContent: 'center', color: '#4b5563', fontSize: '11px' }}>
                  {endDateStr}
                </div>

                {/* % */}
                <div style={{ ...cell, width: COL.pct, justifyContent: 'center', color: pct === 100 ? '#22c55e' : pct > 0 ? '#f59e0b' : '#4b5563' }}>
                  <Cell value={String(pct)} onCommit={updatePct} type="number" style={{ textAlign: 'center', fontSize: '12px', color: 'inherit', width: '36px' }} />
                </div>

                {/* action icons */}
                <div style={{ ...cell, width: COL.actions, justifyContent: 'center', opacity: isHovered ? 1 : 0, transition: 'opacity 0.1s' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete() }}
                    title="Smazat"
                    style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '13px', padding: '2px 4px', borderRadius: '3px', lineHeight: 1 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#6b7280' }}
                  >×</button>
                </div>
              </div>

              {/* ── insert row button (appears on hover) ── */}
              {isHovered && (
                <div
                  style={{ height: '16px', display: 'flex', alignItems: 'center', paddingLeft: isProject ? '6px' : '22px', gap: '4px', background: 'transparent', position: 'relative', zIndex: 5 }}
                  onMouseEnter={() => setHoveredId(rowId)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddBelow() }}
                    title={isProject ? 'Přidat aktivitu pod' : 'Přidat aktivitu pod'}
                    style={{
                      background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)',
                      borderRadius: '3px', color: '#60a5fa', cursor: 'pointer',
                      fontSize: '10px', padding: '1px 6px', lineHeight: 1,
                    }}
                  >
                    + aktivita
                  </button>
                  {isProject && (
                    <button
                      onClick={(e) => { e.stopPropagation(); addProjectAfter(row.project.sortOrder) }}
                      title="Přidat projekt pod"
                      style={{
                        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '3px', color: '#a5b4fc', cursor: 'pointer',
                        fontSize: '10px', padding: '1px 6px', lineHeight: 1,
                      }}
                    >
                      + projekt
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* ── add project at bottom ── */}
        <button
          onClick={() => addProjectAfter()}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            width: '100%', padding: '10px 12px', background: 'transparent',
            border: 'none', borderTop: '1px dashed #1e2130',
            color: '#4b5563', cursor: 'pointer', fontSize: '12px',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#4b5563' }}
        >
          <span style={{ fontSize: '14px' }}>+</span> Přidat projekt
        </button>
      </div>

      {/* ── context menu ── */}
      {ctx && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setCtx(null)} />
          <div style={{
            position: 'fixed', top: ctx.y, left: ctx.x, zIndex: 200,
            background: '#1a1d27', border: '1px solid #2a2d37', borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)', padding: '4px', minWidth: '180px',
          }}>
            {[
              {
                label: '+ Přidat aktivitu pod', action: () => {
                  if (ctx.rowKind === 'project') addTaskAfter(ctx.rowId)
                  else if (ctx.projectId) {
                    const t = tasks.find((x) => x.id === ctx.rowId)
                    addTaskAfter(ctx.projectId, t?.sortOrder)
                  }
                }
              },
              ctx.rowKind === 'project' && {
                label: '+ Přidat projekt pod', action: () => {
                  const p = projects.find((x) => x.id === ctx.rowId)
                  addProjectAfter(p?.sortOrder)
                }
              },
              { label: '─', action: null },
              {
                label: '🗑 Smazat řádek', action: () => {
                  ctx.rowKind === 'project' ? deleteProject(ctx.rowId) : deleteTask(ctx.rowId)
                }, danger: true
              },
            ].filter(Boolean).map((item, i) => {
              if (!item || item.label === '─') return (
                <div key={i} style={{ height: '1px', background: '#2a2d37', margin: '3px 0' }} />
              )
              return (
                <button
                  key={i}
                  onClick={() => { item.action?.(); setCtx(null) }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '7px 12px', background: 'transparent', border: 'none',
                    cursor: 'pointer', borderRadius: '5px',
                    color: (item as { danger?: boolean }).danger ? '#ef4444' : '#e8eaf6',
                    fontSize: '12px',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
