'use client'
import { useEffect, useRef } from 'react'
import { useUIStore } from '@/stores/uiStore'

export function useAutoSave(dependencies: unknown[]) {
  const setSaveStatus = useUIStore((s) => s.setSaveStatus)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setSaveStatus('saving')

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setSaveStatus('saved')
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}
