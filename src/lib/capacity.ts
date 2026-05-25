import type { Project, Resource } from '@/types'

export function calculateConflicts(
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

export function getHeatmapColor(projectCount: number): string {
  if (projectCount === 0) return 'transparent'
  if (projectCount === 1) return 'rgba(34, 197, 94, 0.6)'
  if (projectCount === 2) return 'rgba(234, 179, 8, 0.7)'
  return 'rgba(239, 68, 68, 0.8)'
}

export function countConflicts(
  projects: Project[],
  resources: Resource[]
): number {
  const conflicts = calculateConflicts(projects, resources)
  let count = 0
  for (const weekMap of conflicts.values()) {
    for (const projectNames of weekMap.values()) {
      if (projectNames.length >= 3) count++
    }
  }
  return count
}
