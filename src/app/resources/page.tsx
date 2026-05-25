'use client'
import { ResourceList } from '@/components/resources/ResourceList'
import { CapacityHeatmap } from '@/components/resources/CapacityHeatmap'

export default function ResourcesPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        background: '#0f1117',
      }}
    >
      <ResourceList />
      <CapacityHeatmap />
    </div>
  )
}
