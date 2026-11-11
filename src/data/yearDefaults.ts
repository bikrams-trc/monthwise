import { POORANMASHI_DAY, sangrandDayForMonth } from './observances'

/** Per-year lunar / Nanakshahi month-start days (index 0 = January). */
export type YearMonthDefaults = {
  /** One or more Pooranmashi days per month (May 2026 has two). */
  pooranmashi: Array<number | number[]>
  sangrand: number[]
  /** Nanakshahi month that begins on each Sangrand day */
  nanakshahiMonths: string[]
}

export const YEAR_DEFAULTS: Record<number, YearMonthDefaults> = {
  2026: {
    // From 2026 Full Moon / Sangrand chart (May has two full moons)
    pooranmashi: [3, 1, 3, 2, [1, 31], 29, 29, 28, 26, 26, 24, 23],
    sangrand: [14, 12, 14, 14, 15, 15, 16, 17, 17, 17, 16, 16],
    nanakshahiMonths: [
      'Magh',
      'Phagun',
      'Chait',
      'Vaisakh',
      'Jeth',
      'Harh',
      'Sawan',
      'Bhadon',
      'Assu',
      'Katak',
      'Maghar',
      'Poh',
    ],
  },
  2027: {
    // From 2027 Full Moon / Sangrand chart
    pooranmashi: [22, 20, 22, 20, 20, 19, 18, 17, 15, 15, 14, 13],
    sangrand: [14, 13, 15, 14, 15, 15, 17, 17, 17, 17, 16, 16],
    nanakshahiMonths: [
      'Magh',
      'Phagun',
      'Chait',
      'Baisakh',
      'Jeth',
      'Harh',
      'Sawan',
      'Bhadon',
      'Assu',
      'Katak',
      'Maghar',
      'Poh',
    ],
  },
}

export function pooranmashiDaysFor(year: number, month: number): number[] {
  const raw = YEAR_DEFAULTS[year]?.pooranmashi[month]
  if (raw == null) return [POORANMASHI_DAY]
  return Array.isArray(raw) ? raw : [raw]
}

export function pooranmashiDayFor(year: number, month: number): number {
  return pooranmashiDaysFor(year, month)[0] ?? POORANMASHI_DAY
}

export function sangrandDayFor(year: number, month: number): number {
  return YEAR_DEFAULTS[year]?.sangrand[month] ?? sangrandDayForMonth(month)
}

export function nanakshahiMonthFor(year: number, month: number): string | undefined {
  return YEAR_DEFAULTS[year]?.nanakshahiMonths[month]
}

export function hasYearDefaults(year: number): boolean {
  return YEAR_DEFAULTS[year] != null
}
