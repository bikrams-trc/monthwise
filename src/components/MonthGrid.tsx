import type { CalendarEvent } from '../lib/events'
import { MONTH_NAMES, MONTH_NAMES_PA, WEEKDAYS } from '../lib/events'
import { iconForEvent } from '../lib/eventIcons'

type Props = {
  year: number
  selectedMonth: number
  eventsByMonth: Record<number, CalendarEvent[]>
  onSelectMonth: (month: number) => void
}

const MONTH_ACCENTS = [
  'kesri',
  'akali',
  'field',
  'phulkari',
  'gold',
  'kesri',
  'akali',
  'field',
  'phulkari',
  'gold',
  'akali',
  'kesri',
] as const

function weekdayLabel(year: number, month: number, day: number): string {
  return WEEKDAYS[new Date(year, month, day).getDay()] ?? ''
}

function eventDisplayName(e: CalendarEvent): string {
  const base = e.name?.trim() || 'Event'
  if (e.templateId === 'sangrand') {
    const fromNote = e.note?.match(/^Start of\s+(.+)$/i)?.[1]?.trim()
    if (fromNote) return `Sangrand · ${fromNote}`
    if (!/sangrand/i.test(base)) return `Sangrand · ${base}`
  }
  return base
}

function dayTone(e: CalendarEvent): 'sangrand' | 'pooran' | 'other' {
  if (e.templateId === 'sangrand') return 'sangrand'
  if (e.templateId === 'pooranmashi') return 'pooran'
  return 'other'
}

export function MonthGrid({
  year,
  selectedMonth,
  eventsByMonth,
  onSelectMonth,
}: Props) {
  return (
    <aside className="year-tiles-panel" aria-label={`${year} month tiles`}>
      <div className="year-tiles-head">
        <h3 className="calendar-heading">MonthWise {year}</h3>
        <p className="year-tiles-sub">Tap a month to view its observances</p>
      </div>
      <div className="year-tiles-grid">
        {MONTH_NAMES.map((name, month) => {
          const accent = MONTH_ACCENTS[month]
          const events = [...(eventsByMonth[month] ?? [])]
            .sort((a, b) => (a.day ?? 99) - (b.day ?? 99) || a.name.localeCompare(b.name))
            .slice(0, 4)
          const selected = month === selectedMonth
          return (
            <button
              key={month}
              type="button"
              className={[
                'month-tile',
                `month-tile--${accent}`,
                selected ? 'is-selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectMonth(month)}
              aria-pressed={selected}
              aria-label={`${name} ${year}`}
            >
              <span className="month-tile-accent" aria-hidden="true" />
              <span className="month-tile-title">
                {name}
                <span className="pa">{MONTH_NAMES_PA[month]}</span>
              </span>
              <span className="month-tile-events">
                {events.length === 0 ? (
                  <span className="month-tile-empty">No events</span>
                ) : (
                  events.map((e) => {
                    const tone = dayTone(e)
                    const dayLabel =
                      e.day == null
                        ? 'Not set'
                        : `${String(e.day).padStart(2, '0')} ${weekdayLabel(year, month, e.day)}`
                    return (
                      <span key={e.id} className="month-tile-row">
                        <img
                          className="month-tile-icon"
                          src={iconForEvent(e.templateId)}
                          alt=""
                          width={14}
                          height={14}
                          decoding="async"
                        />
                        <span className={`month-tile-day month-tile-day--${tone}`}>{dayLabel}</span>
                        <span className="month-tile-name">{eventDisplayName(e)}</span>
                      </span>
                    )
                  })
                )}
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
