export type ProjectType = 'Projekt' | 'Vylepšení'
export type ProjectPhase = 'Idea' | 'Čeká na schválení' | 'Zařazeno' | 'Rozpracováno' | 'Zastaveno' | 'Hotovo Q1' | 'Hotovo Q2' | 'Hotovo Q3' | 'Hotovo Q4'
export type TrafficLight = 'Green' | 'Amber' | 'Red' | 'N/A'
export type Priority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest'
export type BudgetSize = 'Malé' | 'Střední' | 'Velké' | 'Extra velké'

export interface Project {
  id: string
  jiraId?: string
  name: string
  description?: string
  type: ProjectType
  theme?: string
  costCenter?: string
  team: string
  sponsor?: string
  owner?: string
  newOwner?: string
  solver?: string
  assignees: string[]
  phase: ProjectPhase
  statusOverall: TrafficLight
  statusScope: TrafficLight
  statusTime: TrafficLight
  statusBudget: TrafficLight
  blockerDescription?: string
  priority: Priority
  budget?: BudgetSize
  tracksGoal?: string
  ictImpact?: string
  lastUpdate?: string
  teamImpact?: string
  targetKT?: number
  scopeMD?: number
  startDate: string         // ISO date "YYYY-MM-DD"
  plannedDuration: number   // man-days (MD)
  actualStartDate?: string  // ISO date "YYYY-MM-DD"
  actualDuration?: number   // actual MD
  percentComplete: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Resource {
  id: string
  name: string
  role?: string
  team: string
  color: string
  capacityHoursPerDay: number
  isActive: boolean
}

export interface Absence {
  id: string
  resourceId: string
  startWeek: number
  endWeek: number
  type: 'vacation' | 'sick' | 'holiday' | 'other'
  note?: string
}

export interface PortfolioSettings {
  year: number
  currentWeek: number
  teams: string[]
  themes: string[]
}

export interface ProjectTask {
  id: string
  projectId: string
  name: string
  assignees: string[]
  startDate: string       // ISO date "YYYY-MM-DD"
  plannedDuration: number // man-days (MD)
  percentComplete: number
  sortOrder: number
  color?: string
}
