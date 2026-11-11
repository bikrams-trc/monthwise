import type { CalendarEvent } from '../lib/events'
import { MONTH_NAMES, MONTH_NAMES_PA, WEEKDAYS } from '../lib/events'
import { iconForEvent } from '../lib/eventIcons'
import type { DayWeather } from '../lib/weather'
import type { WeatherStatus } from '../hooks/useEventWeather'
import { WeatherIcon } from './WeatherIcon'

function weekdayFor(event: CalendarEvent): string {
  if (event.day == null) return ''
  return WEEKDAYS[new Date(event.year, event.month, event.day).getDay()] ?? ''
}

type Props = {
  year: number
  month: number
  events: CalendarEvent[]
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
  weatherEnabled?: boolean
  weatherStatus?: WeatherStatus
  weatherByDay?: Record<number, DayWeather>
  weatherLocationNote?: string | null
  onRetryWeather?: () => void
}

function weatherStatusText(status: WeatherStatus | undefined): string | null {
  if (status === 'locating') return 'Finding your location…'
  if (status === 'loading') return 'Loading weather…'
  if (status === 'denied') return 'Allow location to show weather for event days.'
  if (status === 'unavailable') return 'Location is not available in this browser.'
  if (status === 'error') return 'Could not load weather for this location.'
  return null
}

export function EventList({
  year,
  month,
  events,
  onEdit,
  onDelete,
  weatherEnabled,
  weatherStatus,
  weatherByDay,
  weatherLocationNote,
  onRetryWeather,
}: Props) {
  const statusText = weatherEnabled ? weatherStatusText(weatherStatus) : null
  const showRetry = weatherEnabled && weatherStatus === 'error' && onRetryWeather
  const monthName = MONTH_NAMES[month] ?? 'Month'
  const monthNamePa = MONTH_NAMES_PA[month]
  const note = statusText ?? (weatherEnabled ? weatherLocationNote : null)

  return (
    <section className="events-panel events-panel--main" aria-labelledby="events-heading">
      <h3 id="events-heading">
        {monthName} {year}
        {monthNamePa ? <span className="pa"> {monthNamePa}</span> : null}
      </h3>
      <p className="events-sub">
        Pooranmashi and Sangrand are added by default. Chart years use lunar dates; otherwise set the day when you know it.
      </p>
      {note && (
        <p className="weather-status">
          {note}
          {showRetry && (
            <>
              {' '}
              <button type="button" className="linkish" onClick={onRetryWeather}>
                Try again
              </button>
            </>
          )}
        </p>
      )}
      {events.length === 0 ? (
        <p className="empty-events">No observances this month. Add one to get started.</p>
      ) : (
        <ul className="event-list">
          {events.map((e, i) => {
            const weather =
              weatherEnabled && e.day != null ? weatherByDay?.[e.day] : undefined
            const weekday = weekdayFor(e)
            return (
              <li key={e.id} className="event-item" style={{ animationDelay: `${i * 40}ms` }}>
                <img
                  className="event-icon"
                  src={iconForEvent(e.templateId)}
                  alt=""
                  width={40}
                  height={40}
                  decoding="async"
                />
                <div
                  className={`event-day${e.day == null ? ' event-day--unset' : ''}`}
                  aria-hidden="true"
                >
                  {e.day == null ? (
                    <span className="event-day-unset">Not set</span>
                  ) : (
                    <>
                      <span className="event-day-num">{e.day}</span>
                      {weekday && <span className="event-day-weekday">{weekday}</span>}
                    </>
                  )}
                </div>
                <div className="event-body">
                  <strong>{e.name}</strong>
                  {e.namePa && <span className="pa">{e.namePa}</span>}
                  {e.note && <div className="note">{e.note}</div>}
                  {weather && (
                    <div
                      className="event-weather"
                      aria-label={`${weather.label}, high ${weather.tempMax} degrees Fahrenheit, low ${weather.tempMin} degrees`}
                    >
                      <WeatherIcon code={weather.code} label={weather.label} className="weather-glyph" />
                      <span className="weather-temps" aria-hidden="true">
                        <span className="weather-high">{weather.tempMax}°</span>
                        <span className="weather-low">{weather.tempMin}°</span>
                      </span>
                    </div>
                  )}
                </div>
                <div className="event-actions">
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label={`Edit ${e.name}`}
                    onClick={() => onEdit(e)}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label={`Delete ${e.name}`}
                    onClick={() => {
                      if (confirm(`Delete “${e.name}”?`)) onDelete(e.id)
                    }}
                  >
                    ✕
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
