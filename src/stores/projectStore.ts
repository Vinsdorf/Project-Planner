import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Project } from '@/types'
import { DEMO_PROJECTS } from '@/lib/defaults'

interface Filters {
  team: string
  phase: string
  priority: string
  assignee: string
}

interface ProjectStore {
  projects: Project[]
  filters: Filters
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  duplicateProject: (id: string) => void
  reorderProjects: (from: number, to: number) => void
  setFilter: (key: keyof Filters, value: string) => void
  getFilteredProjects: () => Project[]
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: DEMO_PROJECTS,
      filters: { team: '', phase: '', priority: '', assignee: '' },

      addProject: (p) => {
        const now = new Date().toISOString()
        const newProject: Project = {
          ...p,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          projects: [...state.projects, newProject],
        }))
      },

      updateProject: (id, patch) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, ...patch, updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }))
      },

      duplicateProject: (id) => {
        const project = get().projects.find((p) => p.id === id)
        if (!project) return
        const now = new Date().toISOString()
        const duplicate: Project = {
          ...project,
          id: uuidv4(),
          name: `${project.name} (kopie)`,
          sortOrder: get().projects.length,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          projects: [...state.projects, duplicate],
        }))
      },

      reorderProjects: (from, to) => {
        const projects = [...get().projects]
        const [removed] = projects.splice(from, 1)
        projects.splice(to, 0, removed)
        const reordered = projects.map((p, i) => ({ ...p, sortOrder: i }))
        set({ projects: reordered })
      },

      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }))
      },

      getFilteredProjects: () => {
        const { projects, filters } = get()
        return projects
          .filter((p) => {
            if (filters.team && p.team !== filters.team) return false
            if (filters.phase && p.phase !== filters.phase) return false
            if (filters.priority && p.priority !== filters.priority) return false
            if (
              filters.assignee &&
              !p.assignees.includes(filters.assignee)
            )
              return false
            return true
          })
          .sort((a, b) => a.sortOrder - b.sortOrder)
      },
    }),
    {
      name: 'portfolio-projects',
    }
  )
)
