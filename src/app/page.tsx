'use client'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { PhaseChart } from '@/components/dashboard/PhaseChart'
import { TeamChart } from '@/components/dashboard/TeamChart'
import { useProjectStore } from '@/stores/projectStore'
import { formatDateCZ } from '@/lib/workdays'

export default function DashboardPage() {
  const projects = useProjectStore((s) => s.projects)
  const today = formatDateCZ(new Date())

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px',
        background: '#0f1117',
      }}
    >
      {/* Title row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '22px', color: '#e8eaf6', fontWeight: 700 }}>
          Přehled portfolia
        </h1>
        <span style={{ fontSize: '13px', color: '#4b5563' }}>
          Dnes {today} · {projects.length} projektů
        </span>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Charts */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '24px',
          flexWrap: 'wrap',
        }}
      >
        <PhaseChart />
        <TeamChart />
      </div>

      {/* Recent updates */}
      <div
        style={{
          marginTop: '24px',
          background: '#1a1d27',
          border: '1px solid #2a2d37',
          borderRadius: '10px',
          padding: '16px',
        }}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#9ca3af' }}>
          Naposledy aktualizované projekty
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[...projects]
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )
            .slice(0, 5)
            .map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '8px',
                  borderRadius: '6px',
                  background: '#222535',
                }}
              >
                <div style={{ flex: 1, fontSize: '13px', color: '#e8eaf6' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{p.team}</div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#4b5563',
                    padding: '2px 6px',
                    background: '#1a1d27',
                    borderRadius: '4px',
                  }}
                >
                  {p.phase}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {new Date(p.updatedAt).toLocaleDateString('cs-CZ')}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
