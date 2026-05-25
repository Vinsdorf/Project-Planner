'use client'

import { useState, useCallback } from 'react'

export function useUndoRedo<T>(initialState: T) {
  const [past, setPast] = useState<T[]>([])
  const [present, setPresent] = useState<T>(initialState)
  const [future, setFuture] = useState<T[]>([])

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  const undo = useCallback(() => {
    if (!canUndo) return
    const previous = past[past.length - 1]
    setPast((prev) => prev.slice(0, -1))
    setFuture((f) => [present, ...f])
    setPresent(previous)
  }, [canUndo, past, present])

  const redo = useCallback(() => {
    if (!canRedo) return
    const next = future[0]
    setFuture((f) => f.slice(1))
    setPast((p) => [...p, present])
    setPresent(next)
  }, [canRedo, future, present])

  const push = useCallback(
    (newState: T) => {
      setPast((p) => [...p.slice(-19), present])
      setPresent(newState)
      setFuture([])
    },
    [present]
  )

  return { state: present, push, undo, redo, canUndo, canRedo }
}
