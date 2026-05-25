import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ZoomLevel } from '@/types'

interface UiStore {
  selectedProjectId: string | null
  selectedTaskId: string | null
  sidebarOpen: boolean
  commandPaletteOpen: boolean
  ganttZoom: ZoomLevel
  initialized: boolean
  setSelectedProject: (id: string | null) => void
  setSelectedTask: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setGanttZoom: (zoom: ZoomLevel) => void
  setInitialized: (val: boolean) => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      selectedProjectId: null,
      selectedTaskId: null,
      sidebarOpen: true,
      commandPaletteOpen: false,
      ganttZoom: 'week',
      initialized: false,

      setSelectedProject: (id) => set({ selectedProjectId: id }),
      setSelectedTask: (id) => set({ selectedTaskId: id }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setGanttZoom: (zoom) => set({ ganttZoom: zoom }),
      setInitialized: (val) => set({ initialized: val }),
    }),
    {
      name: 'projectflow-ui',
    }
  )
)
