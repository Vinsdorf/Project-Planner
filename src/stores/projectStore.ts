import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Project } from '@/types'

interface ProjectStore {
  projects: Project[]
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  getProject: (id: string) => Project | undefined
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],

      addProject: (projectData) => {
        const id = uuidv4()
        const now = new Date().toISOString()
        const project: Project = {
          ...projectData,
          id,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ projects: [...state.projects, project] }))
        return id
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }))
      },

      getProject: (id) => {
        return get().projects.find((p) => p.id === id)
      },
    }),
    {
      name: 'projectflow-projects',
    }
  )
)
