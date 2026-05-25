'use client'
import { useState } from 'react'
import type { TrafficLight } from '@/types'

interface TrafficLightDotsProps {
  overall: TrafficLight
  scope: TrafficLight
  time: TrafficLight
  budget: TrafficLight
  onChange?: (field: 'statusOverall' | 'statusScope' | 'statusTime' | 'statusBudget', value: TrafficLight) => void
  readOnly?: boolean
}

const CYCLE: TrafficLight[] = ['Green', 'Amber', 'Red', 'N/A']
const COLORS: Record<TrafficLight, string> = {
  Green: '#22c55e',
  Amber: '#f59e0b',
  Red: '#ef4444',
  'N/A': '#4b5563',
}
const LABELS = {
  overall: 'STAV',
  scope: 'ROZSAH',
  time: 'ČAS',
  budget: 'ROZPOČET',
}

function cycleTL(current: TrafficLight): TrafficLight {
  const idx = CYCLE.indexOf(current)
  return CYCLE[(idx + 1) % CYCLE.length]
}

export function TrafficLightDots({
  overall,
  scope,
  time,
  budget,
  onChange,
  readOnly,
}: TrafficLightDotsProps) {
  const [tooltip, setTooltip] = useState<string | null>(null)

  const dots: Array<{
    field: 'statusOverall' | 'statusScope' | 'statusTime' | 'statusBudget'
    value: TrafficLight
    label: string
  }> = [
    { field: 'statusOverall', value: overall, label: LABELS.overall },
    { field: 'statusScope', value: scope, label: LABELS.scope },
    { field: 'statusTime', value: time, label: LABELS.time },
    { field: 'statusBudget', value: budget, label: LABELS.budget },
  ]

  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', position: 'relative' }}>
      {dots.map((d) => (
        <div
          key={d.field}
          style={{ position: 'relative' }}
          onMouseEnter={() => setTooltip(d.label)}
          onMouseLeave={() => setTooltip(null)}
        >
          <span
            className="traffic-dot"
            style={{ background: COLORS[d.value] }}
            onClick={() => {
              if (!readOnly && onChange) {
                onChange(d.field, cycleTL(d.value))
              }
            }}
            title={d.label}
          />
          {tooltip === d.label && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#111',
                color: 'white',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              {d.label}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
