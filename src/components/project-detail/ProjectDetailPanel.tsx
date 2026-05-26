'use client'
import { useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import { TrafficLightDots } from '@/components/gantt/TrafficLightDots'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { TEAMS, PHASES, PRIORITIES, THEMES } from '@/lib/defaults'
import type { Project, TrafficLight } from '@/types'

const BUDGET_OPTIONS = ['Malé', 'Střední', 'Velké', 'Extra velké'] as const
const TYPE_OPTIONS = ['Projekt', 'Vylepšení'] as const

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '11px',
          color: '#6b7280',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      style={{
        width: '100%',
        background: '#222535',
        border: '1px solid #2a2d37',
        borderRadius: '6px',
        color: '#e8eaf6',
        padding: '7px 10px',
        fontSize: '13px',
        outline: 'none',
      }}
    />
  )
}

function SelectInput({
  value,
  options,
  onChange,
}: {
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        background: '#222535',
        border: '1px solid #2a2d37',
        borderRadius: '6px',
        color: '#e8eaf6',
        padding: '7px 10px',
        fontSize: '13px',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}

export function ProjectDetailPanel() {
  const selectedId = useUIStore((s) => s.selectedProjectId)
  const setDetailPanelOpen = useUIStore((s) => s.setDetailPanelOpen)
  const setSelectedProject = useUIStore((s) => s.setSelectedProject)
  const { projects, updateProject, deleteProject } = useProjectStore()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const project = projects.find((p) => p.id === selectedId)
  if (!project) return null

  const update = (patch: Partial<Project>) => {
    updateProject(project.id, patch)
  }

  const handleClose = () => {
    setDetailPanelOpen(false)
    setSelectedProject(null)
  }

  const handleDelete = () => {
    deleteProject(project.id)
    handleClose()
  }

  const handleTLChange = (
    field: 'statusOverall' | 'statusScope' | 'statusTime' | 'statusBudget',
    value: TrafficLight
  ) => {
    update({ [field]: value })
  }

  const assigneesText = project.assignees.join(', ')

  return (
    <>
      <div
        style={{
          width: '340px',
          flexShrink: 0,
          height: '100%',
          background: '#1a1d27',
          borderLeft: '1px solid #2a2d37',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        className="slide-in"
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #2a2d37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', color: '#e8eaf6' }}>
            Detail projektu
          </h3>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
          }}
        >
          {/* Základní info */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#4b5563',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
            }}
          >
            Základní info
          </div>

          <Field label="Název">
            <TextInput
              value={project.name}
              onChange={(v) => update({ name: v })}
            />
          </Field>

          <Field label="Typ">
            <SelectInput
              value={project.type}
              options={TYPE_OPTIONS}
              onChange={(v) => update({ type: v as Project['type'] })}
            />
          </Field>

          <Field label="Téma">
            <SelectInput
              value={project.theme ?? ''}
              options={['', ...THEMES]}
              onChange={(v) => update({ theme: v })}
            />
          </Field>

          <Field label="JIRA ID">
            <TextInput
              value={project.jiraId ?? ''}
              onChange={(v) => update({ jiraId: v })}
              placeholder="napr. PROJ-123"
            />
          </Field>

          {/* Stakeholdeři */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#4b5563',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              marginTop: '20px',
            }}
          >
            Stakeholdeři
          </div>

          <Field label="Tým">
            <SelectInput
              value={project.team}
              options={TEAMS}
              onChange={(v) => update({ team: v })}
            />
          </Field>

          <Field label="Sponzor">
            <TextInput
              value={project.sponsor ?? ''}
              onChange={(v) => update({ sponsor: v })}
            />
          </Field>

          <Field label="Vlastník">
            <TextInput
              value={project.owner ?? ''}
              onChange={(v) => update({ owner: v })}
            />
          </Field>

          <Field label="Řešitelé (čárkou oddělení)">
            <TextInput
              value={assigneesText}
              onChange={(v) =>
                update({
                  assignees: v
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>

          {/* Status */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#4b5563',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              marginTop: '20px',
            }}
          >
            Status
          </div>

          <Field label="Fáze">
            <SelectInput
              value={project.phase}
              options={PHASES}
              onChange={(v) => update({ phase: v as Project['phase'] })}
            />
          </Field>

          <Field label="Traffic lights (STAV · ROZSAH · ČAS · ROZPOČET)">
            <div style={{ padding: '8px 0' }}>
              <TrafficLightDots
                overall={project.statusOverall}
                scope={project.statusScope}
                time={project.statusTime}
                budget={project.statusBudget}
                onChange={handleTLChange}
              />
            </div>
          </Field>

          {/* Hodnocení */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#4b5563',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              marginTop: '20px',
            }}
          >
            Hodnocení
          </div>

          <Field label="Priorita">
            <SelectInput
              value={project.priority}
              options={PRIORITIES}
              onChange={(v) => update({ priority: v as Project['priority'] })}
            />
          </Field>

          <Field label="Rozpočet">
            <SelectInput
              value={project.budget ?? ''}
              options={['', ...BUDGET_OPTIONS]}
              onChange={(v) =>
                update({ budget: v as Project['budget'] })
              }
            />
          </Field>

          <Field label="Blocker popis">
            <TextInput
              value={project.blockerDescription ?? ''}
              onChange={(v) => update({ blockerDescription: v })}
              placeholder="Popis blokátoru..."
            />
          </Field>

          {/* Timeline */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#4b5563',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              marginTop: '20px',
            }}
          >
            Timeline
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Field label="Plán start">
              <TextInput
                value={project.startDate ?? ''}
                onChange={(v) => update({ startDate: v })}
                type="date"
              />
            </Field>
            <Field label="Pracnost (MD)">
              <TextInput
                value={String(project.plannedDuration)}
                onChange={(v) => {
                  const n = parseInt(v)
                  if (!isNaN(n)) update({ plannedDuration: Math.max(1, n) })
                }}
                type="number"
              />
            </Field>
            <Field label="Skutečný start">
              <TextInput
                value={project.actualStartDate ?? ''}
                onChange={(v) => update({ actualStartDate: v || undefined })}
                type="date"
              />
            </Field>
            <Field label="Skutečná délka (MD)">
              <TextInput
                value={String(project.actualDuration ?? '')}
                onChange={(v) => {
                  const n = parseInt(v)
                  update({ actualDuration: isNaN(n) ? undefined : n })
                }}
                type="number"
              />
            </Field>
          </div>

          <Field label="Dokončeno (0–100 %)">
            <TextInput
              value={String(Math.round(project.percentComplete * 100))}
              onChange={(v) => {
                const n = parseInt(v)
                if (!isNaN(n))
                  update({ percentComplete: Math.max(0, Math.min(100, n)) / 100 })
              }}
              type="number"
            />
          </Field>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #2a2d37',
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setConfirmOpen(true)}
            style={{
              flex: 1,
              padding: '8px',
              background: 'transparent',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Smazat
          </button>
          <button
            onClick={handleClose}
            style={{
              flex: 2,
              padding: '8px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Zavřít
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Smazat projekt"
        message={`Opravdu chcete smazat projekt "${project.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
