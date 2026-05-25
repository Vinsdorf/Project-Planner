'use client'

import React, { useState } from 'react'
import { Pencil, Trash2, Mail } from 'lucide-react'
import { TeamMember } from '@/types'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

interface TeamMemberCardProps {
  member: TeamMember
  taskCount: number
  utilization: number // 0-100+
  onEdit: (member: TeamMember) => void
  onDelete: (id: string) => void
}

export function TeamMemberCard({ member, taskCount, utilization, onEdit, onDelete }: TeamMemberCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const utilizationColor =
    utilization >= 100 ? 'bg-red-500' : utilization >= 80 ? 'bg-yellow-500' : 'bg-green-500'
  const utilizationTextColor =
    utilization >= 100 ? 'text-red-400' : utilization >= 80 ? 'text-yellow-400' : 'text-green-400'

  return (
    <>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#3a3a3a] transition-colors group">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: member.color }}
          >
            {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-white text-sm">{member.name}</div>
                <div className="text-xs text-[#888888]">{member.role}</div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(member)}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-red-400"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {member.email && (
              <div className="flex items-center gap-1 text-xs text-[#555555] mt-1">
                <Mail className="w-3 h-3" />
                {member.email}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center">
                <div className="text-base font-bold text-white">{member.capacity}</div>
                <div className="text-[10px] text-[#555555]">hod/den</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-white">{taskCount}</div>
                <div className="text-[10px] text-[#555555]">úkolů</div>
              </div>
              <div className="text-center">
                <div className={`text-base font-bold ${utilizationTextColor}`}>{utilization}%</div>
                <div className="text-[10px] text-[#555555]">vytížení</div>
              </div>
            </div>

            {/* Utilization bar */}
            <div className="mt-2 h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${utilizationColor}`}
                style={{ width: `${Math.min(100, utilization)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Smazat člena týmu"
        description={`Opravdu chcete smazat ${member.name}? Tato akce je nevratná.`}
        confirmLabel="Smazat"
        variant="destructive"
        onConfirm={() => onDelete(member.id)}
      />
    </>
  )
}
