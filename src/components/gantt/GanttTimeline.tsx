'use client'

import React, { useMemo } from 'react'
import {
  startOfDay,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  isToday,
  isWeekend,
  getDaysInMonth,
  getWeek,
} from 'date-fns'
import { cs } from 'date-fns/locale'
import { ZoomLevel } from '@/types'

interface GanttTimelineProps {
  startDate: Date
  endDate: Date
  zoom: ZoomLevel
  columnWidth: number
  rowHeight: number
}

const ZOOM_DAY_WIDTH: Record<ZoomLevel, number> = {
  day: 40,
  week: 20,
  month: 8,
  quarter: 4,
}

export function GanttTimeline({ startDate, endDate, zoom, columnWidth, rowHeight }: GanttTimelineProps) {
  const dayWidth = ZOOM_DAY_WIDTH[zoom]

  const { topHeaders, bottomHeaders, totalWidth } = useMemo(() => {
    const topHeaders: { label: string; width: number; left: number }[] = []
    const bottomHeaders: { label: string; width: number; left: number; isWeekend: boolean; isToday: boolean }[] = []
    let totalWidth = 0

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    if (zoom === 'day') {
      // Top: months, Bottom: days
      let currentMonth = startOfMonth(startDate)
      while (currentMonth <= endDate) {
        const monthDays = getDaysInMonth(currentMonth)
        const clampedStart = Math.max(0, Math.ceil((currentMonth.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        const nextMonth = addMonths(currentMonth, 1)
        const clampedEnd = Math.min(totalDays, Math.ceil((nextMonth.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        const visibleDays = clampedEnd - clampedStart
        topHeaders.push({
          label: format(currentMonth, 'LLLL yyyy', { locale: cs }),
          width: visibleDays * dayWidth,
          left: clampedStart * dayWidth,
        })
        currentMonth = nextMonth
      }

      for (let i = 0; i < totalDays; i++) {
        const day = addDays(startDate, i)
        bottomHeaders.push({
          label: format(day, 'd'),
          width: dayWidth,
          left: i * dayWidth,
          isWeekend: isWeekend(day),
          isToday: isToday(day),
        })
      }
    } else if (zoom === 'week') {
      // Top: months, Bottom: weeks
      let currentMonth = startOfMonth(startDate)
      while (currentMonth <= endDate) {
        const clampedStart = Math.max(0, Math.ceil((currentMonth.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        const nextMonth = addMonths(currentMonth, 1)
        const clampedEnd = Math.min(totalDays, Math.ceil((nextMonth.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        const visibleDays = clampedEnd - clampedStart
        topHeaders.push({
          label: format(currentMonth, 'LLLL yyyy', { locale: cs }),
          width: visibleDays * dayWidth,
          left: clampedStart * dayWidth,
        })
        currentMonth = nextMonth
      }

      for (let i = 0; i < totalDays; i++) {
        const day = addDays(startDate, i)
        bottomHeaders.push({
          label: format(day, 'EEEEEE d', { locale: cs }),
          width: dayWidth,
          left: i * dayWidth,
          isWeekend: isWeekend(day),
          isToday: isToday(day),
        })
      }
    } else if (zoom === 'month') {
      // Top: quarters, Bottom: months
      let currentMonth = startOfMonth(startDate)
      while (currentMonth <= endDate) {
        const clampedStart = Math.max(0, Math.ceil((currentMonth.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        const daysInMonth = getDaysInMonth(currentMonth)
        bottomHeaders.push({
          label: format(currentMonth, 'MMM yyyy', { locale: cs }),
          width: daysInMonth * dayWidth,
          left: clampedStart * dayWidth,
          isWeekend: false,
          isToday: false,
        })
        currentMonth = addMonths(currentMonth, 1)
      }

      // Top: years
      let currentYear = new Date(startDate.getFullYear(), 0, 1)
      while (currentYear <= endDate) {
        const nextYear = new Date(currentYear.getFullYear() + 1, 0, 1)
        const clampedStart = Math.max(0, Math.ceil((currentYear.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        const clampedEnd = Math.min(totalDays, Math.ceil((nextYear.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        topHeaders.push({
          label: currentYear.getFullYear().toString(),
          width: (clampedEnd - clampedStart) * dayWidth,
          left: clampedStart * dayWidth,
        })
        currentYear = nextYear
      }
    } else {
      // quarter: Top: years, Bottom: quarters
      for (let i = 0; i < totalDays; i++) {
        const day = addDays(startDate, i)
        bottomHeaders.push({
          label: '',
          width: dayWidth,
          left: i * dayWidth,
          isWeekend: false,
          isToday: false,
        })
      }

      let currentYear = new Date(startDate.getFullYear(), 0, 1)
      while (currentYear <= endDate) {
        const nextYear = new Date(currentYear.getFullYear() + 1, 0, 1)
        const clampedStart = Math.max(0, Math.ceil((currentYear.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        const clampedEnd = Math.min(totalDays, Math.ceil((nextYear.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        topHeaders.push({
          label: currentYear.getFullYear().toString(),
          width: (clampedEnd - clampedStart) * dayWidth,
          left: clampedStart * dayWidth,
        })
        currentYear = nextYear
      }
    }

    totalWidth = totalDays * dayWidth

    return { topHeaders, bottomHeaders, totalWidth }
  }, [startDate, endDate, zoom, dayWidth])

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  return (
    <div style={{ width: totalWidth, minWidth: totalWidth }}>
      {/* Top header row */}
      <div className="flex h-8 border-b border-[#2a2a2a] bg-[#0f0f0f] relative">
        {topHeaders.map((h, i) => (
          <div
            key={i}
            className="absolute flex items-center px-2 text-xs font-medium text-[#888888] border-r border-[#2a2a2a] overflow-hidden"
            style={{ left: h.left, width: h.width, height: 32 }}
          >
            <span className="truncate">{h.label}</span>
          </div>
        ))}
      </div>
      {/* Bottom header row */}
      <div className="flex h-8 border-b border-[#2a2a2a] bg-[#111111] relative">
        {bottomHeaders.map((h, i) => (
          <div
            key={i}
            className={`absolute flex items-center justify-center text-xs border-r border-[#1a1a1a] overflow-hidden
              ${h.isWeekend ? 'bg-[#0d0d0d] text-[#444444]' : 'text-[#666666]'}
              ${h.isToday ? 'bg-blue-600/20 text-blue-400 font-bold' : ''}
            `}
            style={{ left: h.left, width: h.width, height: 32 }}
          >
            <span className="truncate px-0.5">{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
