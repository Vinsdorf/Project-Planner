import { toPng } from 'html-to-image'

export async function exportToPng(element: HTMLElement, filename: string = 'gantt-chart.png'): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#0a0a0a',
      quality: 0.95,
    })
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Export failed:', error)
  }
}

export function exportToJson(data: unknown, filename: string = 'project-export.json'): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
