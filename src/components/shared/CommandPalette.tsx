'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
import { Search, FolderOpen, LayoutDashboard, Kanban, Users } from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface Command {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  group: string
}

export function CommandPalette() {
  const router = useRouter()
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore()
  const { projects } = useProjectStore()
  const [query, setQuery] = useState('')

  useHotkeys('ctrl+k, meta+k', (e) => {
    e.preventDefault()
    setCommandPaletteOpen(true)
  })

  useEffect(() => {
    if (!commandPaletteOpen) setQuery('')
  }, [commandPaletteOpen])

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Přejít na přehled',
      icon: <LayoutDashboard className="w-4 h-4" />,
      action: () => router.push('/'),
      group: 'Navigace',
    },
    ...projects.map((p) => ({
      id: `project-${p.id}`,
      label: p.name,
      icon: <FolderOpen className="w-4 h-4" />,
      action: () => router.push(`/project/${p.id}`),
      group: 'Projekty',
    })),
    ...projects.map((p) => ({
      id: `board-${p.id}`,
      label: `${p.name} – Board`,
      icon: <Kanban className="w-4 h-4" />,
      action: () => router.push(`/project/${p.id}/board`),
      group: 'Kanban',
    })),
    ...projects.map((p) => ({
      id: `resources-${p.id}`,
      label: `${p.name} – Zdroje`,
      icon: <Users className="w-4 h-4" />,
      action: () => router.push(`/project/${p.id}/resources`),
      group: 'Zdroje',
    })),
  ]

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = []
    acc[cmd.group].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  const handleSelect = useCallback((cmd: Command) => {
    cmd.action()
    setCommandPaletteOpen(false)
  }, [setCommandPaletteOpen])

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <div className="flex items-center border-b border-[#2a2a2a] px-4">
          <Search className="w-4 h-4 text-[#888888] shrink-0 mr-3" />
          <Input
            placeholder="Hledat příkazy..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 px-0 text-white placeholder:text-[#555555] h-12"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {Object.entries(grouped).length === 0 ? (
            <div className="py-8 text-center text-[#888888] text-sm">Žádné výsledky</div>
          ) : (
            Object.entries(grouped).map(([group, cmds]) => (
              <div key={group}>
                <div className="px-4 py-1.5 text-xs text-[#555555] font-medium uppercase tracking-wider">
                  {group}
                </div>
                {cmds.map((cmd) => (
                  <button
                    key={cmd.id}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors text-left"
                    onClick={() => handleSelect(cmd)}
                  >
                    <span className="text-[#888888]">{cmd.icon}</span>
                    {cmd.label}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
        <div className="border-t border-[#2a2a2a] px-4 py-2 flex gap-4 text-xs text-[#555555]">
          <span>↑↓ navigace</span>
          <span>↵ otevřít</span>
          <span>esc zavřít</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
