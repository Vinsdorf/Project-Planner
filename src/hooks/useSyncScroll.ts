'use client'
import { useEffect, RefObject } from 'react'

export function useSyncScroll(
  primaryRef: RefObject<HTMLElement | null>,
  secondaryRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const primary = primaryRef.current
    const secondary = secondaryRef.current
    if (!primary || !secondary) return

    let syncing = false

    const syncFromPrimary = () => {
      if (syncing) return
      syncing = true
      secondary.scrollTop = primary.scrollTop
      syncing = false
    }

    const syncFromSecondary = () => {
      if (syncing) return
      syncing = true
      primary.scrollTop = secondary.scrollTop
      syncing = false
    }

    primary.addEventListener('scroll', syncFromPrimary)
    secondary.addEventListener('scroll', syncFromSecondary)

    return () => {
      primary.removeEventListener('scroll', syncFromPrimary)
      secondary.removeEventListener('scroll', syncFromSecondary)
    }
  }, [primaryRef, secondaryRef])
}
