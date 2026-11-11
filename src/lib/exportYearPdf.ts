import { iconForEvent } from './eventIcons'
import {
  MONTH_NAMES,
  type CalendarEvent,
} from './events'

export const MAX_EXPORT_EVENTS_PER_MONTH = 5

/** Print-friendly warm field palette (no near-black page fill). */
const COLORS = {
  page: [252, 244, 228] as const,
  headerBand: [255, 236, 200] as const,
  panel: [255, 252, 245] as const,
  panelLine: [232, 196, 140] as const,
  title: [158, 74, 12] as const,
  gold: [184, 120, 18] as const,
  kesri: [220, 90, 20] as const,
  field: [34, 112, 72] as const,
  ink: [48, 36, 28] as const,
  muted: [110, 92, 72] as const,
}

const iconCache = new Map<string, string>()

/** Phulkari-inspired floral motif (petals around a kesri center). */
function drawFloralBloom(
  doc: import('jspdf').jsPDF,
  cx: number,
  cy: number,
  r: number,
): void {
  const petalR = r * 0.55
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    const px = cx + Math.cos(a) * r * 0.62
    const py = cy + Math.sin(a) * r * 0.62
    doc.setFillColor(...COLORS.gold)
    doc.circle(px, py, petalR, 'F')
  }
  doc.setFillColor(...COLORS.kesri)
  doc.circle(cx, cy, r * 0.42, 'F')
  doc.setFillColor(...COLORS.field)
  doc.circle(cx, cy, r * 0.18, 'F')
}

/** Vine bud along border edges. */
function drawFloralBud(
  doc: import('jspdf').jsPDF,
  cx: number,
  cy: number,
  r: number,
): void {
  doc.setFillColor(...COLORS.gold)
  doc.circle(cx, cy, r, 'F')
  doc.setFillColor(...COLORS.kesri)
  doc.circle(cx, cy, r * 0.45, 'F')
}

/**
 * Illuminated-manuscript / gutka-style floral frame:
 * triple rules + corner blooms + edge buds.
 */
function drawPunjabiFloralBorder(
  doc: import('jspdf').jsPDF,
  pageW: number,
  pageH: number,
): void {
  const inset = 10
  const x = inset
  const y = inset
  const w = pageW - inset * 2
  const h = pageH - inset * 2

  // Outer gold rule
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(2.2)
  doc.rect(x, y, w, h, 'S')
  // Kesri mid band
  doc.setDrawColor(...COLORS.kesri)
  doc.setLineWidth(3.4)
  doc.rect(x + 5, y + 5, w - 10, h - 10, 'S')
  // Inner gold hairline
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(1)
  doc.rect(x + 10, y + 10, w - 20, h - 20, 'S')
  // Soft field-green inner whisper line
  doc.setDrawColor(...COLORS.field)
  doc.setLineWidth(0.6)
  doc.rect(x + 13, y + 13, w - 26, h - 26, 'S')

  const bloomR = 7
  const corners: Array<[number, number]> = [
    [x + 18, y + 18],
    [x + w - 18, y + 18],
    [x + 18, y + h - 18],
    [x + w - 18, y + h - 18],
  ]
  for (const [cx, cy] of corners) drawFloralBloom(doc, cx, cy, bloomR)

  const budR = 2.6
  const step = 28
  // Top & bottom buds
  for (let bx = x + 40; bx < x + w - 40; bx += step) {
    drawFloralBud(doc, bx, y + 7.5, budR)
    drawFloralBud(doc, bx, y + h - 7.5, budR)
  }
  // Left & right buds
  for (let by = y + 40; by < y + h - 40; by += step) {
    drawFloralBud(doc, x + 7.5, by, budR)
    drawFloralBud(doc, x + w - 7.5, by, budR)
  }
}

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

  doc.setFillColor(...COLORS.page)
  doc.rect(0, 0, pageW, pageH, 'F')
  drawPunjabiFloralBorder(doc, pageW, pageH)

  // Header sits inside the floral frame
  doc.setFillColor(...COLORS.headerBand)
  doc.rect(24, 24, pageW - 48, 40, 'F')
  doc.setFillColor(...COLORS.kesri)
  doc.rect(24, 64, pageW - 48, 2.5, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...COLORS.title)
  const brand = 'MonthWise'
  doc.text(brand, 36, 48)
  const brandW = doc.getTextWidth(brand)
  doc.setFontSize(16)
  doc.setTextColor(...COLORS.gold)
  doc.text(String(year), 36 + brandW + 10, 48)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  doc.text('Punjabi & Sikh observances — yearly glance (one page)', 36, 60)

  doc.setFillColor(...COLORS.kesri)
  doc.circle(pageW - 48, 44, 10, 'F')
  doc.setFillColor(...COLORS.gold)
  doc.circle(pageW - 48, 44, 4, 'F')
  doc.setFillColor(...COLORS.field)
  doc.circle(pageW - 62, 50, 4.5, 'F')

  const cols = 4
  const rows = 3
  const marginX = 28
  const marginTop = 76
  const gapX = 10
  const gapY = 8
  const cellW = (pageW - marginX * 2 - gapX * (cols - 1)) / cols
  const cellH = (pageH - marginTop - 32 - gapY * (rows - 1)) / rows

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
    doc.setDrawColor(...COLORS.panelLine)
    doc.setLineWidth(0.8)
    doc.roundedRect(x, y, cellW, cellH, 6, 6, 'S')
    doc.setFillColor(...COLORS.kesri)
    doc.rect(x, y, 4, cellH, 'F')

    doc.setTextColor(...COLORS.title)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(MONTH_NAMES[month], x + 12, y + 16)

    const ids = new Set((selectedByMonth[month] ?? []).slice(0, MAX_EXPORT_EVENTS_PER_MONTH))
    const events = (eventsByMonth[month] ?? [])
      .filter((e) => ids.has(e.id))
      .sort((a, b) => a.day - b.day || a.name.localeCompare(b.name))

    let ey = y + 28
    const lineH = Math.min(16, (cellH - 36) / Math.max(events.length, 1))

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
    pageH - 20,
    { align: 'center' },
  )

  while (doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages())
  }

  doc.save(`MonthWise-${year}.pdf`)
}
