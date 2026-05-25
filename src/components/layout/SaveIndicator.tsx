'use client'
import { useUIStore } from '@/stores/uiStore'

export function SaveIndicator() {
  const saveStatus = useUIStore((s) => s.saveStatus)

  if (saveStatus === 'saved') {
    return (
      <span style={{ fontSize: '12px', color: '#6b7280' }}>
        ✓ Uloženo
      </span>
    )
  }
  if (saveStatus === 'saving') {
    return (
      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
        Ukládám...
      </span>
    )
  }
  return (
    <span style={{ fontSize: '12px', color: '#f59e0b' }}>
      Neuloženo
    </span>
  )
}
