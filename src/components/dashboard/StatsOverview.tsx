'use client'

import React from 'react'
import { FolderKanban, CheckCircle2, AlertTriangle, Flag } from 'lucide-react'
import { Project, Task } from '@/types'
import { differenceInDays, parseISO } from 'date-fns'

interface StatsOverviewProps {
  projects: Project[]
  tasks: Task[]
}

export function StatsOverview({ projects, tasks }: StatsOverviewProps) {
  const activeProjects = projects.filter((p) => p.status === 'active').length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length
  const upcomingMilestones = tasks.filter((t) => {
    if (!t.isMilestone) return false
    const days = differenceInDays(parseISO(t.endDate), new Date())
    return days >= 0 && days <= 7
  }).length

  const stats = [
    {
      label: 'Aktivní projekty',
      value: activeProjects,
      total: projects.length,
      icon: FolderKanban,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Dokončené úkoly',
      value: completedTasks,
      total: tasks.length,
      icon: CheckCircle2,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Blokované úkoly',
      value: blockedTasks,
      total: tasks.length,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Milníky tento týden',
      value: upcomingMilestones,
      total: tasks.filter((t) => t.isMilestone).length,
      icon: Flag,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#888888]">{stat.label}</span>
            <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stat.value}</div>
          {stat.total > 0 && (
            <div className="text-xs text-[#555555] mt-1">z {stat.total} celkem</div>
          )}
        </div>
      ))}
    </div>
  )
}
