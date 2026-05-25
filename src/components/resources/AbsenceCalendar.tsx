'use client'

import React, { useState } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, addMonths, subMonths, isSameMonth } from 'date-fns'
import { cs } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TimeOff, TeamMember } from '@/types'
import { Button } from '@/components/ui/button'

interface AbsenceCalendarProps {
  timeOffs: TimeOff[]
  members: TeamMember[]
}

const ABSENCE_COLORS: Record<TimeOff['type'], string> = {
  vacation: '#3b82f6',
  sick: '#ef4444',
  holiday: '#8b5cf6',
  other: '#6b7280',
}

const ABSENCE_LABELS: Record<TimeOff['type'], string> = {
  vacation: 'Dovolená',
  sick: 'Nemoc',
  holiday: 'Svátek',
  other: 'Jiné',
}

export function AbsenceCalendar({ timeOffs, members }: AbsenceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getAbsencesForDay = (day: Date) => {
    return timeOffs.filter((to) => {
      const start = parseISO(to.startDate)
      const end = parseISO(to.endDate)
      return isWithinInterval(day, { start, end })
    })
  }

  const getMemberColor = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.color || '#6b7280'
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Absence týmu</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-white min-w-[120px] text-center">
            {format(currentMonth, 'LLLL yyyy', { locale: cs })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((d) => (
          <div key={d} className="text-[10px] text-[#555555] text-center py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const absences = getAbsencesForDay(day)
          const isWeekend = day.getDay() === 0 || day.getDay() === 6
          const isCurrentDay = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

          return (
            <div
              key={day.toISOString()}
              className={`relative min-h-[32px] rounded p-1 ${
                isWeekend ? 'bg-[#111111]' : 'bg-[#111111] hover:bg-[#222222]'
              } ${isCurrentDay ? 'ring-1 ring-blue-500' : ''}`}
            >
              <span
                className={`text-[10px] ${
                  isCurrentDay ? 'text-blue-400 font-bold' : isWeekend ? 'text-[#333333]' : 'text-[#888888]'
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {absences.map((a) => (
                  <div
                    key={a.id}
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: getMemberColor(a.memberId) }}
                    title={`${members.find((m) => m.id === a.memberId)?.name}: ${ABSENCE_LABELS[a.type]}`}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[#2a2a2a]">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: m.color }} />
            <span className="text-xs text-[#888888]">{m.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
