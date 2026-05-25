import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Task, Dependency } from '@/types'
import { differenceInDays, parseISO } from 'date-fns'

interface TaskStore {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id'>) => string
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTasksByProject: (projectId: string) => Task[]
  getTask: (id: string) => Task | undefined
  reorderTasks: (projectId: string, taskIds: string[]) => void
  moveTaskToStatus: (taskId: string, status: Task['status']) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (taskData) => {
        const id = uuidv4()
        const task: Task = { ...taskData, id }
        set((state) => ({ tasks: [...state.tasks, task] }))
        return id
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== id) return t
            const updated = { ...t, ...updates }
            // Recalculate duration if dates changed
            if (updates.startDate || updates.endDate) {
              const start = parseISO(updated.startDate)
              const end = parseISO(updated.endDate)
              updated.duration = Math.max(1, differenceInDays(end, start) + 1)
            }
            return updated
          }),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id && t.parentId !== id),
        }))
      },

      getTasksByProject: (projectId) => {
        return get()
          .tasks.filter((t) => t.projectId === projectId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      },

      getTask: (id) => {
        return get().tasks.find((t) => t.id === id)
      },

      reorderTasks: (projectId, taskIds) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.projectId !== projectId) return t
            const newOrder = taskIds.indexOf(t.id)
            return newOrder >= 0 ? { ...t, sortOrder: newOrder } : t
          }),
        }))
      },

      moveTaskToStatus: (taskId, status) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status } : t
          ),
        }))
      },
    }),
    {
      name: 'projectflow-tasks',
    }
  )
)
