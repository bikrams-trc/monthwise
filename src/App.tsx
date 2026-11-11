import { useCallback, useMemo, useState } from 'react'
import { EventList } from './components/EventList'
import { EventModal } from './components/EventModal'
import { ExportModal } from './components/ExportModal'
import { MonthGrid } from './components/MonthGrid'
import {
  MONTH_NAMES,
  MONTH_NAMES_PA,
  addEvent,
  deleteEvent,
  getEventsForMonth,
  updateEvent,
  type CalendarEvent,
} from './lib/events'

function yearOptions(center: number): number[] {
  const years: number[] = []
  for (let y = center - 40; y <= center + 40; y++) years.push(y)
  return years
}

export default function App() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [tick, setTick] = useState(0)
  const [modal, setModal] = useState<null | { mode: 'add' | 'edit'; event?: CalendarEvent }>(null)
  const [exportOpen, setExportOpen] = useState(false)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  const events = useMemo(() => {
    void tick
    return getEventsForMonth(year, month)
  }, [year, month, tick])

  const years = useMemo(() => yearOptions(now.getFullYear()), [])

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  function goToday() {
    const t = new Date()
    setYear(t.getFullYear())
    setMonth(t.getMonth())
  }

  function handleSave(data: Omit<CalendarEvent, 'id'> & { id?: string }) {
    if (data.id) updateEvent(data.id, data)
    else addEvent(data)
    setModal(null)
    refresh()
  }

  function handleDelete(id: string) {
    deleteEvent(id)
    setModal(null)
    refresh()
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-visual" aria-hidden="true" />
        <svg className="khanda" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="28" fill="none" stroke="#f2c14e" strokeWidth="3" />
          <circle cx="50" cy="50" r="8" fill="#e85d04" />
          <path
            d="M50 12v16M50 72v16M18 50h16M66 50h16"
            stroke="#f2c14e"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M28 28c8 6 12 14 14 22M72 28c-8 6-12 14-14 22M28 72c8-6 12-14 14-22M72 72c-8-6-12-14-14-22"
            fill="none"
            stroke="#f7d98a"
            strokeWidth="2"
          />
        </svg>
        <div className="hero-copy">
          <h1 className="brand">
            MonthWise
            <span className="brand-pa">ਮਹੀਨਾਵਾਰ ਕੈਲੰਡਰ</span>
          </h1>
          <p className="hero-tagline">
            A festive monthly glance at Punjabi &amp; Sikh observances — warm as a mustard field at
            dusk.
          </p>
          <div className="cta-row">
            <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
              Add observance
            </button>
            <a className="btn btn-ghost" href="#calendar">
              Browse months
            </a>
          </div>
        </div>
      </header>

      <main className="main" id="calendar">
        <div className="toolbar">
          <div className="month-nav">
            <button type="button" className="btn-icon" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
              ‹
            </button>
            <div className="month-title">
              <h2>
                {MONTH_NAMES[month]} {year}
                <span className="pa">{MONTH_NAMES_PA[month]}</span>
              </h2>
            </div>
            <button type="button" className="btn-icon" aria-label="Next month" onClick={() => shiftMonth(1)}>
              ›
            </button>
          </div>
          <div className="year-jump">
            <button type="button" className="btn btn-ghost" onClick={goToday}>
              Today
            </button>
            <label className="sr-only" htmlFor="year-select">
              Year
            </label>
            <select
              id="year-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-ghost btn-export"
              onClick={() => setExportOpen(true)}
              title={`Choose events and export ${year} as a one-page PDF`}
            >
              Export {year} PDF
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
              Add
            </button>
          </div>
        </div>

        <div className="layout">
          <EventList
            events={events}
            onEdit={(event) => setModal({ mode: 'edit', event })}
            onDelete={handleDelete}
          />
          <MonthGrid
            year={year}
            month={month}
            events={events}
            animKey={`${year}-${month}-${tick}`}
          />
        </div>

        <p className="footer-note">
          Events stay on this device (localStorage). Defaults: Pooranmashi &amp; Sangrand each month (2027 uses lunar chart dates).
        </p>
      </main>

      {modal && (
        <EventModal
          mode={modal.mode}
          year={year}
          month={month}
          initial={modal.event}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {exportOpen && (
        <ExportModal year={year} onClose={() => setExportOpen(false)} onExported={refresh} />
      )}
    </div>
  )
}
