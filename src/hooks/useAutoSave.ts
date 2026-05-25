'use client'

import { useEffect, useRef } from 'react'

export function useAutoSave(
  data: unknown,
  onSave: (data: unknown) => void,
  delay: number = 2000
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevDataRef = useRef<string>('')

  useEffect(() => {
    const serialized = JSON.stringify(data)
    if (serialized === prevDataRef.current) return

    prevDataRef.current = serialized

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      onSave(data)
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [data, onSave, delay])
}
