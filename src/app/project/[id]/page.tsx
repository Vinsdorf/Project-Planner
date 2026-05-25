'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { format, addDays } from 'date-fns'
import {
  ChevronLeft,
  LayoutGrid,
  Kanban,
  Users,
  Plus,
  Settings,
  GanttChart,
} from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { useTeamStore } from '@/stores/teamStore'
import { GanttChart as GanttChartComponent } from '@/components/gantt/GanttChart'
import { TaskTable } from '@/components/task-table/TaskTable'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Task } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  planning: 'Plánování',
  active: 'Aktivní',
  'on-hold': 'Pozastaveno',
  completed: 'Dokončeno',
}

const STATUS_VARIANTS: Record<string, 'info' | 'success' | 'warning' | 'secondary'> = {
  planning: 'info',
  active: 'success',
  'on-hold': 'warning',
  completed: 'secondary',
}

interface TaskFormData {
  name: string
  startDate: string
  endDate: string
  priority: Task['priority']
  status: Task['status']
  progress: number
  isMilestone: boolean
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const { getProject } = useProjectStore()
  const { getTasksByProject, addTask } = useTaskStore()
  const { members } = useTeamStore()

  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
    priority: 'medium',
    status: 'not-started',
    progress: 0,
    isMilestone: false,
  })

  const project = getProject(projectId)
  const tasks = getTasksByProject(projectId)

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <EmptyState
          icon={GanttChart}
          title="Projekt nenalezen"
          description="Projekt s tímto ID neexistuje."
          actionLabel="Zpět na přehled"
          onAction={() => router.push('/')}
        />
      </div>
    )
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskForm.name.trim()) return

    const maxOrder = tasks.reduce((max, t) => Math.max(max, t.sortOrder), -1)
    addTask({
      projectId,
      name: taskForm.name,
      startDate: taskForm.startDate,
      endDate: taskForm.endDate,
      duration: 5,
      progress: taskForm.progress,
      priority: taskForm.priority,
      status: taskForm.status,
      assigneeIds: [],
      dependencies: [],
      isMilestone: taskForm.isMilestone,
      sortOrder: maxOrder + 1,
    })
    setAddTaskOpen(false)
    setTaskForm({
      name: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
      priority: 'medium',
      status: 'not-started',
      progress: 0,
      isMilestone: false,
    })
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      <CommandPalette />

      {/* Header */}
      <header className="shrink-0 border-b border-[#2a2a2a] bg-[#0a0a0a]">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base font-bold text-white truncate">{project.name}</h1>
              <Badge variant={STATUS_VARIANTS[project.status]} className="shrink-0">
                {STATUS_LABELS[project.status]}
              </Badge>
            </div>
            <span className="text-xs text-[#555555] shrink-0">
              {tasks.length} úkolů
            </span>
          </div>

          <nav className="flex items-center gap-1">
            <Link href={`/project/${projectId}`}>
              <Button variant="ghost" size="sm" className="gap-2 text-blue-400">
                <GanttChart className="w-4 h-4" />
                <span className="hidden sm:inline">Gantt</span>
              </Button>
            </Link>
            <Link href={`/project/${projectId}/board`}>
              <Button variant="ghost" size="sm" className="gap-2 text-[#888888] hover:text-white">
                <Kanban className="w-4 h-4" />
                <span className="hidden sm:inline">Board</span>
              </Button>
            </Link>
            <Link href={`/project/${projectId}/resources`}>
              <Button variant="ghost" size="sm" className="gap-2 text-[#888888] hover:text-white">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Zdroje</span>
              </Button>
            </Link>
          </nav>

          <Button size="sm" className="gap-2 shrink-0" onClick={() => setAddTaskOpen(true)}>
            <Plus className="w-4 h-4" />
            Přidat úkol
          </Button>
        </div>
      </header>

      {/* Main content with split view */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="gantt" className="flex flex-col h-full">
          <div className="px-4 pt-2 pb-0 border-b border-[#1a1a1a] shrink-0">
            <TabsList className="bg-transparent p-0 gap-1 h-8">
              <TabsTrigger
                value="gantt"
                className="text-xs data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-3 h-8"
              >
                Ganttův diagram
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="text-xs data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-3 h-8"
              >
                Tabulka úkolů
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="gantt" className="flex-1 mt-0 overflow-hidden">
            <GanttChartComponent projectId={projectId} />
          </TabsContent>

          <TabsContent value="table" className="flex-1 mt-0 overflow-hidden">
            <TaskTable projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add task dialog */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Přidat úkol</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="space-y-2">
              <Label>Název úkolu *</Label>
              <Input
                value={taskForm.name}
                onChange={(e) => setTaskForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Název úkolu"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Začátek</Label>
                <Input
                  type="date"
                  value={taskForm.startDate}
                  onChange={(e) => setTaskForm((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Konec</Label>
                <Input
                  type="date"
                  value={taskForm.endDate}
                  onChange={(e) => setTaskForm((p) => ({ ...p, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priorita</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(v) => setTaskForm((p) => ({ ...p, priority: v as Task['priority'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Nízká</SelectItem>
                    <SelectItem value="medium">Střední</SelectItem>
                    <SelectItem value="high">Vysoká</SelectItem>
                    <SelectItem value="critical">Kritická</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stav</Label>
                <Select
                  value={taskForm.status}
                  onValueChange={(v) => setTaskForm((p) => ({ ...p, status: v as Task['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Nezahájeno</SelectItem>
                    <SelectItem value="in-progress">Probíhá</SelectItem>
                    <SelectItem value="completed">Dokončeno</SelectItem>
                    <SelectItem value="blocked">Blokováno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="milestone"
                checked={taskForm.isMilestone}
                onChange={(e) => setTaskForm((p) => ({ ...p, isMilestone: e.target.checked }))}
                className="rounded border-[#2a2a2a]"
              />
              <Label htmlFor="milestone">Milník</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddTaskOpen(false)}>
                Zrušit
              </Button>
              <Button type="submit">Přidat</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
