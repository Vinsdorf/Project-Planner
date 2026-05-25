import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Project, ProjectTask } from '@/types'
import { DEMO_PROJECTS, DEMO_TASKS } from '@/lib/defaults'

interface Filters {
  team: string
  phase: string
  priority: string
  assignee: string
}

interface ProjectStore {
  projects: Project[]
  tasks: ProjectTask[]
  filters: Filters
  expandedProjectIds: string[]

  // Project CRUD
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  duplicateProject: (id: string) => void
  reorderProjects: (from: number, to: number) => void
  setFilter: (key: keyof Filters, value: string) => void
  getFilteredProjects: () => Project[]

  // Task CRUD
  addTask: (task: Omit<ProjectTask, 'id'>) => void
  updateTask: (id: string, patch: Partial<ProjectTask>) => void
  deleteTask: (id: string) => void
  reorderTasks: (projectId: string, fromIndex: number, toIndex: number) => void
  getTasksForProject: (projectId: string) => ProjectTask[]

  // UI state for expanded projects
  toggleExpanded: (projectId: string) => void
  isExpanded: (projectId: string) => boolean
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: DEMO_PROJECTS,
      tasks: DEMO_TASKS,
      filters: { team: '', phase: '', priority: '', assignee: '' },
      expandedProjectIds: ['p1'], // first project expanded by default

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
          tasks: state.tasks.filter((t) => t.projectId !== id),
          expandedProjectIds: state.expandedProjectIds.filter((eid) => eid !== id),
        }))
      },

      duplicateProject: (id) => {
        const project = get().projects.find((p) => p.id === id)
        if (!project) return
        const now = new Date().toISOString()
        const newId = uuidv4()
        const duplicate: Project = {
          ...project,
          id: newId,
          name: `${project.name} (kopie)`,
          sortOrder: get().projects.length,
          createdAt: now,
          updatedAt: now,
        }
        // Also duplicate tasks
        const originalTasks = get().tasks.filter((t) => t.projectId === id)
        const duplicatedTasks: ProjectTask[] = originalTasks.map((t) => ({
          ...t,
          id: uuidv4(),
          projectId: newId,
        }))
        set((state) => ({
          projects: [...state.projects, duplicate],
          tasks: [...state.tasks, ...duplicatedTasks],
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

      addTask: (task) => {
        const newTask: ProjectTask = { ...task, id: uuidv4() }
        set((state) => ({ tasks: [...state.tasks, newTask] }))
      },

      updateTask: (id, patch) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }))
      },

      reorderTasks: (projectId, fromIndex, toIndex) => {
        const allTasks = get().tasks
        const projectTasks = allTasks
          .filter((t) => t.projectId === projectId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
        const [removed] = projectTasks.splice(fromIndex, 1)
        projectTasks.splice(toIndex, 0, removed)
        const reordered = projectTasks.map((t, i) => ({ ...t, sortOrder: i }))
        const otherTasks = allTasks.filter((t) => t.projectId !== projectId)
        set({ tasks: [...otherTasks, ...reordered] })
      },

      getTasksForProject: (projectId) => {
        return get()
          .tasks.filter((t) => t.projectId === projectId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      },

      toggleExpanded: (projectId) => {
        set((state) => {
          const ids = state.expandedProjectIds
          if (ids.includes(projectId)) {
            return { expandedProjectIds: ids.filter((id) => id !== projectId) }
          } else {
            return { expandedProjectIds: [...ids, projectId] }
          }
        })
      },

      isExpanded: (projectId) => {
        return get().expandedProjectIds.includes(projectId)
      },
    }),
    {
      name: 'portfolio-projects',
    }
  )
)
