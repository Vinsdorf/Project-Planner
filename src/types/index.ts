export interface Project {
  id: string
  name: string
  description?: string
  startDate: string
  endDate?: string
  status: 'planning' | 'active' | 'on-hold' | 'completed'
  createdAt: string
  updatedAt: string
}

export interface Dependency {
  taskId: string
  type: 'FS' | 'FF' | 'SS' | 'SF'
  lag?: number
}

export interface Task {
  id: string
  projectId: string
  name: string
  description?: string
  startDate: string
  endDate: string
  duration: number
  progress: number // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  parentId?: string
  assigneeIds: string[]
  dependencies: Dependency[]
  color?: string
  isMilestone: boolean
  sortOrder: number
}

export interface TeamMember {
  id: string
  name: string
  role: string
  email?: string
  avatar?: string
  color: string
  capacity: number // hours/day, default 8
  costPerHour?: number
}

export interface TimeOff {
  id: string
  memberId: string
  startDate: string
  endDate: string
  type: 'vacation' | 'sick' | 'holiday' | 'other'
  note?: string
}

export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter'

export interface GanttConfig {
  zoom: ZoomLevel
  columnWidth: number
  rowHeight: number
  showWeekends: boolean
  showDependencies: boolean
}

export interface UIState {
  selectedProjectId: string | null
  selectedTaskId: string | null
  sidebarOpen: boolean
  commandPaletteOpen: boolean
}

export type ProjectStatus = Project['status']
export type TaskStatus = Task['status']
export type TaskPriority = Task['priority']
