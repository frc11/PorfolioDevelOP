export const LEAD_STATUS_VALUES = [
  'NUEVO',
  'CONTACTADO',
  'NEGOCIANDO',
  'CERRADO',
  'DESCARTADO',
] as const

export type LeadStatus = (typeof LEAD_STATUS_VALUES)[number]
