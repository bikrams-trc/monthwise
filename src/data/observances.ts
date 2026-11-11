/** Predefined Punjabi / Sikh calendar observances users can pick from. */
export type ObservanceTemplate = {
  id: string
  name: string
  namePa?: string
  kind: 'monthly-default' | 'gurpurab' | 'festival' | 'memorial' | 'custom'
  defaultDay?: number
  note?: string
}

export const SANGRAND_DAYS: number[] = [
  13, 12, 14, 14, 15, 15, 16, 16, 15, 15, 14, 14,
]

export const POORANMASHI_DAY = 15

export const PREDEFINED_OBSERVANCES: ObservanceTemplate[] = [
  {
    id: 'pooranmashi',
    name: 'Pooranmashi',
    namePa: 'ਪੂਰਨਮਾਸ਼ੀ',
    kind: 'monthly-default',
    defaultDay: POORANMASHI_DAY,
    note: 'Full moon — monthly observance',
  },
  {
    id: 'sangrand',
    name: 'Sangrand',
    namePa: 'ਸੰਗਰਾਂਦ',
    kind: 'monthly-default',
    note: 'Start of the Nanakshahi month',
  },
  {
    id: 'gurpurab-nanak',
    name: 'Guru Nanak Gurpurab',
    namePa: 'ਗੁਰੂ ਨਾਨਕ ਗੁਰਪੁਰਬ',
    kind: 'gurpurab',
    defaultDay: 15,
    note: 'Parkash Purab of Guru Nanak Dev Ji (Katak)',
  },
  {
    id: 'gurpurab-gobind',
    name: 'Guru Gobind Singh Gurpurab',
    namePa: 'ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਗੁਰਪੁਰਬ',
    kind: 'gurpurab',
    defaultDay: 5,
    note: 'Parkash Purab of Guru Gobind Singh Ji',
  },
  {
    id: 'vaisakhi',
    name: 'Vaisakhi',
    namePa: 'ਵਿਸਾਖੀ',
    kind: 'festival',
    defaultDay: 14,
    note: 'Khalsa founding & harvest festival',
  },
  {
    id: 'bandi-chhor',
    name: 'Bandi Chhor Divas',
    namePa: 'ਬੰਦੀ ਛੋੜ ਦਿਵਸ',
    kind: 'festival',
    defaultDay: 1,
    note: 'Day of Liberation — Diwali for Sikhs',
  },
  {
    id: 'hola-mohalla',
    name: 'Hola Mohalla',
    namePa: 'ਹੋਲਾ ਮਹੱਲਾ',
    kind: 'festival',
    defaultDay: 17,
    note: 'Martial festival at Anandpur Sahib',
  },
  {
    id: 'maghi',
    name: 'Maghi',
    namePa: 'ਮਾਘੀ',
    kind: 'festival',
    defaultDay: 14,
    note: 'Commemorates the forty liberated ones',
  },
  {
    id: 'martyrdom-arbjan',
    name: 'Guru Arjan Dev Martyrdom',
    namePa: 'ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਸ਼ਹੀਦੀ',
    kind: 'memorial',
    defaultDay: 16,
    note: 'Shaheedi Diwas of Guru Arjan Dev Ji',
  },
  {
    id: 'martyrdom-teg-bahadur',
    name: 'Guru Tegh Bahadur Martyrdom',
    namePa: 'ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਸ਼ਹੀਦੀ',
    kind: 'memorial',
    defaultDay: 24,
    note: 'Shaheedi Diwas of Guru Tegh Bahadur Ji',
  },
  {
    id: 'chaar-sahibzade',
    name: 'Chaar Sahibzade Remembrance',
    namePa: 'ਚਾਰ ਸਾਹਿਬਜ਼ਾਦੇ',
    kind: 'memorial',
    defaultDay: 26,
    note: 'Remembrance of the four Sahibzade',
  },
  {
    id: 'gurpurab-amar-das',
    name: 'Guru Amar Das Gurpurab',
    namePa: 'ਗੁਰੂ ਅਮਰ ਦਾਸ ਗੁਰਪੁਰਬ',
    kind: 'gurpurab',
    defaultDay: 23,
  },
  {
    id: 'gurpurab-ram-das',
    name: 'Guru Ram Das Gurpurab',
    namePa: 'ਗੁਰੂ ਰਾਮ ਦਾਸ ਗੁਰਪੁਰਬ',
    kind: 'gurpurab',
    defaultDay: 9,
  },
  {
    id: 'installation-granth',
    name: 'Guru Granth Sahib Installation',
    namePa: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਪ੍ਰਕਾਸ਼',
    kind: 'gurpurab',
    defaultDay: 1,
    note: 'First Parkash of Sri Guru Granth Sahib Ji',
  },
  {
    id: 'custom',
    name: 'Custom event',
    kind: 'custom',
    note: 'Enter your own name',
  },
]

export function sangrandDayForMonth(monthIndex: number): number {
  return SANGRAND_DAYS[monthIndex] ?? 14
}
