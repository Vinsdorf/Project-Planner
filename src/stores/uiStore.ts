import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, ProjectTask } from '@/types'
import { calculateConflicts } from '@/lib/capacity'

interface UIStore {
  zoomLevel: number
  splitterWidth: number
  selectedProjectId: string | null
  detailPanelOpen: boolean
  ganttScrollLeft: number
  saveStatus: 'saved' | 'saving' | 'unsaved'
  commandPaletteOpen: boolean
  newProjectDialogOpen: boolean

  // Conflict map: assigneeName → Set of week numbers where they have conflicts
  conflictMap: Map<string, Set<number>>
  // Per-slot (project or task) conflict weeks
  slotConflicts: Map<string, Set<number>>

  setZoomLevel: (z: number) => void
  setSplitterWidth: (w: number) => void
  setSelectedProject: (id: string | null) => void
  setDetailPanelOpen: (open: boolean) => void
  setGanttScrollLeft: (x: number) => void
  setSaveStatus: (s: 'saved' | 'saving' | 'unsaved') => void
  setCommandPaletteOpen: (open: boolean) => void
  setNewProjectDialogOpen: (open: boolean) => void
  rebuildConflictMap: (projects: Project[], tasks: ProjectTask[]) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      zoomLevel: 8,
      splitterWidth: 700,
      selectedProjectId: null,
      detailPanelOpen: false,
      ganttScrollLeft: 0,
      saveStatus: 'saved',
      commandPaletteOpen: false,
      newProjectDialogOpen: false,
      conflictMap: new Map(),
      slotConflicts: new Map(),

      setZoomLevel: (z) => set({ zoomLevel: z }),
      setSplitterWidth: (w) => set({ splitterWidth: w }),
      setSelectedProject: (id) =>
        set({ selectedProjectId: id, detailPanelOpen: id != null }),
      setDetailPanelOpen: (open) => set({ detailPanelOpen: open }),
      setGanttScrollLeft: (x) => set({ ganttScrollLeft: x }),
      setSaveStatus: (s) => set({ saveStatus: s }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setNewProjectDialogOpen: (open) => set({ newProjectDialogOpen: open }),

      rebuildConflictMap: (projects, tasks) => {
        const { slotConflicts, heatmapData } = calculateConflicts(projects, tasks)

        // Build per-person conflict week set
        const conflictMap = new Map<string, Set<number>>()
        for (const [person, weekMap] of heatmapData.entries()) {
          const conflictWeeks = new Set<number>()
          for (const [week, slotNames] of weekMap.entries()) {
            if (slotNames.length >= 2) {
              conflictWeeks.add(week)
            }
          }
          if (conflictWeeks.size > 0) {
            conflictMap.set(person, conflictWeeks)
          }
        }

        set({ conflictMap, slotConflicts })
      },
    }),
    {
      name: 'portfolio-ui',
      partialize: (state) => ({
        zoomLevel: state.zoomLevel,
        splitterWidth: state.splitterWidth,
      }),
    }
  )
)
