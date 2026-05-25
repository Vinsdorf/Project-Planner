import type { Project, ProjectTask, Resource } from '@/types'

interface ScheduleSlot {
  id: string
  name: string
  assignees: string[]
  startWeek: number
  endWeek: number
  sourceType: 'project' | 'task'
  sourceId: string
}

export function buildSlots(projects: Project[], tasks: ProjectTask[]): ScheduleSlot[] {
  const slots: ScheduleSlot[] = []

  for (const project of projects) {
    const projectTasks = tasks.filter((t) => t.projectId === project.id)

    if (projectTasks.length > 0) {
      // Project has tasks — use tasks for scheduling
      for (const task of projectTasks) {
        slots.push({
          id: `task-${task.id}`,
          name: `${project.name} – ${task.name}`,
          assignees: task.assignees,
          startWeek: task.plannedStartWeek,
          endWeek: task.plannedStartWeek + task.plannedDuration - 1,
          sourceType: 'task',
          sourceId: task.id,
        })
      }
    } else {
      // Project has no tasks — use project-level assignees
      slots.push({
        id: `project-${project.id}`,
        name: project.name,
        assignees: project.assignees,
        startWeek: project.plannedStartWeek,
        endWeek: project.plannedStartWeek + project.plannedDuration - 1,
        sourceType: 'project',
        sourceId: project.id,
      })
    }
  }

  return slots
}

export function calculateConflicts(
  projects: Project[],
  tasks: ProjectTask[]
): {
  slotConflicts: Map<string, Set<number>>
  heatmapData: Map<string, Map<number, string[]>>
} {
  const slots = buildSlots(projects, tasks)

  // Build assignee → week → slotIds mapping
  const assigneeWeekSlots = new Map<string, Map<number, string[]>>()

  for (const slot of slots) {
    for (const assignee of slot.assignees) {
      if (!assigneeWeekSlots.has(assignee)) {
        assigneeWeekSlots.set(assignee, new Map())
      }
      const weekMap = assigneeWeekSlots.get(assignee)!
      for (let w = slot.startWeek; w <= Math.min(slot.endWeek, 52); w++) {
        const existing = weekMap.get(w) ?? []
        weekMap.set(w, [...existing, slot.id])
      }
    }
  }

  // Build slotConflicts: slotId → Set<weekNumber> where that slot has a conflict
  const slotConflicts = new Map<string, Set<number>>()

  for (const weekMap of assigneeWeekSlots.values()) {
    for (const [week, slotIds] of weekMap.entries()) {
      if (slotIds.length >= 2) {
        for (const slotId of slotIds) {
          if (!slotConflicts.has(slotId)) {
            slotConflicts.set(slotId, new Set())
          }
          slotConflicts.get(slotId)!.add(week)
        }
      }
    }
  }

  // Build heatmapData: assigneeName → Map<week, slotNames[]>
  const heatmapData = new Map<string, Map<number, string[]>>()

  const slotById = new Map<string, ScheduleSlot>()
  for (const slot of slots) {
    slotById.set(slot.id, slot)
  }

  for (const [assignee, weekMap] of assigneeWeekSlots.entries()) {
    const nameMap = new Map<number, string[]>()
    for (const [week, slotIds] of weekMap.entries()) {
      nameMap.set(
        week,
        slotIds.map((id) => slotById.get(id)?.name ?? id)
      )
    }
    heatmapData.set(assignee, nameMap)
  }

  return { slotConflicts, heatmapData }
}

export function getHeatmapColor(projectCount: number): string {
  if (projectCount === 0) return 'transparent'
  if (projectCount === 1) return 'rgba(34, 197, 94, 0.6)'
  if (projectCount === 2) return 'rgba(234, 179, 8, 0.7)'
  return 'rgba(239, 68, 68, 0.8)'
}

export function countConflicts(
  projects: Project[],
  tasks: ProjectTask[]
): number {
  const { slotConflicts } = calculateConflicts(projects, tasks)
  let count = 0
  for (const weeks of slotConflicts.values()) {
    count += weeks.size
  }
  return count
}

// Legacy function for backward compatibility — uses project-level only
export function calculateConflictsLegacy(
  projects: Project[],
  resources: Resource[]
): Map<string, Map<number, string[]>> {
  const result = new Map<string, Map<number, string[]>>()

  for (const resource of resources) {
    const weekMap = new Map<number, string[]>()

    for (const project of projects) {
      if (!project.assignees.includes(resource.name)) continue
      const start = project.plannedStartWeek
      const end = start + project.plannedDuration - 1
      for (let w = start; w <= Math.min(end, 52); w++) {
        const existing = weekMap.get(w) ?? []
        weekMap.set(w, [...existing, project.name])
      }
    }
    result.set(resource.name, weekMap)
  }

  return result
}
