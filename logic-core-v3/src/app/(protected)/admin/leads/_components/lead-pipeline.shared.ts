export const ACTIVE_PIPELINE_STATUSES = [
  'PROSPECTO',
  'DEMO_ENVIADA',
  'VIO_VIDEO',
  'RESPONDIO',
  'CALL_AGENDADA',
  'CERRADO',
] as const

export const ARCHIVED_PIPELINE_STATUSES = ['PERDIDO', 'POSTERGADO'] as const

/** Todos los estados del pipeline, en orden de embudo. Aditivo sobre ACTIVE/ARCHIVED. */
export const ALL_PIPELINE_STATUSES = [
  ...ACTIVE_PIPELINE_STATUSES,
  ...ARCHIVED_PIPELINE_STATUSES,
] as const

export type PipelineStatus =
  | (typeof ACTIVE_PIPELINE_STATUSES)[number]
  | (typeof ARCHIVED_PIPELINE_STATUSES)[number]

export type PipelineGroupId = 'G1' | 'G2' | 'G3'

export type PipelineGroup = {
  id: PipelineGroupId
  /** Etiqueta corta del grupo para el navegador de grupos. */
  label: string
  statuses: readonly PipelineStatus[]
}

/**
 * Grilla 3+3+2 del kanban (Tanda 2 · Bloque 1). Aditivo: G3 reusa los archivados,
 * eliminando la sección secundaria colapsable. No reemplaza ACTIVE/ARCHIVED, que
 * siguen usándose para serializar/iterar.
 */
export const PIPELINE_GROUPS: readonly PipelineGroup[] = [
  { id: 'G1', label: 'Captacion', statuses: ['PROSPECTO', 'DEMO_ENVIADA', 'VIO_VIDEO'] },
  { id: 'G2', label: 'Conversion', statuses: ['RESPONDIO', 'CALL_AGENDADA', 'CERRADO'] },
  { id: 'G3', label: 'Archivados', statuses: ['PERDIDO', 'POSTERGADO'] },
] as const

export const STATUS_LABELS: Record<PipelineStatus, string> = {
  PROSPECTO: 'Prospecto',
  DEMO_ENVIADA: 'Demo enviada',
  VIO_VIDEO: 'Vio video',
  RESPONDIO: 'Respondio',
  CALL_AGENDADA: 'Call agendada',
  CERRADO: 'Cerrado',
  PERDIDO: 'Perdido',
  POSTERGADO: 'Postergado',
}

/** Gradiente + color de texto del header de cada columna, por estado. */
export function statusTone(status: PipelineStatus): string {
  switch (status) {
    case 'PROSPECTO':
      return 'from-cyan-400/20 to-cyan-400/5 text-cyan-100'
    case 'DEMO_ENVIADA':
      return 'from-violet-400/20 to-violet-400/5 text-violet-100'
    case 'VIO_VIDEO':
      return 'from-emerald-400/20 to-emerald-400/5 text-emerald-100'
    case 'RESPONDIO':
      return 'from-sky-400/20 to-sky-400/5 text-sky-100'
    case 'CALL_AGENDADA':
      return 'from-amber-400/20 to-amber-400/5 text-amber-100'
    case 'CERRADO':
      return 'from-emerald-500/20 to-emerald-500/5 text-emerald-100'
    case 'PERDIDO':
      return 'from-rose-400/20 to-rose-400/5 text-rose-100'
    case 'POSTERGADO':
      return 'from-zinc-400/20 to-zinc-400/5 text-zinc-100'
  }
}

export type PipelineServiceType =
  | 'WEB'
  | 'AI_AGENT'
  | 'AUTOMATION'
  | 'CUSTOM_SOFTWARE'

export type LeadPipelineLead = {
  id: string
  businessName: string
  contactName: string | null
  industry: string | null
  zone: string | null
  serviceType: PipelineServiceType | null
  status: PipelineStatus
  nextFollowUpAt: string | null
  lastActivityAt: string | null
  createdAt: string
  /** B5: setter asignado (LeadOS) — null si el lead no está asignado. */
  assignedToName: string | null
  _count: {
    activities: number
    demos: number
  }
}

export type GroupedLeads = Record<PipelineStatus, LeadPipelineLead[]>

/** Grupos vacíos (las 8 columnas). Fuente única para agrupar leads. */
export function emptyGroupedLeads(): GroupedLeads {
  return {
    PROSPECTO: [],
    DEMO_ENVIADA: [],
    VIO_VIDEO: [],
    RESPONDIO: [],
    CALL_AGENDADA: [],
    CERRADO: [],
    PERDIDO: [],
    POSTERGADO: [],
  }
}

/** Agrupa una lista plana de leads por estado, preservando el orden de entrada. */
export function groupLeads(leads: LeadPipelineLead[]): GroupedLeads {
  const groups = emptyGroupedLeads()
  for (const lead of leads) {
    groups[lead.status].push(lead)
  }
  return groups
}
