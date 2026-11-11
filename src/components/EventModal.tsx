import { useEffect, useId, useState } from 'react'
import { PREDEFINED_OBSERVANCES } from '../data/observances'
import type { CalendarEvent } from '../lib/events'
import { daysInMonth } from '../lib/events'

type Props = {
  mode: 'add' | 'edit'
  year: number
  month: number
  initial?: CalendarEvent | null
  onClose: () => void
  onSave: (data: Omit<CalendarEvent, 'id'> & { id?: string }) => void
  onDelete?: (id: string) => void
}

export function EventModal({ mode, year, month, initial, onClose, onSave, onDelete }: Props) {
  const titleId = useId()
  const maxDay = daysInMonth(year, month)
  const [templateId, setTemplateId] = useState(initial?.templateId ?? 'pooranmashi')
  const [name, setName] = useState(initial?.name ?? 'Pooranmashi')
  const [namePa, setNamePa] = useState(initial?.namePa ?? 'ਪੂਰਨਮਾਸ਼ੀ')
  const [day, setDay] = useState<number | ''>(initial?.day ?? '')
  const [note, setNote] = useState(initial?.note ?? '')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function applyTemplate(id: string) {
    setTemplateId(id)
    const t = PREDEFINED_OBSERVANCES.find((o) => o.id === id)
    if (!t) return
    if (id === 'custom') {
      setName('')
      setNamePa('')
      setNote('')
      setDay('')
      return
    }
    setName(t.name)
    setNamePa(t.namePa ?? '')
    setNote(t.note ?? '')
    // Do not auto-fill dates for defaults — user sets the day
    setDay('')
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const dayValue =
      day === '' || !Number.isFinite(Number(day))
        ? null
        : Math.min(Math.max(1, Number(day)), maxDay)
    onSave({
      id: initial?.id,
      year,
      month,
      day: dayValue,
      name: trimmed,
      namePa: namePa.trim() || undefined,
      templateId: templateId === 'custom' ? 'custom' : templateId,
      note: note.trim() || undefined,
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId}>{mode === 'add' ? 'Add observance' : 'Edit observance'}</h3>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="template">From list</label>
            <select
              id="template"
              value={templateId}
              onChange={(e) => applyTemplate(e.target.value)}
              disabled={mode === 'edit'}
            >
              {PREDEFINED_OBSERVANCES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                  {o.namePa ? ` · ${o.namePa}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="namePa">Punjabi name (optional)</label>
            <input id="namePa" value={namePa} onChange={(e) => setNamePa(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="day">Day of month (optional)</label>
            <input
              id="day"
              type="number"
              min={1}
              max={maxDay}
              value={day}
              placeholder="Not set"
              onChange={(e) => {
                const v = e.target.value
                setDay(v === '' ? '' : Number(v))
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="note">Note (optional)</label>
            <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="modal-actions">
            {mode === 'edit' && initial && onDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (confirm(`Delete “${initial.name}”?`)) onDelete(initial.id)
                }}
              >
                Delete
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
