'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, LayoutDashboard, Search, Command } from 'lucide-react'
import { format } from 'date-fns'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { useTeamStore } from '@/stores/teamStore'
import { useUiStore } from '@/stores/uiStore'
import { generateDemoData } from '@/lib/storage'
import { ProjectCard } from '@/components/dashboard/ProjectCard'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Project } from '@/types'

interface ProjectFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  status: Project['status']
}

const DEFAULT_FORM: ProjectFormData = {
  name: '',
  description: '',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  endDate: '',
  status: 'planning',
}

export default function DashboardPage() {
  const { projects, addProject, updateProject, deleteProject } = useProjectStore()
  const { addTask, getTasksByProject } = useTaskStore()
  const { members, addMember } = useTeamStore()
  const { initialized, setInitialized, setCommandPaletteOpen } = useUiStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>(DEFAULT_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Initialize demo data
  useEffect(() => {
    if (!initialized && projects.length === 0) {
      const { project, tasks: demoTasks, members: demoMembers } = generateDemoData()

      // Add members first
      const memberIds: string[] = []
      for (const member of demoMembers) {
        const id = addMember(member)
        memberIds.push(id)
      }

      // Add project
      const projectId = addProject(project)

      // First pass: add parent tasks (those with tempKey but no tempParentKey) and build key->id map
      const keyToId = new Map<string, string>()
      const remainingTasks: typeof demoTasks = []

      for (const rawTask of demoTasks) {
        const task = rawTask as typeof rawTask & { tempKey?: string; tempParentKey?: string }
        if (task.tempKey && !task.tempParentKey) {
          const { tempKey, tempParentKey, ...cleanTask } = task as { tempKey?: string; tempParentKey?: string } & typeof rawTask
          const taskId = addTask({ ...cleanTask, projectId, assigneeIds: [memberIds[0]] })
          keyToId.set(task.tempKey, taskId)
        } else {
          remainingTasks.push(rawTask)
        }
      }

      // Second pass: add child tasks and milestones
      remainingTasks.forEach((rawTask, i) => {
        const task = rawTask as typeof rawTask & { tempKey?: string; tempParentKey?: string }
        const { tempKey, tempParentKey, ...cleanTask } = task as { tempKey?: string; tempParentKey?: string } & typeof rawTask
        const parentId = tempParentKey ? keyToId.get(tempParentKey) : undefined
        const assigneeIds = !task.isMilestone ? [memberIds[i % memberIds.length]] : []
        addTask({ ...cleanTask, projectId, parentId, assigneeIds })
      })

      setInitialized(true)
    }
  }, [initialized, projects.length, addProject, addTask, addMember, setInitialized])

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const allTasks = projects.flatMap((p) => getTasksByProject(p.id))

  const openCreateModal = () => {
    setEditingProject(null)
    setFormData(DEFAULT_FORM)
    setModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      startDate: project.startDate,
      endDate: project.endDate || '',
      status: project.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingProject) {
      updateProject(editingProject.id, {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        status: formData.status,
      })
    } else {
      addProject({
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        status: formData.status,
      })
    }
    setModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <CommandPalette />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">ProjectFlow</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 text-sm text-[#888888] bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 py-1.5 hover:bg-[#222222] transition-colors"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Hledat...</span>
              <kbd className="ml-2 text-[10px] bg-[#2a2a2a] px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>
            <Button onClick={openCreateModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Nový projekt
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <StatsOverview projects={projects} tasks={allTasks} />

        {/* Projects section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Projekty</h2>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Filtrovat projekty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 h-8 text-sm"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          projects.length === 0 ? (
            <EmptyState
              icon={LayoutDashboard}
              title="Zatím žádné projekty"
              description="Vytvořte svůj první projekt a začněte plánovat."
              actionLabel="Vytvořit projekt"
              onAction={openCreateModal}
            />
          ) : (
            <EmptyState
              icon={Search}
              title="Žádné výsledky"
              description="Nebyl nalezen žádný projekt odpovídající vašemu dotazu."
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                tasks={getTasksByProject(project.id)}
                onDelete={(id) => setDeleteId(id)}
                onEdit={openEditModal}
              />
            ))}
          </div>
        )}
      </main>

      {/* Project modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Upravit projekt' : 'Nový projekt'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Název projektu *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Název projektu"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Popis projektu..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Datum zahájení</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Datum ukončení</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Stav</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData((p) => ({ ...p, status: v as Project['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Plánování</SelectItem>
                  <SelectItem value="active">Aktivní</SelectItem>
                  <SelectItem value="on-hold">Pozastaveno</SelectItem>
                  <SelectItem value="completed">Dokončeno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Zrušit
              </Button>
              <Button type="submit">
                {editingProject ? 'Uložit' : 'Vytvořit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Smazat projekt"
        description="Opravdu chcete smazat tento projekt? Všechny úkoly budou také odstraněny."
        confirmLabel="Smazat"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteProject(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
