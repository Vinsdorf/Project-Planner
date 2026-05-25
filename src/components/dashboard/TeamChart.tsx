'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useProjectStore } from '@/stores/projectStore'
import { TEAMS } from '@/lib/defaults'

export function TeamChart() {
  const projects = useProjectStore((s) => s.projects)

  const data = TEAMS.map((team) => ({
    name: team,
    count: projects.filter((p) => p.team === team).length,
  })).filter((d) => d.count > 0)

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
        Projekty podle týmu
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d37" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            angle={-30}
            textAnchor="end"
            height={50}
          />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: '#222535',
              border: '1px solid #2a2d37',
              borderRadius: '6px',
              color: '#e8eaf6',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Projekty" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
