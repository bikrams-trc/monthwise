import type { CalendarEvent } from '../lib/events'
import { iconForEvent } from '../lib/eventIcons'

type Props = {
  events: CalendarEvent[]
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
}

export function EventList({ events, onEdit, onDelete }: Props) {
  return (
    <section className="events-panel events-panel--main" aria-labelledby="events-heading">
      <h3 id="events-heading">This month</h3>
      <p className="events-sub">
        Pooranmashi and Sangrand are added by default. Edit or remove them anytime.
      </p>
      {events.length === 0 ? (
        <p className="empty-events">No observances this month. Add one to get started.</p>
      ) : (
        <ul className="event-list">
          {events.map((e, i) => (
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
          ))}
        </ul>
      )}
    </section>
  )
}
