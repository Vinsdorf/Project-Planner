import { v4 as uuidv4 } from 'uuid'
import { addDays, format } from 'date-fns'
import { Project, Task, TeamMember } from '@/types'

export function generateDemoData(): {
  project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  tasks: (Omit<Task, 'id'> & { tempParentKey?: string; tempKey?: string })[]
  members: Omit<TeamMember, 'id'>[]
} {
  const today = new Date()
  const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

  const members: Omit<TeamMember, 'id'>[] = [
    {
      name: 'Marie Nováková',
      role: 'Project Manager',
      email: 'marie@example.cz',
      color: '#8b5cf6',
      capacity: 8,
      costPerHour: 800,
    },
    {
      name: 'Jana Dvořáková',
      role: 'UX/UI Designer',
      email: 'jana@example.cz',
      color: '#ec4899',
      capacity: 8,
      costPerHour: 700,
    },
    {
      name: 'Petr Svoboda',
      role: 'Frontend Developer',
      email: 'petr@example.cz',
      color: '#06b6d4',
      capacity: 8,
      costPerHour: 900,
    },
    {
      name: 'Tomáš Kratochvíl',
      role: 'Backend Developer',
      email: 'tomas@example.cz',
      color: '#10b981',
      capacity: 8,
      costPerHour: 950,
    },
  ]

  const project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'Redesign webu',
    description: 'Kompletní redesign firemního webu s novým UX/UI a moderní architekturou.',
    startDate: fmt(today),
    endDate: fmt(addDays(today, 84)),
    status: 'active',
  }

  type TaskTemplate = Omit<Task, 'id'> & { tempParentKey?: string; tempKey?: string }
  const tasks: TaskTemplate[] = []

  // Group 1: Discovery & Research (2 weeks)
  const g1Start = today
  const g1End = addDays(g1Start, 13)

  tasks.push({
    projectId: '',
    name: '1. Průzkum a analýza',
    description: 'Fáze průzkumu a sběru požadavků',
    startDate: fmt(g1Start),
    endDate: fmt(g1End),
    duration: 14,
    progress: 80,
    priority: 'high',
    status: 'in-progress',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 0,
    tempKey: 'g1',
  })

  tasks.push({
    projectId: '',
    name: 'Analýza konkurence',
    description: 'Analýza konkurenčních webů a best practices',
    startDate: fmt(g1Start),
    endDate: fmt(addDays(g1Start, 4)),
    duration: 5,
    progress: 100,
    priority: 'medium',
    status: 'completed',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 1,
    tempParentKey: 'g1',
  })

  tasks.push({
    projectId: '',
    name: 'Uživatelský výzkum',
    description: 'Rozhovory s uživateli a analýza chování',
    startDate: fmt(addDays(g1Start, 2)),
    endDate: fmt(addDays(g1Start, 8)),
    duration: 7,
    progress: 70,
    priority: 'high',
    status: 'in-progress',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 2,
    tempParentKey: 'g1',
  })

  tasks.push({
    projectId: '',
    name: 'Definice požadavků',
    description: 'Vytvoření specifikace požadavků projektu',
    startDate: fmt(addDays(g1Start, 7)),
    endDate: fmt(g1End),
    duration: 7,
    progress: 30,
    priority: 'high',
    status: 'in-progress',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 3,
    tempParentKey: 'g1',
  })

  tasks.push({
    projectId: '',
    name: 'Průzkum dokončen',
    description: 'Milník: fáze průzkumu dokončena',
    startDate: fmt(g1End),
    endDate: fmt(g1End),
    duration: 1,
    progress: 0,
    priority: 'high',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: true,
    sortOrder: 4,
  })

  // Group 2: Design (3 weeks)
  const g2Start = addDays(g1End, 1)
  const g2End = addDays(g2Start, 20)

  tasks.push({
    projectId: '',
    name: '2. Design',
    description: 'Fáze návrhu UX/UI',
    startDate: fmt(g2Start),
    endDate: fmt(g2End),
    duration: 21,
    progress: 0,
    priority: 'high',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 5,
    tempKey: 'g2',
  })

  tasks.push({
    projectId: '',
    name: 'Wireframing',
    description: 'Tvorba drátěných modelů stránek',
    startDate: fmt(g2Start),
    endDate: fmt(addDays(g2Start, 6)),
    duration: 7,
    progress: 0,
    priority: 'medium',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 6,
    tempParentKey: 'g2',
  })

  tasks.push({
    projectId: '',
    name: 'Design system',
    description: 'Vytvoření design systému a komponent',
    startDate: fmt(addDays(g2Start, 5)),
    endDate: fmt(addDays(g2Start, 13)),
    duration: 9,
    progress: 0,
    priority: 'high',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 7,
    tempParentKey: 'g2',
  })

  tasks.push({
    projectId: '',
    name: 'UI prototyp',
    description: 'Interaktivní prototyp v Figma',
    startDate: fmt(addDays(g2Start, 12)),
    endDate: fmt(g2End),
    duration: 9,
    progress: 0,
    priority: 'high',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 8,
    tempParentKey: 'g2',
  })

  tasks.push({
    projectId: '',
    name: 'Design schválen',
    description: 'Milník: design schválen klientem',
    startDate: fmt(g2End),
    endDate: fmt(g2End),
    duration: 1,
    progress: 0,
    priority: 'high',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: true,
    sortOrder: 9,
  })

  // Group 3: Development (4 weeks)
  const g3Start = addDays(g2End, 1)
  const g3End = addDays(g3Start, 27)

  tasks.push({
    projectId: '',
    name: '3. Vývoj',
    description: 'Fáze implementace',
    startDate: fmt(g3Start),
    endDate: fmt(g3End),
    duration: 28,
    progress: 0,
    priority: 'high',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 10,
    tempKey: 'g3',
  })

  tasks.push({
    projectId: '',
    name: 'Frontend setup',
    description: 'Inicializace projektu a základní architektura',
    startDate: fmt(g3Start),
    endDate: fmt(addDays(g3Start, 4)),
    duration: 5,
    progress: 0,
    priority: 'medium',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 11,
    tempParentKey: 'g3',
  })

  tasks.push({
    projectId: '',
    name: 'Backend API',
    description: 'Implementace REST API',
    startDate: fmt(g3Start),
    endDate: fmt(addDays(g3Start, 13)),
    duration: 14,
    progress: 0,
    priority: 'high',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 12,
    tempParentKey: 'g3',
  })

  tasks.push({
    projectId: '',
    name: 'UI implementace',
    description: 'Implementace UI komponent a stránek',
    startDate: fmt(addDays(g3Start, 4)),
    endDate: fmt(addDays(g3Start, 20)),
    duration: 17,
    progress: 0,
    priority: 'high',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 13,
    tempParentKey: 'g3',
  })

  tasks.push({
    projectId: '',
    name: 'Integrace',
    description: 'Propojení frontendu s backendem',
    startDate: fmt(addDays(g3Start, 18)),
    endDate: fmt(g3End),
    duration: 10,
    progress: 0,
    priority: 'critical',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 14,
    tempParentKey: 'g3',
  })

  tasks.push({
    projectId: '',
    name: 'Vývoj dokončen',
    description: 'Milník: vývoj dokončen',
    startDate: fmt(g3End),
    endDate: fmt(g3End),
    duration: 1,
    progress: 0,
    priority: 'high',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: true,
    sortOrder: 15,
  })

  // Group 4: Testing & Launch (2 weeks)
  const g4Start = addDays(g3End, 1)
  const g4End = addDays(g4Start, 13)

  tasks.push({
    projectId: '',
    name: '4. Testování a spuštění',
    description: 'Fáze QA a nasazení',
    startDate: fmt(g4Start),
    endDate: fmt(g4End),
    duration: 14,
    progress: 0,
    priority: 'high',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 16,
    tempKey: 'g4',
  })

  tasks.push({
    projectId: '',
    name: 'QA testování',
    description: 'Testování funkcionality a bug fixing',
    startDate: fmt(g4Start),
    endDate: fmt(addDays(g4Start, 7)),
    duration: 8,
    progress: 0,
    priority: 'high',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 17,
    tempParentKey: 'g4',
  })

  tasks.push({
    projectId: '',
    name: 'Performance optimalizace',
    description: 'Optimalizace výkonu a SEO',
    startDate: fmt(addDays(g4Start, 5)),
    endDate: fmt(addDays(g4Start, 10)),
    duration: 6,
    progress: 0,
    priority: 'medium',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 18,
    tempParentKey: 'g4',
  })

  tasks.push({
    projectId: '',
    name: 'Nasazení na produkci',
    description: 'Deployment a konfigurace produkčního prostředí',
    startDate: fmt(addDays(g4Start, 10)),
    endDate: fmt(g4End),
    duration: 4,
    progress: 0,
    priority: 'critical',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: false,
    sortOrder: 19,
    tempParentKey: 'g4',
  })

  tasks.push({
    projectId: '',
    name: 'Spuštění',
    description: 'Milník: web spuštěn!',
    startDate: fmt(g4End),
    endDate: fmt(g4End),
    duration: 1,
    progress: 0,
    priority: 'critical',
    status: 'not-started',
    assigneeIds: [],
    dependencies: [],
    isMilestone: true,
    sortOrder: 20,
  })

  return { project, tasks, members }
}
