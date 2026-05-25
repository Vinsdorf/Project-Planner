import { parseISO, addDays, format } from 'date-fns'
import { Task, Dependency } from '@/types'

export function calculateTaskDates(
  task: Task,
  allTasks: Task[]
): { startDate: string; endDate: string } {
  // For tasks with dependencies, calculate earliest start
  if (task.dependencies.length === 0) {
    return { startDate: task.startDate, endDate: task.endDate }
  }

  let earliestStart = parseISO(task.startDate)

  for (const dep of task.dependencies) {
    const depTask = allTasks.find((t) => t.id === dep.taskId)
    if (!depTask) continue

    const depEnd = parseISO(depTask.endDate)
    const depStart = parseISO(depTask.startDate)
    const lag = dep.lag || 0

    switch (dep.type) {
      case 'FS': {
        // Finish-to-Start: this task starts after dep finishes
        const candidate = addDays(depEnd, 1 + lag)
        if (candidate > earliestStart) earliestStart = candidate
        break
      }
      case 'SS': {
        // Start-to-Start: this task starts when dep starts
        const candidate = addDays(depStart, lag)
        if (candidate > earliestStart) earliestStart = candidate
        break
      }
      case 'FF': {
        // Finish-to-Finish: this task ends when dep ends
        // We keep start but ensure end >= dep end
        break
      }
      case 'SF': {
        // Start-to-Finish: less common, skip for now
        break
      }
    }
  }

  const duration = task.duration - 1
  const endDate = addDays(earliestStart, duration)

  return {
    startDate: format(earliestStart, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  }
}

export function getTaskColor(priority: Task['priority'], customColor?: string): string {
  if (customColor) return customColor
  switch (priority) {
    case 'critical':
      return '#ef4444'
    case 'high':
      return '#f59e0b'
    case 'medium':
      return '#3b82f6'
    case 'low':
      return '#6b7280'
    default:
      return '#3b82f6'
  }
}

export function getStatusColor(status: Task['status']): string {
  switch (status) {
    case 'completed':
      return '#22c55e'
    case 'in-progress':
      return '#3b82f6'
    case 'blocked':
      return '#ef4444'
    case 'not-started':
      return '#6b7280'
    default:
      return '#6b7280'
  }
}

export function buildTaskTree(tasks: Task[]): Task[] {
  const rootTasks = tasks.filter((t) => !t.parentId)
  const childMap = new Map<string, Task[]>()

  tasks.forEach((t) => {
    if (t.parentId) {
      const children = childMap.get(t.parentId) || []
      children.push(t)
      childMap.set(t.parentId, children)
    }
  })

  const flatten = (taskList: Task[]): Task[] => {
    const result: Task[] = []
    taskList
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((task) => {
        result.push(task)
        const children = childMap.get(task.id)
        if (children) {
          result.push(...flatten(children))
        }
      })
    return result
  }

  return flatten(rootTasks)
}

export function calculateParentDates(
  parentId: string,
  allTasks: Task[]
): { startDate: string; endDate: string; progress: number } | null {
  const children = allTasks.filter((t) => t.parentId === parentId)
  if (children.length === 0) return null

  const starts = children.map((t) => parseISO(t.startDate))
  const ends = children.map((t) => parseISO(t.endDate))
  const minStart = new Date(Math.min(...starts.map((d) => d.getTime())))
  const maxEnd = new Date(Math.max(...ends.map((d) => d.getTime())))
  const avgProgress = Math.round(
    children.reduce((sum, t) => sum + t.progress, 0) / children.length
  )

  return {
    startDate: format(minStart, 'yyyy-MM-dd'),
    endDate: format(maxEnd, 'yyyy-MM-dd'),
    progress: avgProgress,
  }
}
