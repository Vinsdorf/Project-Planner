'use client'

import React, { useRef, useMemo, useState, useCallback } from 'react'
import { parseISO, addDays, subDays, format, differenceInDays } from 'date-fns'
import { ZoomIn, ZoomOut, Download, ChevronRight, ChevronDown } from 'lucide-react'
import { Task, ZoomLevel } from '@/types'
import { useTaskStore } from '@/stores/taskStore'
import { useUiStore } from '@/stores/uiStore'
import { useGanttZoom } from '@/hooks/useGanttZoom'
import { buildTaskTree, getTaskColor } from '@/lib/scheduling'
import { GanttTimeline } from './GanttTimeline'
import { GanttGrid } from './GanttGrid'
import { GanttBar } from './GanttBar'
import { GanttToday } from './GanttToday'
import { GanttDependencyLine, DependencyArrowMarker } from './GanttDependencyLine'
import { Button } from '@/components/ui/button'
import { exportToPng } from '@/lib/export'

const ZOOM_DAY_WIDTH: Record<ZoomLevel, number> = {
  day: 40,
  week: 20,
  month: 8,
  quarter: 4,
}

const LEFT_PANEL_WIDTH = 300

interface GanttChartProps {
  projectId: string
}

export function GanttChart({ projectId }: GanttChartProps) {
  const { getTasksByProject, updateTask } = useTaskStore()
  const { selectedTaskId, setSelectedTask } = useUiStore()
  const { zoom, setZoom, zoomIn, zoomOut } = useGanttZoom()
  const ganttRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const allTasks = getTasksByProject(projectId)
  const dayWidth = ZOOM_DAY_WIDTH[zoom]
  const ROW_HEIGHT = 36

  // Build sorted task tree
  const orderedTasks = useMemo(() => buildTaskTree(allTasks), [allTasks])

  // Filter out collapsed children
  const visibleTasks = useMemo(() => {
    const visible: Task[] = []
    for (const task of orderedTasks) {
      if (task.parentId && collapsed.has(task.parentId)) continue
      visible.push(task)
    }
    return visible
  }, [orderedTasks, collapsed])

  // Calculate Gantt date range
  const { ganttStart, ganttEnd } = useMemo(() => {
    if (allTasks.length === 0) {
      const today = new Date()
      return {
        ganttStart: subDays(today, 7),
        ganttEnd: addDays(today, 90),
      }
    }
    const starts = allTasks.map((t) => parseISO(t.startDate))
    const ends = allTasks.map((t) => parseISO(t.endDate))
    const minStart = new Date(Math.min(...starts.map((d) => d.getTime())))
    const maxEnd = new Date(Math.max(...ends.map((d) => d.getTime())))
    return {
      ganttStart: subDays(minStart, 7),
      ganttEnd: addDays(maxEnd, 14),
    }
  }, [allTasks])

  const totalDays = differenceInDays(ganttEnd, ganttStart) + 1
  const totalWidth = totalDays * dayWidth
  const totalHeight = visibleTasks.length * ROW_HEIGHT

  const rowMap = useMemo(() => {
    const map = new Map<string, number>()
    visibleTasks.forEach((t, i) => map.set(t.id, i))
    return map
  }, [visibleTasks])

  const toggleCollapse = useCallback((taskId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }, [])

  const handleBarUpdate = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      updateTask(taskId, updates)
    },
    [updateTask]
  )

  const handleExport = useCallback(async () => {
    if (ganttRef.current) {
      await exportToPng(ganttRef.current, `gantt-${projectId}.png`)
    }
  }, [projectId])

  const hasChildren = useCallback(
    (taskId: string) => allTasks.some((t) => t.parentId === taskId),
    [allTasks]
  )

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]" ref={ganttRef}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2a2a2a] bg-[#111111] shrink-0">
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-md border border-[#2a2a2a] p-0.5">
          {(['day', 'week', 'month', 'quarter'] as ZoomLevel[]).map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                zoom === z
                  ? 'bg-blue-600 text-white'
                  : 'text-[#888888] hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {z === 'day' ? 'Den' : z === 'week' ? 'Týden' : z === 'month' ? 'Měsíc' : 'Čtvrtletí'}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={zoomOut} title="Oddálit">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={zoomIn} title="Přiblížit">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={handleExport} className="gap-2 text-[#888888] hover:text-white">
          <Download className="w-4 h-4" />
          Exportovat PNG
        </Button>
      </div>

      {/* Main gantt layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - task table */}
        <div
          className="shrink-0 border-r border-[#2a2a2a] flex flex-col overflow-hidden bg-[#0a0a0a]"
          style={{ width: LEFT_PANEL_WIDTH }}
        >
          {/* Header row for task table */}
          <div className="h-16 border-b border-[#2a2a2a] bg-[#0f0f0f] flex items-end px-3 pb-1 shrink-0">
            <div className="flex items-center gap-2 w-full text-xs font-medium text-[#555555] pb-1">
              <span className="flex-1">Název úkolu</span>
              <span className="w-10 text-right">%</span>
            </div>
          </div>

          {/* Task rows */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {visibleTasks.map((task, i) => {
              const isParent = hasChildren(task.id)
              const isCollapsed = collapsed.has(task.id)
              const depth = task.parentId ? 1 : 0
              const color = getTaskColor(task.priority, task.color)

              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-1 px-2 border-b border-[#1a1a1a] cursor-pointer transition-colors ${
                    selectedTaskId === task.id ? 'bg-blue-600/10' : 'hover:bg-[#111111]'
                  }`}
                  style={{ height: ROW_HEIGHT, paddingLeft: 8 + depth * 16 }}
                  onClick={() => setSelectedTask(task.id === selectedTaskId ? null : task.id)}
                >
                  {/* Collapse button */}
                  <button
                    className="w-4 h-4 flex items-center justify-center text-[#555555] hover:text-white shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isParent) toggleCollapse(task.id)
                    }}
                  >
                    {isParent ? (
                      isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    ) : (
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color, opacity: 0.6 }} />
                    )}
                  </button>

                  {/* Task name */}
                  <span
                    className={`flex-1 text-xs truncate ${
                      task.isMilestone ? 'text-yellow-400 font-semibold' :
                      !task.parentId ? 'text-white font-medium' : 'text-[#cccccc]'
                    }`}
                  >
                    {task.isMilestone && '◆ '}
                    {task.name}
                  </span>

                  {/* Progress */}
                  <span className="w-10 text-right text-xs text-[#555555] shrink-0">
                    {task.progress}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel - timeline + bars */}
        <div className="flex-1 overflow-auto" ref={scrollRef}>
          {/* Timeline header */}
          <div className="sticky top-0 z-20 bg-[#0f0f0f]" style={{ minWidth: totalWidth }}>
            <GanttTimeline
              startDate={ganttStart}
              endDate={ganttEnd}
              zoom={zoom}
              columnWidth={dayWidth}
              rowHeight={ROW_HEIGHT}
            />
          </div>

          {/* Bars area */}
          <div
            className="relative"
            style={{ width: totalWidth, minWidth: totalWidth, height: totalHeight }}
          >
            <GanttGrid
              startDate={ganttStart}
              endDate={ganttEnd}
              zoom={zoom}
              rowCount={visibleTasks.length}
              rowHeight={ROW_HEIGHT}
            />

            <GanttToday
              startDate={ganttStart}
              zoom={zoom}
              height={totalHeight}
            />

            {/* Dependency lines SVG */}
            <svg
              className="absolute inset-0 pointer-events-none z-10"
              width={totalWidth}
              height={totalHeight}
            >
              <DependencyArrowMarker />
              {visibleTasks.map((task) =>
                task.dependencies.map((dep) => {
                  const fromTask = allTasks.find((t) => t.id === dep.taskId)
                  if (!fromTask) return null
                  return (
                    <GanttDependencyLine
                      key={`${task.id}-${dep.taskId}`}
                      fromTask={fromTask}
                      toTask={task}
                      dependency={dep}
                      ganttStart={ganttStart}
                      rowMap={rowMap}
                      dayWidth={dayWidth}
                      rowHeight={ROW_HEIGHT}
                    />
                  )
                })
              )}
            </svg>

            {/* Task bars SVG */}
            <svg
              className="absolute inset-0 z-20"
              width={totalWidth}
              height={totalHeight}
              style={{ overflow: 'visible' }}
            >
              {visibleTasks.map((task, rowIndex) => (
                <GanttBar
                  key={task.id}
                  task={task}
                  ganttStart={ganttStart}
                  rowIndex={rowIndex}
                  rowHeight={ROW_HEIGHT}
                  dayWidth={dayWidth}
                  isSelected={selectedTaskId === task.id}
                  onClick={setSelectedTask}
                  onUpdate={handleBarUpdate}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
