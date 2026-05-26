import type { Project, ProjectTask, Resource } from '@/types'
import { addWorkdays, parseISODate, workdaysBetween, getWeekNumber } from './workdays'

interface ScheduleSlot {
  id: string
  name: string
  assignees: string[]
  startDate: string   // ISO date
  endDate: string     // ISO date (calculated from startDate + MD)
  sourceType: 'project' | 'task'
  sourceId: string
}

function toEndDate(startDate: string, md: number): string {
  if (!startDate) return startDate
  try {
    const start = parseISODate(startDate)
    const end = md > 0 ? addWorkdays(start, md - 1) : start
    const y = end.getFullYear()
    const m = String(end.getMonth() + 1).padStart(2, '0')
    const d = String(end.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  } catch {
    return startDate
  }
}

export function buildSlots(projects: Project[], tasks: ProjectTask[]): ScheduleSlot[] {
  const slots: ScheduleSlot[] = []

  for (const project of projects) {
    const projectTasks = tasks.filter((t) => t.projectId === project.id)

    if (projectTasks.length > 0) {
      for (const task of projectTasks) {
        if (!task.startDate) continue
        slots.push({
          id: `task-${task.id}`,
          name: `${project.name} – ${task.name}`,
          assignees: task.assignees,
          startDate: task.startDate,
          endDate: toEndDate(task.startDate, task.plannedDuration),
          sourceType: 'task',
          sourceId: task.id,
        })
      }
    } else {
      if (!project.startDate) continue
      // Prefer actual dates when set — conflict detection should reflect reality
      const effectiveStart = project.actualStartDate ?? project.startDate
      const effectiveDuration = project.actualDuration ?? project.plannedDuration
      slots.push({
        id: `project-${project.id}`,
        name: project.name,
        assignees: project.assignees,
        startDate: effectiveStart,
        endDate: toEndDate(effectiveStart, effectiveDuration),
        sourceType: 'project',
        sourceId: project.id,
      })
    }
  }

  return slots
}

// Inclusive ISO date string comparison: aStart <= bEnd && bStart <= aEnd
function dateRangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && bStart <= aEnd
}

// ISO week number from date string "YYYY-MM-DD"
function isoDateToWeek(dateStr: string): number {
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    return getWeekNumber(new Date(y, m - 1, d))
  } catch {
    return 1
  }
}

export function calculateConflicts(
  projects: Project[],
  tasks: ProjectTask[]
): {
  slotConflicts: Map<string, Set<number>>
  heatmapData: Map<string, Map<number, string[]>>
} {
  const slots = buildSlots(projects, tasks)

  // Group slots by assignee
  const assigneeSlots = new Map<string, ScheduleSlot[]>()
  for (const slot of slots) {
    for (const assignee of slot.assignees) {
      if (!assigneeSlots.has(assignee)) assigneeSlots.set(assignee, [])
      assigneeSlots.get(assignee)!.push(slot)
    }
  }

  // Detect conflicts via actual date-range overlap (not week numbers).
  // The old week-based approach caused false positives: two tasks in the same
  // ISO week but on non-overlapping days were wrongly flagged as conflicting.
  // It also broke across year boundaries (Dec week 52 → Jan week 1 reset).
  const conflictingIds = new Set<string>()
  for (const [, aSlots] of assigneeSlots) {
    for (let i = 0; i < aSlots.length; i++) {
      for (let j = i + 1; j < aSlots.length; j++) {
        const a = aSlots[i], b = aSlots[j]
        if (a.startDate && a.endDate && b.startDate && b.endDate &&
            dateRangesOverlap(a.startDate, a.endDate, b.startDate, b.endDate)) {
          conflictingIds.add(a.id)
          conflictingIds.add(b.id)
        }
      }
    }
  }

  // Build slotConflicts (Map<string, Set<number>> kept for type compatibility;
  // consumers only call .has() to check existence)
  const slotConflicts = new Map<string, Set<number>>()
  for (const id of conflictingIds) {
    slotConflicts.set(id, new Set([1]))
  }

  // Build heatmapData: assignee → ISO week → slot names (for CapacityHeatmap display)
  const heatmapData = new Map<string, Map<number, string[]>>()
  for (const [assignee, aSlots] of assigneeSlots) {
    const weekMap = new Map<number, string[]>()
    for (const slot of aSlots) {
      if (!slot.startDate || !slot.endDate) continue
      const sw = isoDateToWeek(slot.startDate)
      const ew = isoDateToWeek(slot.endDate)
      const lo = Math.min(sw, ew)
      const hi = Math.max(sw, ew)
      for (let w = lo; w <= Math.min(hi, 52); w++) {
        const existing = weekMap.get(w) ?? []
        weekMap.set(w, [...existing, slot.name])
      }
    }
    heatmapData.set(assignee, weekMap)
  }

  return { slotConflicts, heatmapData }
}

export function getHeatmapColor(projectCount: number): string {
  if (projectCount === 0) return 'transparent'
  if (projectCount === 1) return 'rgba(34, 197, 94, 0.6)'
  if (projectCount === 2) return 'rgba(234, 179, 8, 0.7)'
  return 'rgba(239, 68, 68, 0.8)'
}

export function countConflicts(projects: Project[], tasks: ProjectTask[]): number {
  const { slotConflicts } = calculateConflicts(projects, tasks)
  return slotConflicts.size
}

// Legacy function for backward compatibility — project-level only
export function calculateConflictsLegacy(
  projects: Project[],
  resources: Resource[]
): Map<string, Map<number, string[]>> {
  const result = new Map<string, Map<number, string[]>>()
  for (const resource of resources) {
    const weekMap = new Map<number, string[]>()
    for (const project of projects) {
      if (!project.assignees.includes(resource.name)) continue
      if (!project.startDate) continue
      const startWeek = isoDateToWeek(project.startDate)
      const endDate = toEndDate(project.startDate, project.plannedDuration)
      const endWeek = isoDateToWeek(endDate)
      for (let w = startWeek; w <= Math.min(endWeek, 52); w++) {
        const existing = weekMap.get(w) ?? []
        weekMap.set(w, [...existing, project.name])
      }
    }
    result.set(resource.name, weekMap)
  }
  return result
}

export { workdaysBetween }
