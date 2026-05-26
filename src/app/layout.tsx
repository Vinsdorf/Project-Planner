import type { Metadata } from 'next'
import './globals.css'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppNav } from '@/components/layout/AppNav'
import { CommandPalette } from '@/components/shared/CommandPalette'

export const metadata: Metadata = {
  title: 'Project Portfolio',
  description: 'Správa projektového portfolia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" style={{ background: '#0f1117' }}>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: '#0f1117',
          color: '#e8eaf6',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <AppHeader />
        <AppNav />
        <main
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </main>
        <CommandPalette />
      </body>
    </html>
  )
}
