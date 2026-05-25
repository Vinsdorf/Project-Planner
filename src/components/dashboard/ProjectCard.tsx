'use client'

import React from 'react'
import Link from 'next/link'
import { format, parseISO, differenceInDays } from 'date-fns'
import { cs } from 'date-fns/locale'
import { MoreHorizontal, Calendar, CheckCircle2, AlertCircle, Clock, Trash2, Edit2 } from 'lucide-react'
import { Project, Task } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const STATUS_LABELS: Record<Project['status'], string> = {
  planning: 'Plánování',
  active: 'Aktivní',
  'on-hold': 'Pozastaveno',
  completed: 'Dokončeno',
}

const STATUS_VARIANTS: Record<Project['status'], 'info' | 'success' | 'warning' | 'secondary'> = {
  planning: 'info',
  active: 'success',
  'on-hold': 'warning',
  completed: 'secondary',
}

interface ProjectCardProps {
  project: Project
  tasks: Task[]
  onDelete: (id: string) => void
  onEdit: (project: Project) => void
}

export function ProjectCard({ project, tasks, onDelete, onEdit }: ProjectCardProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length
  const milestones = tasks.filter((t) => t.isMilestone)
  const upcomingMilestones = milestones.filter((t) => {
    const daysLeft = differenceInDays(parseISO(t.endDate), new Date())
    return daysLeft >= 0 && daysLeft <= 14
  })

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <Card className="group hover:border-blue-500/30 transition-colors duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/project/${project.id}`} className="block">
              <h3 className="font-semibold text-white text-base truncate hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
            </Link>
            {project.description && (
              <p className="text-sm text-[#888888] mt-1 line-clamp-2">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={STATUS_VARIANTS[project.status]}>
              {STATUS_LABELS[project.status]}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Upravit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400 focus:text-red-400"
                  onClick={() => onDelete(project.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Smazat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#888888]">Průběh</span>
            <span className="text-white font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#111111] rounded-md p-2 text-center">
            <div className="text-lg font-bold text-white">{totalTasks}</div>
            <div className="text-xs text-[#888888]">Úkolů</div>
          </div>
          <div className="bg-[#111111] rounded-md p-2 text-center">
            <div className="text-lg font-bold text-green-400">{completedTasks}</div>
            <div className="text-xs text-[#888888]">Dokončeno</div>
          </div>
          <div className="bg-[#111111] rounded-md p-2 text-center">
            <div className={`text-lg font-bold ${blockedTasks > 0 ? 'text-red-400' : 'text-[#555555]'}`}>
              {blockedTasks}
            </div>
            <div className="text-xs text-[#888888]">Blokováno</div>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-[#888888]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(parseISO(project.startDate), 'dd.MM.yyyy')}
          </span>
          {project.endDate && (
            <>
              <span>→</span>
              <span>{format(parseISO(project.endDate), 'dd.MM.yyyy')}</span>
            </>
          )}
        </div>

        {/* Upcoming milestones */}
        {upcomingMilestones.length > 0 && (
          <div className="border-t border-[#2a2a2a] pt-3">
            <div className="text-xs text-[#888888] mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Blížící se milníky
            </div>
            {upcomingMilestones.slice(0, 2).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs py-0.5">
                <span className="text-white truncate max-w-[60%]">{m.name}</span>
                <span className="text-yellow-400 shrink-0">
                  {differenceInDays(parseISO(m.endDate), new Date())} dní
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
