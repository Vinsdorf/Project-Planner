import type { ProjectPhase, Priority, Resource, Project, ProjectTask } from '@/types'

export const TEAMS = ['DEV E-SHOP', 'Business IT', 'DEV POS', 'Content', 'CX', 'Online marketing', 'Business', 'Kuchyně']
export const PHASES: ProjectPhase[] = ['Idea', 'Čeká na schválení', 'Zařazeno', 'Rozpracováno', 'Zastaveno', 'Hotovo Q1', 'Hotovo Q2', 'Hotovo Q3', 'Hotovo Q4']
export const PRIORITIES: Priority[] = ['Highest', 'High', 'Medium', 'Low', 'Lowest']
export const THEMES = ['DWH', 'Helpdesk', 'Infra', 'Mustek', 'HR', 'Expanze SK']
export const CURRENT_YEAR = 2026

export const DEMO_RESOURCES: Resource[] = [
  { id: 'r1', name: 'Ondřej', role: 'Developer', team: 'DEV E-SHOP', color: '#3b82f6', capacityHoursPerDay: 8, isActive: true },
  { id: 'r2', name: 'Fridrich', role: 'Developer', team: 'DEV E-SHOP', color: '#22c55e', capacityHoursPerDay: 8, isActive: true },
  { id: 'r3', name: 'Martin', role: 'Developer', team: 'Business IT', color: '#f59e0b', capacityHoursPerDay: 8, isActive: true },
  { id: 'r4', name: 'David', role: 'Developer', team: 'Business IT', color: '#8b5cf6', capacityHoursPerDay: 8, isActive: true },
  { id: 'r5', name: 'George', role: 'Developer', team: 'DEV POS', color: '#14b8a6', capacityHoursPerDay: 8, isActive: true },
  { id: 'r6', name: 'Poschl', role: 'PM', team: 'Business IT', color: '#f97316', capacityHoursPerDay: 8, isActive: true },
  { id: 'r7', name: 'Rohan', role: 'Developer', team: 'DEV E-SHOP', color: '#ec4899', capacityHoursPerDay: 8, isActive: true },
  { id: 'r8', name: 'Košťál', role: 'Developer', team: 'DEV E-SHOP', color: '#06b6d4', capacityHoursPerDay: 8, isActive: true },
]

export const DEMO_PROJECTS: Project[] = [
  { id: 'p1', name: 'Start projektu FE 2.0 v React Native', team: 'DEV E-SHOP', assignees: ['Ondřej'], phase: 'Rozpracováno', type: 'Projekt', statusOverall: 'Amber', statusScope: 'Green', statusTime: 'Amber', statusBudget: 'Green', priority: 'Highest', startDate: '2026-01-05', plannedDuration: 200, percentComplete: 0.4, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p2', name: 'SK - Revize dodacích termínů', team: 'DEV E-SHOP', assignees: ['Fridrich'], phase: 'Rozpracováno', type: 'Vylepšení', statusOverall: 'Green', statusScope: 'Green', statusTime: 'Green', statusBudget: 'Green', priority: 'High', startDate: '2026-04-13', plannedDuration: 40, percentComplete: 0.8, sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p3', name: 'Nasazení integračního můstku 2.0', team: 'Business IT', assignees: ['Ondřej', 'Martin'], phase: 'Rozpracováno', type: 'Projekt', statusOverall: 'Amber', statusScope: 'Amber', statusTime: 'Green', statusBudget: 'Green', priority: 'High', startDate: '2026-03-09', plannedDuration: 85, percentComplete: 0.6, sortOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p4', name: 'Nasazení Luigi\'s Box – search', team: 'DEV E-SHOP', assignees: ['Ondřej'], phase: 'Rozpracováno', type: 'Projekt', statusOverall: 'Green', statusScope: 'Green', statusTime: 'Green', statusBudget: 'Green', priority: 'High', startDate: '2026-02-02', plannedDuration: 110, percentComplete: 0.7, sortOrder: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p5', name: 'Nový modul kuchyně', team: 'DEV E-SHOP', assignees: ['Ondřej', 'Košťál'], phase: 'Rozpracováno', type: 'Projekt', statusOverall: 'Red', statusScope: 'Amber', statusTime: 'Red', statusBudget: 'Green', priority: 'Medium', startDate: '2026-01-05', plannedDuration: 150, percentComplete: 0.4, sortOrder: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p6', name: 'CRM integrace Dynamics 365', team: 'Business IT', assignees: ['David', 'Poschl'], phase: 'Zařazeno', type: 'Projekt', statusOverall: 'Green', statusScope: 'Green', statusTime: 'Green', statusBudget: 'Amber', priority: 'High', startDate: '2026-05-11', plannedDuration: 75, percentComplete: 0, sortOrder: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p7', name: 'Redesign POS pokladního modulu', team: 'DEV POS', assignees: ['George'], phase: 'Rozpracováno', type: 'Projekt', statusOverall: 'Green', statusScope: 'Green', statusTime: 'Green', statusBudget: 'Green', priority: 'Medium', startDate: '2026-02-16', plannedDuration: 60, percentComplete: 0.3, sortOrder: 6, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p8', name: 'Online marketing automatizace', team: 'Online marketing', assignees: ['Rohan'], phase: 'Idea', type: 'Vylepšení', statusOverall: 'N/A', statusScope: 'N/A', statusTime: 'N/A', statusBudget: 'N/A', priority: 'Low', startDate: '2026-07-27', plannedDuration: 50, percentComplete: 0, sortOrder: 7, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p9', name: 'Helpdesk ticketing systém', team: 'Business IT', assignees: ['Martin'], phase: 'Hotovo Q1', type: 'Projekt', statusOverall: 'Green', statusScope: 'Green', statusTime: 'Green', statusBudget: 'Green', priority: 'High', startDate: '2026-01-05', plannedDuration: 50, percentComplete: 1, sortOrder: 8, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p10', name: 'SK expanze - nový sklad', team: 'Business', assignees: ['Poschl', 'David'], phase: 'Čeká na schválení', type: 'Projekt', statusOverall: 'Amber', statusScope: 'Green', statusTime: 'Amber', statusBudget: 'Red', priority: 'Highest', startDate: '2026-06-15', plannedDuration: 100, percentComplete: 0, sortOrder: 9, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

export const DEMO_TASKS: ProjectTask[] = [
  // FE 2.0 (p1) - Ondřej
  { id: 't1', projectId: 'p1', name: 'Zadání', assignees: ['Ondřej'], startDate: '2026-01-05', plannedDuration: 15, percentComplete: 1, sortOrder: 0 },
  { id: 't2', projectId: 'p1', name: 'Analýza', assignees: ['Ondřej'], startDate: '2026-01-26', plannedDuration: 20, percentComplete: 0.8, sortOrder: 1 },
  { id: 't3', projectId: 'p1', name: 'Vývoj', assignees: ['Ondřej', 'Rohan'], startDate: '2026-02-23', plannedDuration: 120, percentComplete: 0.3, sortOrder: 2 },
  { id: 't4', projectId: 'p1', name: 'Test', assignees: ['Ondřej'], startDate: '2026-08-17', plannedDuration: 30, percentComplete: 0, sortOrder: 3 },
  { id: 't5', projectId: 'p1', name: 'Release', assignees: ['Ondřej'], startDate: '2026-10-05', plannedDuration: 15, percentComplete: 0, sortOrder: 4 },

  // Integrační můstek (p3) - Ondřej, Martin
  { id: 't6', projectId: 'p3', name: 'Zadání', assignees: ['Ondřej', 'Martin'], startDate: '2026-03-09', plannedDuration: 10, percentComplete: 1, sortOrder: 0 },
  { id: 't7', projectId: 'p3', name: 'Analýza', assignees: ['Martin'], startDate: '2026-03-23', plannedDuration: 15, percentComplete: 0.9, sortOrder: 1 },
  { id: 't8', projectId: 'p3', name: 'Vývoj', assignees: ['Ondřej', 'Martin'], startDate: '2026-04-13', plannedDuration: 40, percentComplete: 0.5, sortOrder: 2 },
  { id: 't9', projectId: 'p3', name: 'Test', assignees: ['Martin'], startDate: '2026-06-15', plannedDuration: 15, percentComplete: 0, sortOrder: 3 },
  { id: 't10', projectId: 'p3', name: 'Release', assignees: ['Ondřej'], startDate: '2026-07-06', plannedDuration: 5, percentComplete: 0, sortOrder: 4 },

  // Luigi's Box (p4) - Ondřej
  { id: 't11', projectId: 'p4', name: 'Zadání', assignees: ['Ondřej'], startDate: '2026-02-02', plannedDuration: 10, percentComplete: 1, sortOrder: 0 },
  { id: 't12', projectId: 'p4', name: 'Vývoj', assignees: ['Ondřej', 'Košťál'], startDate: '2026-02-16', plannedDuration: 75, percentComplete: 0.7, sortOrder: 1 },
  { id: 't13', projectId: 'p4', name: 'Test', assignees: ['Ondřej'], startDate: '2026-06-01', plannedDuration: 20, percentComplete: 0.2, sortOrder: 2 },
  { id: 't14', projectId: 'p4', name: 'Release', assignees: ['Ondřej'], startDate: '2026-07-06', plannedDuration: 5, percentComplete: 0, sortOrder: 3 },

  // Nový modul kuchyně (p5) - Ondřej, Košťál
  { id: 't15', projectId: 'p5', name: 'Analýza', assignees: ['Ondřej'], startDate: '2026-01-05', plannedDuration: 20, percentComplete: 1, sortOrder: 0 },
  { id: 't16', projectId: 'p5', name: 'Vývoj', assignees: ['Košťál', 'Ondřej'], startDate: '2026-02-02', plannedDuration: 100, percentComplete: 0.4, sortOrder: 1 },
  { id: 't17', projectId: 'p5', name: 'Test', assignees: ['Košťál'], startDate: '2026-07-06', plannedDuration: 20, percentComplete: 0, sortOrder: 2 },
  { id: 't18', projectId: 'p5', name: 'Release', assignees: ['Ondřej', 'Košťál'], startDate: '2026-08-03', plannedDuration: 5, percentComplete: 0, sortOrder: 3 },
]
