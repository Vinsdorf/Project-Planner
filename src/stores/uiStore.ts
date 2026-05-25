import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  zoomLevel: number
  splitterWidth: number
  selectedProjectId: string | null
  detailPanelOpen: boolean
  ganttScrollLeft: number
  saveStatus: 'saved' | 'saving' | 'unsaved'
  commandPaletteOpen: boolean
  newProjectDialogOpen: boolean
  setZoomLevel: (z: number) => void
  setSplitterWidth: (w: number) => void
  setSelectedProject: (id: string | null) => void
  setDetailPanelOpen: (open: boolean) => void
  setGanttScrollLeft: (x: number) => void
  setSaveStatus: (s: 'saved' | 'saving' | 'unsaved') => void
  setCommandPaletteOpen: (open: boolean) => void
  setNewProjectDialogOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      zoomLevel: 40,
      splitterWidth: 700,
      selectedProjectId: null,
      detailPanelOpen: false,
      ganttScrollLeft: 0,
      saveStatus: 'saved',
      commandPaletteOpen: false,
      newProjectDialogOpen: false,

      setZoomLevel: (z) => set({ zoomLevel: z }),
      setSplitterWidth: (w) => set({ splitterWidth: w }),
      setSelectedProject: (id) =>
        set({ selectedProjectId: id, detailPanelOpen: id != null }),
      setDetailPanelOpen: (open) => set({ detailPanelOpen: open }),
      setGanttScrollLeft: (x) => set({ ganttScrollLeft: x }),
      setSaveStatus: (s) => set({ saveStatus: s }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setNewProjectDialogOpen: (open) => set({ newProjectDialogOpen: open }),
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
