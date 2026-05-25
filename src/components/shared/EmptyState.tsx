interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        gap: '12px',
        color: '#6b7280',
      }}
    >
      <div style={{ fontSize: '40px' }}>📋</div>
      <h3 style={{ margin: 0, fontSize: '16px', color: '#9ca3af' }}>{title}</h3>
      {description && (
        <p style={{ margin: 0, fontSize: '14px', textAlign: 'center' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
