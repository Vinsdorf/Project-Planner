'use client'
import { useRef, useCallback, useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import { ExcelTable } from './ExcelTable'
import { GanttChart } from './GanttChart'
import { FilterBar } from '@/components/shared/FilterBar'
import { ProjectDetailPanel } from '@/components/project-detail/ProjectDetailPanel'
import { dateToPixel } from '@/lib/ganttHelpers'

export function GanttView() {
  const splitterWidth = useUIStore((s) => s.splitterWidth)
  const setSplitterWidth = useUIStore((s) => s.setSplitterWidth)
  const detailPanelOpen = useUIStore((s) => s.detailPanelOpen)
  const projects = useProjectStore((s) => s.projects)
  const tasks = useProjectStore((s) => s.tasks)
  const rebuildConflictMap = useUIStore((s) => s.rebuildConflictMap)
  const zoomLevel = useUIStore((s) => s.zoomLevel)

  // Reactively rebuild conflict map whenever projects or tasks change
  useEffect(() => {
    rebuildConflictMap(projects, tasks)
  }, [projects, tasks, rebuildConflictMap])

  // Scroll gantt to today on mount and whenever zoom changes
  useEffect(() => {
    if (!ganttRef.current) return
    const todayPx = dateToPixel(new Date(), zoomLevel)
    ganttRef.current.scrollLeft = Math.max(0, todayPx - 160)
  }, [zoomLevel])

  const tableRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(splitterWidth)

  const handleSplitterMouseDown = useCallback(
    (e: React.MouseEvent) => {
      draggingRef.current = true
      startXRef.current = e.clientX
      startWidthRef.current = splitterWidth

      const onMove = (ev: MouseEvent) => {
        if (!draggingRef.current) return
        const delta = ev.clientX - startXRef.current
        setSplitterWidth(Math.max(300, Math.min(900, startWidthRef.current + delta)))
      }

      const onUp = () => {
        draggingRef.current = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [splitterWidth, setSplitterWidth]
  )

  // Sync scroll between table and gantt
  const syncingRef = useRef(false)
  const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (syncingRef.current) return
    if (ganttRef.current) {
      syncingRef.current = true
      ganttRef.current.scrollTop = e.currentTarget.scrollTop
      syncingRef.current = false
    }
  }
  const handleGanttScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (syncingRef.current) return
    if (tableRef.current) {
      syncingRef.current = true
      tableRef.current.scrollTop = e.currentTarget.scrollTop
      syncingRef.current = false
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <FilterBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Task table */}
        <div
          style={{
            width: `${splitterWidth}px`,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRight: '1px solid #2a2d37',
          }}
        >
          <div
            style={{ flex: 1, overflow: 'auto' }}
            onScroll={handleTableScroll}
          >
            <ExcelTable tableRef={tableRef} />
          </div>
        </div>

        {/* Splitter */}
        <div
          onMouseDown={handleSplitterMouseDown}
          style={{
            width: '4px',
            background: '#2a2d37',
            cursor: 'col-resize',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLDivElement).style.background = '#3b82f6'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLDivElement).style.background = '#2a2d37'
          }}
        />

        {/* Gantt chart */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <GanttChart ref={ganttRef} />
        </div>

        {/* Detail panel */}
        {detailPanelOpen && <ProjectDetailPanel />}
      </div>
    </div>
  )
}
