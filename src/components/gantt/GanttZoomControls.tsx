'use client'
import { useGanttZoom } from '@/hooks/useGanttZoom'

export function GanttZoomControls() {
  const { zoomLevel, zoomIn, zoomOut } = useGanttZoom()

  return (
    <div
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        display: 'flex',
        gap: '4px',
        zIndex: 20,
        background: '#1a1d27',
        border: '1px solid #2a2d37',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={zoomOut}
        style={{
          width: '28px',
          height: '28px',
          background: 'transparent',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Oddálit"
      >
        −
      </button>
      <span
        style={{
          padding: '0 4px',
          fontSize: '11px',
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {zoomLevel}px
      </span>
      <button
        onClick={zoomIn}
        style={{
          width: '28px',
          height: '28px',
          background: 'transparent',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Přiblížit"
      >
        +
      </button>
    </div>
  )
}
