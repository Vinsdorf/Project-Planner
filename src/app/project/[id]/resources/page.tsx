'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, GanttChart, Kanban, Plus, Users } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { useTeamStore } from '@/stores/teamStore'
import { ResourceChart } from '@/components/resources/ResourceChart'
import { TeamMemberCard } from '@/components/resources/TeamMemberCard'
import { AbsenceCalendar } from '@/components/resources/AbsenceCalendar'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { TeamMember } from '@/types'

interface MemberFormData {
  name: string
  role: string
  email: string
  color: string
  capacity: number
  costPerHour: number
}

const MEMBER_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b',
  '#06b6d4', '#ef4444', '#84cc16', '#f97316', '#6366f1',
]

const DEFAULT_FORM: MemberFormData = {
  name: '',
  role: '',
  email: '',
  color: MEMBER_COLORS[0],
  capacity: 8,
  costPerHour: 0,
}

const STATUS_VARIANTS: Record<string, 'info' | 'success' | 'warning' | 'secondary'> = {
  planning: 'info',
  active: 'success',
  'on-hold': 'warning',
  completed: 'secondary',
}

const STATUS_LABELS: Record<string, string> = {
  planning: 'Plánování',
  active: 'Aktivní',
  'on-hold': 'Pozastaveno',
  completed: 'Dokončeno',
}

export default function ResourcesPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const { getProject } = useProjectStore()
  const { getTasksByProject } = useTaskStore()
  const { members, timeOffs, addMember, updateMember, deleteMember } = useTeamStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState<MemberFormData>(DEFAULT_FORM)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  const project = getProject(projectId)
  const tasks = getTasksByProject(projectId)

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <EmptyState
          icon={Users}
          title="Projekt nenalezen"
          description="Projekt s tímto ID neexistuje."
          actionLabel="Zpět na přehled"
          onAction={() => router.push('/')}
        />
      </div>
    )
  }

  const openCreateModal = () => {
    setEditingMember(null)
    setFormData({ ...DEFAULT_FORM, color: MEMBER_COLORS[members.length % MEMBER_COLORS.length] })
    setModalOpen(true)
  }

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email || '',
      color: member.color,
      capacity: member.capacity,
      costPerHour: member.costPerHour || 0,
    })
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const memberData = {
      name: formData.name,
      role: formData.role,
      email: formData.email || undefined,
      color: formData.color,
      capacity: formData.capacity,
      costPerHour: formData.costPerHour || undefined,
    }

    if (editingMember) {
      updateMember(editingMember.id, memberData)
    } else {
      addMember(memberData)
    }
    setModalOpen(false)
  }

  const getMemberUtilization = (memberId: string) => {
    const memberTasks = tasks.filter((t) => t.assigneeIds.includes(memberId) && !t.isMilestone)
    if (memberTasks.length === 0) return 0
    const member = members.find((m) => m.id === memberId)
    if (!member) return 0
    // Simplified: count total duration vs capacity over 2 weeks
    const totalHours = memberTasks.reduce((sum, t) => sum + t.duration * 8, 0)
    const capacityHours = member.capacity * 10 // 10 workdays
    return Math.round((totalHours / capacityHours) * 100)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
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
            <h1 className="text-base font-bold text-white truncate">{project.name}</h1>
            <Badge variant={STATUS_VARIANTS[project.status]}>
              {STATUS_LABELS[project.status]}
            </Badge>
          </div>

          <nav className="flex items-center gap-1">
            <Link href={`/project/${projectId}`}>
              <Button variant="ghost" size="sm" className="gap-2 text-[#888888] hover:text-white">
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
              <Button variant="ghost" size="sm" className="gap-2 text-blue-400">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Zdroje</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Resource chart */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Vytížení týmu</h2>
            <div className="flex gap-1 bg-[#111111] rounded-md border border-[#2a2a2a] p-0.5">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                  viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-[#888888] hover:text-white'
                }`}
              >
                Týdny
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-[#888888] hover:text-white'
                }`}
              >
                Měsíce
              </button>
            </div>
          </div>

          {members.length > 0 ? (
            <ResourceChart tasks={tasks} members={members} viewMode={viewMode} />
          ) : (
            <div className="h-48 flex items-center justify-center text-[#555555] text-sm">
              Přidejte členy týmu pro zobrazení grafu
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-[#888888]">
              <div className="w-8 h-0.5 bg-red-500 opacity-50" />
              Kapacita 100%
            </div>
            <div className="flex items-center gap-2 text-xs text-[#888888]">
              <div className="w-8 h-0.5 bg-yellow-500 opacity-30" />
              Doporučený max. 80%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team members */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Tým ({members.length})</h2>
              <Button size="sm" className="gap-2" onClick={openCreateModal}>
                <Plus className="w-4 h-4" />
                Přidat člena
              </Button>
            </div>

            {members.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Žádní členové týmu"
                description="Přidejte členy týmu pro plánování zdrojů."
                actionLabel="Přidat člena"
                onAction={openCreateModal}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    taskCount={tasks.filter((t) => t.assigneeIds.includes(member.id)).length}
                    utilization={getMemberUtilization(member.id)}
                    onEdit={openEditModal}
                    onDelete={deleteMember}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Absence calendar */}
          <div>
            <AbsenceCalendar timeOffs={timeOffs} members={members} />
          </div>
        </div>
      </main>

      {/* Member modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Upravit člena týmu' : 'Přidat člena týmu'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Jméno *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Celé jméno"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                placeholder="Např. Frontend Developer"
              />
            </div>

            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kapacita (hod/den)</Label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={formData.capacity}
                  onChange={(e) => setFormData((p) => ({ ...p, capacity: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Cena (Kč/hod)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.costPerHour}
                  onChange={(e) => setFormData((p) => ({ ...p, costPerHour: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Barva</Label>
              <div className="flex flex-wrap gap-2">
                {MEMBER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                      formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((p) => ({ ...p, color }))}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Zrušit
              </Button>
              <Button type="submit">
                {editingMember ? 'Uložit' : 'Přidat'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
