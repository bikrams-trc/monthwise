import type { CalendarEvent } from '../lib/events'
import { iconForEvent } from '../lib/eventIcons'
import type { DayWeather } from '../lib/weather'
import type { WeatherStatus } from '../hooks/useEventWeather'
import { WeatherIcon } from './WeatherIcon'

type Props = {
  events: CalendarEvent[]
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
  weatherEnabled?: boolean
  weatherStatus?: WeatherStatus
  weatherByDay?: Record<number, DayWeather>
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
  events,
  onEdit,
  onDelete,
  weatherEnabled,
  weatherStatus,
  weatherByDay,
  onRetryWeather,
}: Props) {
  const statusText = weatherEnabled ? weatherStatusText(weatherStatus) : null
  const showRetry =
    weatherEnabled && (weatherStatus === 'denied' || weatherStatus === 'error') && onRetryWeather

  return (
    <section className="events-panel events-panel--main" aria-labelledby="events-heading">
      <h3 id="events-heading">This month</h3>
      <p className="events-sub">
        Pooranmashi and Sangrand are added by default. Edit or remove them anytime.
      </p>
      {statusText && (
        <p className="weather-status">
          {statusText}
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
            const weather = weatherEnabled ? weatherByDay?.[e.day] : undefined
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
                <div className="event-day" aria-hidden="true">
                  {e.day}
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
