/** Client-side weather via Open-Meteo (no API key). Always °F. */

export type DayWeather = {
  day: number
  code: number
  /** Short label for accessibility only */
  label: string
  tempMax: number
  tempMin: number
}

export type GeoCoords = { lat: number; lon: number }

export type ResolvedLocation = {
  coords: GeoCoords
  source: 'gps' | 'zip'
  zip?: string
}

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

/** Default ZIP when browser location is denied or unavailable. */
export const DEFAULT_WEATHER_ZIP = '93722'

/** Approximate center of ZIP 93722 (Fresno, CA), already coarse-rounded. */
export const DEFAULT_ZIP_COORDS: GeoCoords = { lat: 36.83, lon: -119.88 }

/** Compact WMO weather interpretation codes (for aria-label). */
export function labelForWeatherCode(code: number): string {
  if (code === 0) return 'Clear'
  if (code === 1) return 'Mostly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Fog'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Showers'
  if (code >= 85 && code <= 86) return 'Snow showers'
  if (code >= 95 && code <= 99) return 'Thunder'
  return 'Weather'
}

export type WeatherIconKind =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder'

export function iconKindForWeatherCode(code: number): WeatherIconKind {
  if (code === 0 || code === 1) return 'clear'
  if (code === 2) return 'partly'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow'
  if (code >= 95 && code <= 99) return 'thunder'
  return 'cloudy'
}

/** Round GPS to ~1 km precision before sending to the forecast API. */
export function roundCoords(coords: GeoCoords, decimals = 2): GeoCoords {
  const f = 10 ** decimals
  return {
    lat: Math.round(coords.lat * f) / f,
    lon: Math.round(coords.lon * f) / f,
  }
}

export function requestBrowserCoords(): Promise<GeoCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not available'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 15 * 60_000 },
    )
  })
}

/** Prefer browser location (rounded); fall back to ZIP 93722. */
export async function resolveCoords(): Promise<ResolvedLocation> {
  try {
    const coords = roundCoords(await requestBrowserCoords())
    return { coords, source: 'gps' }
  } catch {
    return { coords: DEFAULT_ZIP_COORDS, source: 'zip', zip: DEFAULT_WEATHER_ZIP }
  }
}

/**
 * Fetch daily weather covering the current calendar month around `today`,
 * limited by Open-Meteo's past_days / forecast_days window. Temperatures in °F.
 */
export async function fetchMonthDayWeather(
  coords: GeoCoords,
  year: number,
  month: number,
  today: Date = new Date(),
): Promise<Map<number, DayWeather>> {
  const pastDays = Math.max(0, today.getDate() - 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const remaining = daysInMonth - today.getDate() + 1
  const forecastDays = Math.min(16, Math.max(1, remaining))

  const url = new URL(FORECAST_URL)
  url.searchParams.set('latitude', String(coords.lat))
  url.searchParams.set('longitude', String(coords.lon))
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('temperature_unit', 'fahrenheit')
  url.searchParams.set('past_days', String(Math.min(pastDays, 92)))
  url.searchParams.set('forecast_days', String(forecastDays))

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`)

  const data = (await res.json()) as {
    daily?: {
      time: string[]
      weather_code: number[]
      temperature_2m_max: number[]
      temperature_2m_min: number[]
    }
  }

  const daily = data.daily
  const map = new Map<number, DayWeather>()
  if (!daily?.time?.length) return map

  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`

  for (let i = 0; i < daily.time.length; i++) {
    const date = daily.time[i]
    if (!date.startsWith(prefix)) continue
    const day = Number(date.slice(8, 10))
    if (!Number.isFinite(day)) continue
    const code = daily.weather_code[i] ?? 0
    map.set(day, {
      day,
      code,
      label: labelForWeatherCode(code),
      tempMax: Math.round(daily.temperature_2m_max[i] ?? 0),
      tempMin: Math.round(daily.temperature_2m_min[i] ?? 0),
    })
  }

  return map
}
