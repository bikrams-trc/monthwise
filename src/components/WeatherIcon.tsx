import { iconKindForWeatherCode, type WeatherIconKind } from '../lib/weather'

type Props = {
  code: number
  label: string
  className?: string
}

function paths(kind: WeatherIconKind) {
  switch (kind) {
    case 'clear':
      return (
        <>
          <circle cx="20" cy="20" r="7" fill="currentColor" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180
            const x1 = 20 + Math.cos(rad) * 11
            const y1 = 20 + Math.sin(rad) * 11
            const x2 = 20 + Math.cos(rad) * 15.5
            const y2 = 20 + Math.sin(rad) * 15.5
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )
          })}
        </>
      )
    case 'partly':
      return (
        <>
          <circle cx="14" cy="14" r="5" fill="currentColor" opacity="0.9" />
          <path
            d="M12 28h14a6 6 0 0 0 0-12 7.5 7.5 0 0 0-14.2-2A5.5 5.5 0 0 0 12 28z"
            fill="currentColor"
            opacity="0.85"
          />
        </>
      )
    case 'cloudy':
      return (
        <path
          d="M10 28h18a7 7 0 0 0 0-14 8.5 8.5 0 0 0-16.3-2.2A6.5 6.5 0 0 0 10 28z"
          fill="currentColor"
        />
      )
    case 'fog':
      return (
        <>
          <path
            d="M11 18h18a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.4-1.8A4.5 4.5 0 0 0 11 18z"
            fill="currentColor"
            opacity="0.75"
          />
          <path d="M8 23h24M10 27h20M12 31h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case 'drizzle':
      return (
        <>
          <path
            d="M10 18h18a6 6 0 0 0 0-12 7.5 7.5 0 0 0-14.2-2A5.5 5.5 0 0 0 10 18z"
            fill="currentColor"
          />
          <path d="M14 24v4M20 23v5M26 24v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )
    case 'rain':
      return (
        <>
          <path
            d="M10 17h18a6 6 0 0 0 0-12 7.5 7.5 0 0 0-14.2-2A5.5 5.5 0 0 0 10 17z"
            fill="currentColor"
          />
          <path
            d="M13 22l-2 6M20 21l-2 7M27 22l-2 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )
    case 'snow':
      return (
        <>
          <path
            d="M10 17h18a6 6 0 0 0 0-12 7.5 7.5 0 0 0-14.2-2A5.5 5.5 0 0 0 10 17z"
            fill="currentColor"
          />
          <path
            d="M14 23v6M11 26h6M20 22v7M17 25.5h6M26 23v6M23 26h6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      )
    case 'thunder':
      return (
        <>
          <path
            d="M10 16h18a6 6 0 0 0 0-12 7.5 7.5 0 0 0-14.2-2A5.5 5.5 0 0 0 10 16z"
            fill="currentColor"
          />
          <path d="M22 17l-6 8h5l-2 8 8-10h-5l2-6z" fill="currentColor" />
        </>
      )
  }
}

export function WeatherIcon({ code, label, className }: Props) {
  const kind = iconKindForWeatherCode(code)
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      width={28}
      height={28}
      aria-label={label}
      role="img"
    >
      {paths(kind)}
    </svg>
  )
}
