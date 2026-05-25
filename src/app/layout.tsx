import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ProjectFlow – Správa projektů',
  description: 'Profesionální nástroj pro správu projektů s Ganttovým diagramem, Kanban boardem a plánováním zdrojů.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" className="dark h-full">
      <body className="h-full bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
