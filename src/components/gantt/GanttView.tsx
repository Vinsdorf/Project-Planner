'use client'
import { useRef, useState, useCallback } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import { TaskTable } from './TaskTable'
import { GanttChart } from './GanttChart'
import { FilterBar } from '@/components/shared/FilterBar'
import { ProjectDetailPanel } from '@/components/project-detail/ProjectDetailPanel'
import { TEAMS, PHASES } from '@/lib/defaults'
import type { Project } from '@/types'

export function GanttView() {
  const splitterWidth = useUIStore((s) => s.splitterWidth)
  const setSplitterWidth = useUIStore((s) => s.setSplitterWidth)
  const detailPanelOpen = useUIStore((s) => s.detailPanelOpen)
  const setNewProjectDialogOpen = useUIStore((s) => s.setNewProjectDialogOpen)
  const addProject = useProjectStore((s) => s.addProject)

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

  const handleAddProject = () => {
    const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Nový projekt',
      type: 'Projekt',
      team: TEAMS[0],
      assignees: [],
      phase: 'Idea',
      statusOverall: 'N/A',
      statusScope: 'N/A',
      statusTime: 'N/A',
      statusBudget: 'N/A',
      priority: 'Medium',
      plannedStartWeek: 1,
      plannedDuration: 4,
      percentComplete: 0,
      sortOrder: 999,
    }
    addProject(newProject)
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
            ref={tableRef}
            style={{ flex: 1, overflow: 'auto' }}
            onScroll={handleTableScroll}
          >
            <TaskTable onAddProject={handleAddProject} />
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
