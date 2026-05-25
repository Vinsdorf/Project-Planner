'use client'
import { useUIStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import { SaveIndicator } from './SaveIndicator'
import { DEMO_PROJECTS } from '@/lib/defaults'
import type { Project } from '@/types'

export function AppHeader() {
  const setNewProjectDialogOpen = useUIStore((s) => s.setNewProjectDialogOpen)
  const projects = useProjectStore((s) => s.projects)
  const addProject = useProjectStore((s) => s.addProject)

  const handleExport = () => {
    const data = JSON.stringify(projects, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'portfolio-2025.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string) as Project[]
          data.forEach((p) => addProject(p))
        } catch {
          alert('Neplatný soubor')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleResetDemo = () => {
    if (confirm('Obnovit demo data? Stávající projekty zůstanou.')) {
      DEMO_PROJECTS.forEach((p) => addProject(p))
    }
  }

  return (
    <header
      style={{
        background: '#1a1d27',
        borderBottom: '1px solid #2a2d37',
        padding: '0 16px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#e8eaf6',
            margin: 0,
            letterSpacing: '-0.3px',
          }}
        >
          Project Portfolio Sconto 2025
        </h1>
        <SaveIndicator />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleResetDemo}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            background: 'transparent',
            color: '#6b7280',
            border: '1px solid #2a2d37',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Demo
        </button>
        <button
          onClick={handleImport}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            background: 'transparent',
            color: '#9ca3af',
            border: '1px solid #2a2d37',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Import
        </button>
        <button
          onClick={handleExport}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            background: 'transparent',
            color: '#9ca3af',
            border: '1px solid #2a2d37',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Export
        </button>
        <button
          onClick={() => setNewProjectDialogOpen(true)}
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          + Nový projekt
        </button>
      </div>
    </header>
  )
}
