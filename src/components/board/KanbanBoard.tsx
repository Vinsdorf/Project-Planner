'use client'
import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { KanbanColumn } from './KanbanColumn'
import { ProjectDetailPanel } from '@/components/project-detail/ProjectDetailPanel'
import { FilterBar } from '@/components/shared/FilterBar'
import { PHASES } from '@/lib/defaults'
import type { ProjectPhase } from '@/types'

export function KanbanBoard() {
  const getFilteredProjects = useProjectStore((s) => s.getFilteredProjects)
  const updateProject = useProjectStore((s) => s.updateProject)
  const detailPanelOpen = useUIStore((s) => s.detailPanelOpen)

  const projects = getFilteredProjects()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const projectId = active.id as string
    const overId = over.id as string

    // Check if dropped over a column (phase)
    if (PHASES.includes(overId as ProjectPhase)) {
      updateProject(projectId, { phase: overId as ProjectPhase })
    } else {
      // Dropped over another card — find its phase
      const targetProject = projects.find((p) => p.id === overId)
      if (targetProject && targetProject.id !== projectId) {
        updateProject(projectId, { phase: targetProject.phase })
      }
    }
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // visual feedback handled by isOver in KanbanColumn
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <FilterBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div
            style={{
              display: 'flex',
              gap: '12px',
              padding: '16px',
              overflowX: 'auto',
              overflowY: 'hidden',
              flex: 1,
            }}
          >
            {PHASES.map((phase) => (
              <KanbanColumn
                key={phase}
                phase={phase}
                projects={projects.filter((p) => p.phase === phase)}
              />
            ))}
          </div>
        </DndContext>

        {detailPanelOpen && <ProjectDetailPanel />}
      </div>
    </div>
  )
}
