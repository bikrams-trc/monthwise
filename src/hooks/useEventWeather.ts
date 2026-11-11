import { useEffect, useState } from 'react'
import {
  DEFAULT_WEATHER_ZIP,
  fetchMonthDayWeather,
  resolveCoords,
  type DayWeather,
  type ResolvedLocation,
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
  /** Shown when weather uses the ZIP fallback instead of GPS. */
  locationNote: string | null
  retry: () => void
}

function isCurrentMonth(year: number, month: number, now = new Date()): boolean {
  return year === now.getFullYear() && month === now.getMonth()
}

let cachedLocation: ResolvedLocation | null = null

export function useEventWeather(
  year: number,
  month: number,
  eventDays: number[],
): EventWeatherState {
  const enabled = isCurrentMonth(year, month)
  const [status, setStatus] = useState<WeatherStatus>(enabled ? 'locating' : 'idle')
  const [byDay, setByDay] = useState<Record<number, DayWeather>>({})
  const [locationNote, setLocationNote] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  const dayKey = [...eventDays].sort((a, b) => a - b).join(',')

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    const days = dayKey
      ? dayKey.split(',').map((d) => Number(d)).filter((d) => Number.isFinite(d))
      : []

    async function load() {
      setStatus(cachedLocation ? 'loading' : 'locating')
      try {
        const location = cachedLocation ?? (await resolveCoords())
        if (cancelled) return
        cachedLocation = location
        setStatus('loading')
        const map = await fetchMonthDayWeather(location.coords, year, month)
        if (cancelled) return
        const next: Record<number, DayWeather> = {}
        for (const day of days) {
          const w = map.get(day)
          if (w) next[day] = w
        }
        setByDay(next)
        setLocationNote(
          location.source === 'zip'
            ? `Using ZIP ${location.zip ?? DEFAULT_WEATHER_ZIP} for weather`
            : null,
        )
        setStatus('ready')
      } catch {
        if (cancelled) return
        setByDay({})
        setLocationNote(null)
        setStatus('error')
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
    locationNote: enabled ? locationNote : null,
    retry: () => {
      cachedLocation = null
      setRetryToken((t) => t + 1)
    },
  }
}
