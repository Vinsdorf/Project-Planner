'use client'

import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import { addDays, format, parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Task, TeamMember } from '@/types'

interface ResourceChartProps {
  tasks: Task[]
  members: TeamMember[]
  viewMode: 'week' | 'month'
}

interface ChartDataPoint {
  date: string
  [key: string]: number | string
}

export function ResourceChart({ tasks, members, viewMode }: ResourceChartProps) {
  const chartData = useMemo(() => {
    if (members.length === 0 || tasks.length === 0) return []

    const today = new Date()
    const periods = viewMode === 'week' ? 8 : 12
    const data: ChartDataPoint[] = []

    for (let i = 0; i < periods; i++) {
      const periodStart = addDays(today, i * (viewMode === 'week' ? 7 : 30) - (viewMode === 'week' ? 14 : 30))
      const periodEnd = addDays(periodStart, viewMode === 'week' ? 6 : 29)

      const point: ChartDataPoint = {
        date: format(periodStart, viewMode === 'week' ? 'dd.MM.' : 'MMM', { locale: cs }),
      }

      for (const member of members) {
        // Count tasks assigned to this member in this period
        const assignedTasks = tasks.filter((t) => {
          if (!t.assigneeIds.includes(member.id)) return false
          const taskStart = parseISO(t.startDate)
          const taskEnd = parseISO(t.endDate)
          return taskStart <= periodEnd && taskEnd >= periodStart
        })

        const totalDays = Math.min(
          (viewMode === 'week' ? 5 : 22), // working days in period
          assignedTasks.reduce((sum, t) => sum + Math.min(t.duration, viewMode === 'week' ? 5 : 22), 0)
        )

        const utilization = Math.round((totalDays / (viewMode === 'week' ? 5 : 22)) * 100)
        point[member.name] = utilization
      }

      data.push(point)
    }

    return data
  }, [tasks, members, viewMode])

  const COLORS = members.map((m) => m.color)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-xs">
        <div className="font-semibold text-white mb-2">{label}</div>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#888888]">{entry.name}:</span>
            <span
              className={`font-medium ${
                entry.value >= 100 ? 'text-red-400' : entry.value >= 80 ? 'text-yellow-400' : 'text-green-400'
              }`}
            >
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#555555] text-sm">
        Nejsou k dispozici žádná data
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#888888', fontSize: 11 }}
          axisLine={{ stroke: '#2a2a2a' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#888888', fontSize: 11 }}
          axisLine={{ stroke: '#2a2a2a' }}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 120]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-xs text-[#888888]">{value}</span>}
        />
        <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.5} />
        <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 2" strokeOpacity={0.3} />
        {members.map((member, i) => (
          <Bar
            key={member.id}
            dataKey={member.name}
            fill={member.color}
            fillOpacity={0.8}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
