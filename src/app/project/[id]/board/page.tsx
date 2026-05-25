'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, GanttChart, Users } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { KanbanBoard } from '@/components/board/KanbanBoard'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Kanban } from 'lucide-react'

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

export default function BoardPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const { getProject } = useProjectStore()
  const { getTasksByProject } = useTaskStore()

  const project = getProject(projectId)
  const tasks = getTasksByProject(projectId)

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <EmptyState
          icon={Kanban}
          title="Projekt nenalezen"
          description="Projekt s tímto ID neexistuje."
          actionLabel="Zpět na přehled"
          onAction={() => router.push('/')}
        />
      </div>
    )
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
              <Button variant="ghost" size="sm" className="gap-2 text-blue-400">
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
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-auto p-6">
        <KanbanBoard projectId={projectId} />
      </div>
    </div>
  )
}
