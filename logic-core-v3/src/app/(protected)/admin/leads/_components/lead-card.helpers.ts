import type { PipelineServiceType } from './lead-pipeline.shared'

export function formatRelativeTime(value: string | null): string {
  if (!value) {
    return 'Sin actividad'
  }

  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return 'Hace instantes'
  }

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute))
    return `Hace ${minutes} min`
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour)
    return `Hace ${hours} h`
  }

  const days = Math.floor(diffMs / day)
  return `Hace ${days} d`
}

export function serviceBadgeTone(serviceType: PipelineServiceType | null): string {
  switch (serviceType) {
    case 'WEB':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'AI_AGENT':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200'
    case 'AUTOMATION':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    case 'CUSTOM_SOFTWARE':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
    default:
      return 'border-white/10 bg-white/5 text-zinc-300'
  }
}

export function serviceLabel(serviceType: PipelineServiceType | null): string {
  switch (serviceType) {
    case 'WEB':
      return 'Web'
    case 'AI_AGENT':
      return 'AI Agent'
    case 'AUTOMATION':
      return 'Automation'
    case 'CUSTOM_SOFTWARE':
      return 'Custom Software'
    default:
      return 'Sin servicio'
  }
}
