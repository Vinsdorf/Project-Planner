'use client'
import { useState, useRef, useEffect } from 'react'

interface InlineCellProps {
  value: string
  onSave: (value: string) => void
  options?: string[]
  type?: 'text' | 'number' | 'select'
  style?: React.CSSProperties
}

export function InlineCell({
  value,
  onSave,
  options,
  type = 'text',
  style,
}: InlineCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = (v: string) => {
    setEditing(false)
    setShowDropdown(false)
    if (v !== value) onSave(v)
  }

  if (options && options.length > 0) {
    return (
      <div style={{ position: 'relative', ...style }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: 'inherit',
            padding: '0',
            width: '100%',
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value || <span style={{ color: '#4b5563' }}>—</span>}
        </button>
        {showDropdown && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 49 }}
              onClick={() => setShowDropdown(false)}
            />
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#222535',
                border: '1px solid #2a2d37',
                borderRadius: '6px',
                zIndex: 50,
                minWidth: '140px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    commit(opt)
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '7px 12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    color: opt === value ? '#3b82f6' : '#e8eaf6',
                    background:
                      opt === value ? 'rgba(59,130,246,0.1)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit(draft)
          if (e.key === 'Escape') {
            setEditing(false)
            setDraft(value)
          }
        }}
        type={type}
        style={{
          background: '#0f1117',
          border: '1px solid #3b82f6',
          borderRadius: '4px',
          color: '#e8eaf6',
          fontSize: 'inherit',
          padding: '2px 6px',
          width: '100%',
          outline: 'none',
          ...style,
        }}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      style={{
        cursor: 'text',
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {value || <span style={{ color: '#4b5563' }}>—</span>}
    </span>
  )
}
