'use client'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useProjectStore } from '@/stores/projectStore'
import { PHASES } from '@/lib/defaults'

const PHASE_COLORS: Record<string, string> = {
  'Idea': '#6b7280',
  'Čeká na schválení': '#8b5cf6',
  'Zařazeno': '#3b82f6',
  'Rozpracováno': '#f59e0b',
  'Zastaveno': '#ef4444',
  'Hotovo Q1': '#22c55e',
  'Hotovo Q2': '#16a34a',
  'Hotovo Q3': '#15803d',
  'Hotovo Q4': '#14532d',
}

export function PhaseChart() {
  const projects = useProjectStore((s) => s.projects)

  const data = PHASES.map((phase) => ({
    name: phase,
    value: projects.filter((p) => p.phase === phase).length,
  })).filter((d) => d.value > 0)

  return (
    <div
      style={{
        background: '#1a1d27',
        border: '1px solid #2a2d37',
        borderRadius: '10px',
        padding: '16px',
        flex: 1,
        minWidth: '300px',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#9ca3af' }}>
        Projekty podle fáze
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={PHASE_COLORS[entry.name] ?? '#6b7280'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#222535',
              border: '1px solid #2a2d37',
              borderRadius: '6px',
              color: '#e8eaf6',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#6b7280' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
