import { POORANMASHI_DAY, sangrandDayForMonth } from './observances'

/** Per-year lunar / Nanakshahi month-start days (index 0 = January). */
export type YearMonthDefaults = {
  pooranmashi: number[]
  sangrand: number[]
  /** Nanakshahi month that begins on each Sangrand day */
  nanakshahiMonths: string[]
}

export const YEAR_DEFAULTS: Record<number, YearMonthDefaults> = {
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

export function pooranmashiDayFor(year: number, month: number): number {
  return YEAR_DEFAULTS[year]?.pooranmashi[month] ?? POORANMASHI_DAY
}

export function sangrandDayFor(year: number, month: number): number {
  return YEAR_DEFAULTS[year]?.sangrand[month] ?? sangrandDayForMonth(month)
}

export function nanakshahiMonthFor(year: number, month: number): string | undefined {
  return YEAR_DEFAULTS[year]?.nanakshahiMonths[month]
}
