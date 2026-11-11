import { useEffect, useState } from 'react'
import {
  fetchMonthDayWeather,
  resolveCoords,
  type DayWeather,
  type GeoCoords,
} from '../lib/weather'

export type WeatherStatus =
  | 'idle'
  | 'locating'
  | 'loading'
  | 'ready'
  | 'denied'
  | 'unavailable'
  | 'error'

export type EventWeatherState = {
  enabled: boolean
  status: WeatherStatus
  byDay: Record<number, DayWeather>
  retry: () => void
}

function isCurrentMonth(year: number, month: number, now = new Date()): boolean {
  return year === now.getFullYear() && month === now.getMonth()
}

let cachedCoords: GeoCoords | null = null

export function useEventWeather(
  year: number,
  month: number,
  eventDays: number[],
): EventWeatherState {
  const enabled = isCurrentMonth(year, month)
  const [status, setStatus] = useState<WeatherStatus>(enabled ? 'locating' : 'idle')
  const [byDay, setByDay] = useState<Record<number, DayWeather>>({})
  const [retryToken, setRetryToken] = useState(0)

  const dayKey = [...eventDays].sort((a, b) => a - b).join(',')

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    const days = dayKey
      ? dayKey.split(',').map((d) => Number(d)).filter((d) => Number.isFinite(d))
      : []

    async function load() {
      setStatus(cachedCoords ? 'loading' : 'locating')
      try {
        const coords = cachedCoords ?? (await resolveCoords())
        if (cancelled) return
        cachedCoords = coords
        setStatus('loading')
        const map = await fetchMonthDayWeather(coords, year, month)
        if (cancelled) return
        const next: Record<number, DayWeather> = {}
        for (const day of days) {
          const w = map.get(day)
          if (w) next[day] = w
        }
        setByDay(next)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        setByDay({})
        const code =
          err && typeof err === 'object' && 'code' in err
            ? Number((err as { code: number }).code)
            : NaN
        if (code === 1) setStatus('denied')
        else if (code === 2 || !navigator.geolocation) setStatus('unavailable')
        else setStatus('error')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [enabled, year, month, dayKey, retryToken])

  return {
    enabled,
    status: enabled ? status : 'idle',
    byDay: enabled ? byDay : {},
    retry: () => {
      cachedCoords = null
      setRetryToken((t) => t + 1)
    },
  }
}
