import type { CalendarEvent } from '../lib/events'
import { daysInMonth, firstWeekday, WEEKDAYS } from '../lib/events'
import { PREDEFINED_OBSERVANCES } from '../data/observances'

type Props = {
  year: number
  month: number
  events: CalendarEvent[]
  animKey: string
}

function kindFor(event: CalendarEvent): string {
  const t = PREDEFINED_OBSERVANCES.find((o) => o.id === event.templateId)
  return t?.kind ?? 'custom'
}

export function MonthGrid({ year, month, events, animKey }: Props) {
  const total = daysInMonth(year, month)
  const start = firstWeekday(year, month)
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const byDay = new Map<number, CalendarEvent[]>()
  for (const e of events) {
    const list = byDay.get(e.day) ?? []
    list.push(e)
    byDay.set(e.day, list)
  }

  const cells: Array<{ day: number | null; index: number }> = []
  for (let i = 0; i < start; i++) cells.push({ day: null, index: i })
  for (let d = 1; d <= total; d++) cells.push({ day: d, index: start + d - 1 })

  return (
    <aside className="calendar-panel calendar-panel--compact" key={animKey}>
      <h3 className="calendar-heading">Glance</h3>
      <div className="weekday-row" aria-hidden="true">
        {WEEKDAYS.map((w) => (
          <div key={w} className="weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="day-grid" role="grid" aria-label="Month overview">
        {cells.map(({ day, index }) => {
          if (day === null) {
            return <div key={`e-${index}`} className="day-cell empty" />
          }
          const dayEvents = byDay.get(day) ?? []
          const isToday = isCurrentMonth && today.getDate() === day
          return (
            <div
              key={day}
              className={[
                'day-cell',
                dayEvents.length ? 'has-events' : '',
                isToday ? 'today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ animationDelay: `${index * 12}ms` }}
              role="gridcell"
              aria-label={`${day}${dayEvents.length ? `, ${dayEvents.length} events` : ''}`}
            >
              <span className="day-num">{day}</span>
              {dayEvents.length > 0 && (
                <span className="day-dots" aria-hidden="true">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className={`dot ${kindFor(e)}`} />
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
