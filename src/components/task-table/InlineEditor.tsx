'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'

interface InlineEditorProps {
  value: string
  onSave: (value: string) => void
  onCancel: () => void
  className?: string
}

export function InlineEditor({ value, onSave, onCancel, className }: InlineEditorProps) {
  const [text, setText] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(text.trim() || value)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <Input
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSave(text.trim() || value)}
      className={`h-7 text-xs py-0 ${className}`}
    />
  )
}
