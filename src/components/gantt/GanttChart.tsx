'use client'
import { forwardRef, useRef } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { GanttTimeline } from './GanttTimeline'
import { GanttBar } from './GanttBar'
import { GanttGrid } from './GanttGrid'
import { GanttTodayLine } from './GanttTodayLine'
import { GanttZoomControls } from './GanttZoomControls'
import { getWeeksInYear } from '@/lib/weekUtils'
import { CURRENT_YEAR } from '@/lib/defaults'

const ROW_HEIGHT = 40
const HEADER_HEIGHT = 36 // matches TaskTable header

interface GanttChartProps {
  onScrollLeft?: (x: number) => void
}

const GanttChart = forwardRef<HTMLDivElement, GanttChartProps>(
  ({ onScrollLeft }, ref) => {
    const getFilteredProjects = useProjectStore((s) => s.getFilteredProjects)
    const projects = getFilteredProjects()
    const zoomLevel = useUIStore((s) => s.zoomLevel)
    const totalWeeks = getWeeksInYear(CURRENT_YEAR)
    const totalWidth = totalWeeks * zoomLevel
    const bodyHeight = Math.max(projects.length * ROW_HEIGHT + 48, 200)

    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          background: '#0f1117',
        }}
      >
        {/* Zoom controls */}
        <GanttZoomControls />

        {/* Scrollable area */}
        <div
          ref={ref}
          onScroll={(e) => {
            onScrollLeft?.(e.currentTarget.scrollLeft)
          }}
          style={{
            flex: 1,
            overflowX: 'auto',
            overflowY: 'auto',
          }}
        >
          <div style={{ width: `${totalWidth}px`, minHeight: '100%' }}>
            {/* Timeline header */}
            <GanttTimeline zoomLevel={zoomLevel} />

            {/* Body */}
            <div
              style={{
                position: 'relative',
                width: `${totalWidth}px`,
                height: `${bodyHeight}px`,
              }}
            >
              <GanttGrid zoomLevel={zoomLevel} totalHeight={bodyHeight} />
              <GanttTodayLine zoomLevel={zoomLevel} totalHeight={bodyHeight} />

              {/* Bars */}
              {projects.map((project, idx) => (
                <div
                  key={project.id}
                  style={{
                    position: 'absolute',
                    top: `${idx * ROW_HEIGHT}px`,
                    left: 0,
                    width: '100%',
                    height: `${ROW_HEIGHT}px`,
                  }}
                >
                  <GanttBar project={project} zoomLevel={zoomLevel} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

GanttChart.displayName = 'GanttChart'

export { GanttChart, ROW_HEIGHT }
