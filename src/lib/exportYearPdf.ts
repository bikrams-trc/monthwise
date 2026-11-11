import { iconForEvent } from './eventIcons'
import {
  MONTH_NAMES,
  MONTH_NAMES_PA,
  type CalendarEvent,
} from './events'

export const MAX_EXPORT_EVENTS_PER_MONTH = 5

const COLORS = {
  night: [13, 21, 36] as const,
  panel: [24, 38, 58] as const,
  gold: [242, 193, 78] as const,
  kesri: [232, 93, 4] as const,
  ink: [245, 240, 232] as const,
  muted: [180, 190, 205] as const,
}

const iconCache = new Map<string, string>()

async function svgUrlToPngDataUrl(url: string, size = 48): Promise<string | null> {
  if (iconCache.has(url)) return iconCache.get(url)!
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const svgText = await res.text()
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const objectUrl = URL.createObjectURL(blob)
    const png = await new Promise<string | null>((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0, size, size)
        resolve(canvas.toDataURL('image/png'))
        URL.revokeObjectURL(objectUrl)
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        resolve(null)
      }
      img.src = objectUrl
    })
    if (png) iconCache.set(url, png)
    return png
  } catch {
    return null
  }
}

export function defaultExportSelection(
  eventsByMonth: Record<number, CalendarEvent[]>,
  cap = MAX_EXPORT_EVENTS_PER_MONTH,
): Record<number, string[]> {
  const selected: Record<number, string[]> = {}
  for (let m = 0; m < 12; m++) {
    const events = [...(eventsByMonth[m] ?? [])].sort((a, b) => {
      const rank = (e: CalendarEvent) =>
        e.templateId === 'sangrand' ? 0 : e.templateId === 'pooranmashi' ? 1 : 2
      return rank(a) - rank(b) || a.day - b.day || a.name.localeCompare(b.name)
    })
    selected[m] = events.slice(0, cap).map((e) => e.id)
  }
  return selected
}

export async function exportYearToPdf(
  year: number,
  eventsByMonth: Record<number, CalendarEvent[]>,
  selectedByMonth: Record<number, string[]>,
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'landscape' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  doc.setFillColor(...COLORS.night)
  doc.rect(0, 0, pageW, pageH, 'F')

  doc.setTextColor(...COLORS.gold)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('MonthWise', 28, 32)
  doc.setFontSize(14)
  doc.text(String(year), 140, 32)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  doc.text('Punjabi & Sikh observances — yearly glance (one page)', 28, 46)
  doc.setFillColor(...COLORS.kesri)
  doc.circle(pageW - 36, 28, 12, 'F')
  doc.setFillColor(...COLORS.gold)
  doc.circle(pageW - 36, 28, 5, 'F')

  const cols = 4
  const rows = 3
  const marginX = 22
  const marginTop = 58
  const gapX = 10
  const gapY = 8
  const cellW = (pageW - marginX * 2 - gapX * (cols - 1)) / cols
  const cellH = (pageH - marginTop - 28 - gapY * (rows - 1)) / rows

  const selectedEvents: CalendarEvent[] = []
  for (let m = 0; m < 12; m++) {
    const ids = new Set((selectedByMonth[m] ?? []).slice(0, MAX_EXPORT_EVENTS_PER_MONTH))
    for (const e of eventsByMonth[m] ?? []) {
      if (ids.has(e.id)) selectedEvents.push(e)
    }
  }
  const iconPng = new Map<string, string>()
  await Promise.all(
    selectedEvents.map(async (e) => {
      const url = iconForEvent(e.templateId)
      const png = await svgUrlToPngDataUrl(url, 40)
      if (png) iconPng.set(e.id, png)
    }),
  )

  for (let month = 0; month < 12; month++) {
    const col = month % cols
    const row = Math.floor(month / cols)
    const x = marginX + col * (cellW + gapX)
    const y = marginTop + row * (cellH + gapY)

    doc.setFillColor(...COLORS.panel)
    doc.roundedRect(x, y, cellW, cellH, 6, 6, 'F')
    doc.setFillColor(...COLORS.kesri)
    doc.rect(x, y, 4, cellH, 'F')

    doc.setTextColor(...COLORS.gold)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(MONTH_NAMES[month], x + 12, y + 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.muted)
    doc.text(MONTH_NAMES_PA[month], x + 12, y + 24)

    const ids = new Set((selectedByMonth[month] ?? []).slice(0, MAX_EXPORT_EVENTS_PER_MONTH))
    const events = (eventsByMonth[month] ?? [])
      .filter((e) => ids.has(e.id))
      .sort((a, b) => a.day - b.day || a.name.localeCompare(b.name))

    let ey = y + 32
    const lineH = Math.min(16, (cellH - 38) / Math.max(events.length, 1))

    if (events.length === 0) {
      doc.setFontSize(7)
      doc.setTextColor(...COLORS.muted)
      doc.text('No events selected', x + 12, ey + 8)
    } else {
      for (const e of events) {
        const png = iconPng.get(e.id)
        if (png) doc.addImage(png, 'PNG', x + 10, ey, 10, 10)
        else {
          doc.setFillColor(...COLORS.kesri)
          doc.circle(x + 15, ey + 5, 4, 'F')
        }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...COLORS.gold)
        doc.text(String(e.day).padStart(2, '0'), x + 24, ey + 8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...COLORS.ink)
        const name = doc.splitTextToSize(e.name, cellW - 48)
        doc.text(name[0] ?? e.name, x + 38, ey + 8)
        ey += lineH
      }
    }
  }

  doc.setFontSize(7)
  doc.setTextColor(...COLORS.muted)
  doc.text(
    `MonthWise · ${year} · up to ${MAX_EXPORT_EVENTS_PER_MONTH} events per month · single page`,
    pageW / 2,
    pageH - 12,
    { align: 'center' },
  )

  while (doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages())
  }

  doc.save(`MonthWise-${year}.pdf`)
}
