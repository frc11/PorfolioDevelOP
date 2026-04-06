export const ACTIVE_PIPELINE_STATUSES = [
  'PROSPECTO',
  'DEMO_ENVIADA',
  'VIO_VIDEO',
  'RESPONDIO',
  'CALL_AGENDADA',
  'CERRADO',
] as const

export const ARCHIVED_PIPELINE_STATUSES = ['PERDIDO', 'POSTERGADO'] as const

export type PipelineStatus =
  | (typeof ACTIVE_PIPELINE_STATUSES)[number]
  | (typeof ARCHIVED_PIPELINE_STATUSES)[number]

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
  _count: {
    activities: number
    demos: number
  }
}

export type GroupedLeads = Record<PipelineStatus, LeadPipelineLead[]>
