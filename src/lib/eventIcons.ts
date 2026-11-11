const ICON_BY_TEMPLATE: Record<string, string> = {
  pooranmashi: '/icons/pooranmashi.svg',
  sangrand: '/icons/sangrand.svg',
  'gurpurab-nanak': '/icons/gurpurab.svg',
  'gurpurab-gobind': '/icons/gurpurab.svg',
  'gurpurab-amar-das': '/icons/gurpurab.svg',
  'gurpurab-ram-das': '/icons/gurpurab.svg',
  'installation-granth': '/icons/granth.svg',
  vaisakhi: '/icons/vaisakhi.svg',
  'bandi-chhor': '/icons/bandi-chhor.svg',
  'hola-mohalla': '/icons/hola-mohalla.svg',
  maghi: '/icons/maghi.svg',
  'martyrdom-arbjan': '/icons/memorial.svg',
  'martyrdom-teg-bahadur': '/icons/memorial.svg',
  'chaar-sahibzade': '/icons/memorial.svg',
  custom: '/icons/custom.svg',
}

export function iconForEvent(templateId?: string): string {
  if (templateId && ICON_BY_TEMPLATE[templateId]) return ICON_BY_TEMPLATE[templateId]
  return '/icons/custom.svg'
}
