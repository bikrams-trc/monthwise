import { useCallback, useMemo, useState } from 'react'
import { EventList } from './components/EventList'
import { EventModal } from './components/EventModal'
import { ExportModal } from './components/ExportModal'
import { MonthGrid } from './components/MonthGrid'
import { useEventWeather } from './hooks/useEventWeather'
import {
  MONTH_NAMES,
  MONTH_NAMES_PA,
  addEvent,
  deleteEvent,
  getEventsForMonth,
  updateEvent,
  type CalendarEvent,
} from './lib/events'

/** Present year and next year only (e.g. 2026, 2027). */
function yearOptions(present: number): number[] {
  return [present, present + 1]
}

export default function App() {
  const now = new Date()
  const presentYear = now.getFullYear()
  const maxYear = presentYear + 1
  const [year, setYear] = useState(presentYear)
  const [month, setMonth] = useState(now.getMonth())
  const [tick, setTick] = useState(0)
  const [modal, setModal] = useState<null | { mode: 'add' | 'edit'; event?: CalendarEvent }>(null)
  const [exportOpen, setExportOpen] = useState(false)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  const events = useMemo(() => {
    void tick
    return getEventsForMonth(year, month)
  }, [year, month, tick])

  const eventDays = useMemo(() => [...new Set(events.map((e) => e.day))], [events])
  const weather = useEventWeather(year, month, eventDays)

  const years = useMemo(() => yearOptions(presentYear), [presentYear])

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1)
    const nextYear = d.getFullYear()
    if (nextYear < presentYear || nextYear > maxYear) return
    setYear(nextYear)
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
        <div className="hero-visual" aria-hidden="true">
          <svg className="hero-constellations" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
            <title>Star constellations marking Sangrands</title>
            {/* Scattered sky stars */}
            <g className="sky-stars" fill="#f7d98a">
              {[
                [48, 72], [110, 40], [180, 95], [260, 55], [320, 120], [400, 38],
                [470, 88], [540, 50], [610, 110], [700, 42], [780, 95], [850, 60],
                [960, 130], [1040, 70], [1120, 100], [160, 160], [300, 200],
                [520, 150], [680, 180], [820, 155], [980, 200], [90, 210],
              ].map(([x, y], i) => (
                <circle key={`s-${i}`} cx={x} cy={y} r={i % 5 === 0 ? 1.8 : 1.1} opacity={0.35 + (i % 4) * 0.12} />
              ))}
            </g>
            {/* Twelve Sangrand markers — small mustard constellations across the sky */}
            {[
              { x: 90, y: 130, pts: '0,18 12,0 24,18 8,11 16,11' },
              { x: 210, y: 70, pts: '0,20 10,0 20,20' },
              { x: 340, y: 100, pts: '0,0 8,16 22,4 0,10 22,16' },
              { x: 470, y: 55, pts: '0,12 14,0 28,12 14,24' },
              { x: 600, y: 95, pts: '0,0 0,22 18,11' },
              { x: 730, y: 65, pts: '0,16 10,0 20,16 10,10' },
              { x: 120, y: 250, pts: '0,0 16,6 8,22 8,10' },
              { x: 280, y: 230, pts: '0,10 12,0 24,10 18,22 6,22' },
              { x: 450, y: 210, pts: '0,18 14,0 28,18' },
              { x: 620, y: 240, pts: '0,0 20,4 12,22 4,10 16,10' },
              { x: 790, y: 220, pts: '0,12 16,0 32,12 24,26 8,26' },
              { x: 960, y: 250, pts: '0,0 8,18 22,6 0,10 22,14' },
            ].map((c, i) => (
              <g key={`c-${i}`} className="sangrand-constellation" transform={`translate(${c.x} ${c.y})`}>
                <polygon
                  points={c.pts}
                  fill="none"
                  stroke="rgba(242,193,78,0.45)"
                  strokeWidth="1"
                />
                {c.pts.split(' ').map((pair, j) => {
                  const [px, py] = pair.split(',').map(Number)
                  return <circle key={j} cx={px} cy={py} r="2.2" fill="#f2c14e" />
                })}
              </g>
            ))}
          </svg>
          <img className="hero-moon" src="/hero-moon.png" alt="" width={294} height={213} decoding="async" />
        </div>
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
            weatherEnabled={weather.enabled}
            weatherStatus={weather.status}
            weatherByDay={weather.byDay}
            onRetryWeather={weather.retry}
          />
          <MonthGrid
            year={year}
            month={month}
            events={events}
            animKey={`${year}-${month}-${tick}`}
          />
        </div>

        <p className="footer-note">
          Events stay on this device (localStorage). Defaults: Pooranmashi &amp; Sangrand each month (2027 uses lunar chart dates). Current-month event weather uses your location (°F).
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
