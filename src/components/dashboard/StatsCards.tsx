'use client'
import { useProjectStore } from '@/stores/projectStore'
import { useResourceStore } from '@/stores/resourceStore'
import { countConflicts } from '@/lib/capacity'

interface StatCardProps {
  label: string
  value: number | string
  color?: string
  bg?: string
}

function StatCard({ label, value, color = '#e8eaf6', bg = '#1a1d27' }: StatCardProps) {
  return (
    <div
      style={{
        background: bg,
        border: '1px solid #2a2d37',
        borderRadius: '10px',
        padding: '16px 20px',
        minWidth: '120px',
      }}
    >
      <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
        {label}
      </div>
    </div>
  )
}

export function StatsCards() {
  const projects = useProjectStore((s) => s.projects)
  const resources = useResourceStore((s) => s.resources)

  const q1 = projects.filter((p) => p.phase === 'Hotovo Q1').length
  const q2 = projects.filter((p) => p.phase === 'Hotovo Q2').length
  const q3 = projects.filter((p) => p.phase === 'Hotovo Q3').length
  const q4 = projects.filter((p) => p.phase === 'Hotovo Q4').length
  const active = projects.filter((p) => p.phase === 'Rozpracováno').length
  const conflicts = countConflicts(projects, resources)

  const green = projects.filter((p) => p.statusOverall === 'Green').length
  const amber = projects.filter((p) => p.statusOverall === 'Amber').length
  const red = projects.filter((p) => p.statusOverall === 'Red').length

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <StatCard label="Hotovo Q1" value={q1} color="#22c55e" />
      <StatCard label="Hotovo Q2" value={q2} color="#16a34a" />
      <StatCard label="Hotovo Q3" value={q3} color="#15803d" />
      <StatCard label="Hotovo Q4" value={q4} color="#14532d" />
      <StatCard label="Rozpracováno" value={active} color="#f59e0b" />
      <StatCard
        label="Konflikty"
        value={conflicts}
        color={conflicts > 0 ? '#ef4444' : '#22c55e'}
        bg={conflicts > 0 ? 'rgba(239,68,68,0.1)' : '#1a1d27'}
      />
      <StatCard label="✓ Green" value={green} color="#22c55e" />
      <StatCard label="⚠ Amber" value={amber} color="#f59e0b" />
      <StatCard label="✕ Red" value={red} color="#ef4444" />
    </div>
  )
}
