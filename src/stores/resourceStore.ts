import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Resource, Absence } from '@/types'
import { DEMO_RESOURCES } from '@/lib/defaults'

interface ResourceStore {
  resources: Resource[]
  absences: Absence[]
  addResource: (r: Omit<Resource, 'id'>) => void
  updateResource: (id: string, patch: Partial<Resource>) => void
  deleteResource: (id: string) => void
  addAbsence: (a: Omit<Absence, 'id'>) => void
  updateAbsence: (id: string, patch: Partial<Absence>) => void
  deleteAbsence: (id: string) => void
}

export const useResourceStore = create<ResourceStore>()(
  persist(
    (set) => ({
      resources: DEMO_RESOURCES,
      absences: [],

      addResource: (r) => {
        const resource: Resource = { ...r, id: uuidv4() }
        set((state) => ({ resources: [...state.resources, resource] }))
      },

      updateResource: (id, patch) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, ...patch } : r
          ),
        }))
      },

      deleteResource: (id) => {
        set((state) => ({
          resources: state.resources.filter((r) => r.id !== id),
        }))
      },

      addAbsence: (a) => {
        const absence: Absence = { ...a, id: uuidv4() }
        set((state) => ({ absences: [...state.absences, absence] }))
      },

      updateAbsence: (id, patch) => {
        set((state) => ({
          absences: state.absences.map((a) =>
            a.id === id ? { ...a, ...patch } : a
          ),
        }))
      },

      deleteAbsence: (id) => {
        set((state) => ({
          absences: state.absences.filter((a) => a.id !== id),
        }))
      },
    }),
    {
      name: 'portfolio-resources',
    }
  )
)
