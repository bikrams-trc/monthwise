import { PREDEFINED_OBSERVANCES } from '../data/observances'
import { nanakshahiMonthFor } from '../data/yearDefaults'

export type CalendarEvent = {
  id: string
  year: number
  month: number
  /** null = date not set yet (default events seed without a day) */
  day: number | null
  name: string
  namePa?: string
  templateId?: string
  note?: string
}

const STORAGE_KEY = 'monthwise-events-v1'
/** v3: seed Pooranmashi/Sangrand without default day numbers */
const SEEDED_KEY = 'monthwise-seeded-months-v3'

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function monthKey(year: number, month: number): string {
  return `${year}-${month}`
}

function readEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CalendarEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeEvents(events: CalendarEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

function readSeeded(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEDED_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function writeSeeded(seeded: Set<string>): void {
  localStorage.setItem(SEEDED_KEY, JSON.stringify([...seeded]))
}

function upsertMonthDefault(
  events: CalendarEvent[],
  draft: Omit<CalendarEvent, 'id'> & { templateId: string },
): CalendarEvent[] {
  const idx = events.findIndex(
    (e) =>
      e.year === draft.year &&
      e.month === draft.month &&
      e.templateId === draft.templateId,
  )
  if (idx >= 0) {
    const next = [...events]
    next[idx] = {
      ...next[idx],
      day: draft.day,
      name: draft.name,
      namePa: draft.namePa,
      note: draft.note,
      templateId: draft.templateId,
    }
    return next
  }
  return [...events, { ...draft, id: uid() }]
}

export function ensureMonthDefaults(year: number, month: number): CalendarEvent[] {
  const seeded = readSeeded()
  const key = monthKey(year, month)
  let events = readEvents()

  if (!seeded.has(key)) {
    const pooran = PREDEFINED_OBSERVANCES.find((o) => o.id === 'pooranmashi')!
    const sangrand = PREDEFINED_OBSERVANCES.find((o) => o.id === 'sangrand')!
    const ns = nanakshahiMonthFor(year, month)
    events = upsertMonthDefault(events, {
      year,
      month,
      day: null,
      name: pooran.name,
      namePa: pooran.namePa,
      templateId: pooran.id,
      note: pooran.note,
    })
    events = upsertMonthDefault(events, {
      year,
      month,
      day: null,
      name: sangrand.name,
      namePa: sangrand.namePa,
      templateId: sangrand.id,
      note: ns ? `Start of ${ns}` : sangrand.note,
    })
    writeEvents(events)
    seeded.add(key)
    writeSeeded(seeded)
  }

  return events
    .filter((e) => e.year === year && e.month === month)
    .sort(
      (a, b) =>
        (a.day ?? 99) - (b.day ?? 99) || a.name.localeCompare(b.name),
    )
}

export function getEventsForMonth(year: number, month: number): CalendarEvent[] {
  return ensureMonthDefaults(year, month)
}

export function getEventsForYear(year: number): Record<number, CalendarEvent[]> {
  const byMonth: Record<number, CalendarEvent[]> = {}
  for (let month = 0; month < 12; month++) {
    byMonth[month] = getEventsForMonth(year, month)
  }
  return byMonth
}

export function addEvent(
  input: Omit<CalendarEvent, 'id'> & { id?: string },
): CalendarEvent {
  const events = readEvents()
  const event: CalendarEvent = { ...input, id: input.id ?? uid() }
  events.push(event)
  writeEvents(events)
  const seeded = readSeeded()
  seeded.add(monthKey(event.year, event.month))
  writeSeeded(seeded)
  return event
}

export function updateEvent(
  id: string,
  patch: Partial<Omit<CalendarEvent, 'id'>>,
): CalendarEvent | null {
  const events = readEvents()
  const idx = events.findIndex((e) => e.id === id)
  if (idx < 0) return null
  const updated = { ...events[idx], ...patch, id }
  events[idx] = updated
  writeEvents(events)
  return updated
}

export function deleteEvent(id: string): void {
  writeEvents(readEvents().filter((e) => e.id !== id))
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function firstWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const MONTH_NAMES_PA = [
  'ਜਨਵਰੀ', 'ਫਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ',
  'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ',
]

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
