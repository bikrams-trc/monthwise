import { useEffect, useId, useMemo, useState } from 'react'
import {
  MONTH_NAMES,
  MONTH_NAMES_PA,
  getEventsForYear,
  type CalendarEvent,
} from '../lib/events'
import { iconForEvent } from '../lib/eventIcons'
import {
  MAX_EXPORT_EVENTS_PER_MONTH,
  defaultExportSelection,
  exportYearToPdf,
} from '../lib/exportYearPdf'

type Props = {
  year: number
  onClose: () => void
  onExported: () => void
}

export function ExportModal({ year, onClose, onExported }: Props) {
  const titleId = useId()
  const eventsByMonth = useMemo(() => getEventsForYear(year), [year])
  const [selected, setSelected] = useState<Record<number, string[]>>(() =>
    defaultExportSelection(eventsByMonth),
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const totalSelected = useMemo(
    () => Object.values(selected).reduce((n, ids) => n + ids.length, 0),
    [selected],
  )

  function toggle(month: number, event: CalendarEvent) {
    setSelected((prev) => {
      const current = prev[month] ?? []
      const has = current.includes(event.id)
      if (has) return { ...prev, [month]: current.filter((id) => id !== event.id) }
      if (current.length >= MAX_EXPORT_EVENTS_PER_MONTH) return prev
      return { ...prev, [month]: [...current, event.id] }
    })
  }

  function selectDefaultsForMonth(month: number) {
    const defaults = defaultExportSelection({ [month]: eventsByMonth[month] ?? [] })
    setSelected((prev) => ({ ...prev, [month]: defaults[month] ?? [] }))
  }

  function clearMonth(month: number) {
    setSelected((prev) => ({ ...prev, [month]: [] }))
  }

  function selectAllDefaults() {
    setSelected(defaultExportSelection(eventsByMonth))
  }

  function clearAll() {
    const empty: Record<number, string[]> = {}
    for (let m = 0; m < 12; m++) empty[m] = []
    setSelected(empty)
  }

  async function confirmExport() {
    if (busy) return
    if (totalSelected === 0) {
      setError('Select at least one event to export.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const capped: Record<number, string[]> = {}
      for (let m = 0; m < 12; m++) {
        capped[m] = (selected[m] ?? []).slice(0, MAX_EXPORT_EVENTS_PER_MONTH)
      }
      await exportYearToPdf(year, eventsByMonth, capped)
      onExported()
      onClose()
    } catch (err) {
      console.error(err)
      setError('Could not export PDF. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={() => !busy && onClose()}>
      <div
        className="modal export-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId}>Export {year} PDF</h3>
        <p className="export-lead">
          One page for the whole year. Choose up to{' '}
          <strong>{MAX_EXPORT_EVENTS_PER_MONTH} events per month</strong> ({totalSelected} selected).
        </p>
        <div className="export-toolbar">
          <button type="button" className="btn btn-ghost" onClick={selectAllDefaults} disabled={busy}>
            Defaults all months
          </button>
          <button type="button" className="btn btn-ghost" onClick={clearAll} disabled={busy}>
            Clear all
          </button>
        </div>
        <div className="export-months">
          {Array.from({ length: 12 }, (_, month) => {
            const events = eventsByMonth[month] ?? []
            const picked = selected[month] ?? []
            const atCap = picked.length >= MAX_EXPORT_EVENTS_PER_MONTH
            return (
              <section key={month} className="export-month">
                <header className="export-month-head">
                  <div>
                    <strong>
                      {MONTH_NAMES[month]}
                      <span className="pa"> {MONTH_NAMES_PA[month]}</span>
                    </strong>
                    <span className="export-count">
                      {picked.length}/{MAX_EXPORT_EVENTS_PER_MONTH}
                    </span>
                  </div>
                  <div className="export-month-actions">
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => selectDefaultsForMonth(month)}
                      disabled={busy}
                    >
                      Defaults
                    </button>
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => clearMonth(month)}
                      disabled={busy || picked.length === 0}
                    >
                      Clear
                    </button>
                  </div>
                </header>
                {events.length === 0 ? (
                  <p className="export-empty">No events this month.</p>
                ) : (
                  <ul className="export-event-list">
                    {events.map((e) => {
                      const checked = picked.includes(e.id)
                      const disabled = busy || (!checked && atCap)
                      return (
                        <li key={e.id}>
                          <label
                            className={`export-event${disabled && !checked ? ' is-disabled' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              onChange={() => toggle(month, e)}
                            />
                            <img
                              className="export-event-icon"
                              src={iconForEvent(e.templateId)}
                              alt=""
                              width={22}
                              height={22}
                            />
                            <span className="export-event-day">
                              {e.day == null ? 'Not set' : e.day}
                            </span>
                            <span className="export-event-name">
                              {e.name}
                              {e.namePa ? <span className="pa"> · {e.namePa}</span> : null}
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
        {error && (
          <p className="export-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={confirmExport}
            disabled={busy || totalSelected === 0}
          >
            {busy ? 'Exporting…' : 'Download one-page PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
