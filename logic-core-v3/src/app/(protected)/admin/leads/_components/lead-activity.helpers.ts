import {
  CircleDashed,
  Instagram,
  Mail,
  MessageCircleMore,
  PhoneCall,
  Video,
  type LucideIcon,
} from 'lucide-react'

export type ActivityChannel =
  | 'INSTAGRAM_DM'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'LLAMADA'
  | 'LOOM_VIDEO'
  | 'OTRO'

export type ActivityResult =
  | 'SIN_RESPUESTA'
  | 'RESPONDIO'
  | 'CALL_AGENDADA'
  | 'RECHAZADO'
  | 'POSTERGADO'

export const CHANNEL_OPTIONS: Array<{ value: ActivityChannel; label: string }> = [
  { value: 'INSTAGRAM_DM', label: 'Instagram DM' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'LLAMADA', label: 'Llamada' },
  { value: 'LOOM_VIDEO', label: 'Loom video' },
  { value: 'OTRO', label: 'Otro' },
]

export const RESULT_OPTIONS: Array<{ value: ActivityResult; label: string }> = [
  { value: 'SIN_RESPUESTA', label: 'Sin respuesta' },
  { value: 'RESPONDIO', label: 'Respondio' },
  { value: 'CALL_AGENDADA', label: 'Call agendada' },
  { value: 'RECHAZADO', label: 'Rechazado' },
  { value: 'POSTERGADO', label: 'Postergado' },
]

export const activityInputClass =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-400/35'

export function relativeTime(value: string): string {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < hour) {
    return `Hace ${Math.max(1, Math.floor(diffMs / minute))} min`
  }

  if (diffMs < day) {
    return `Hace ${Math.floor(diffMs / hour)} h`
  }

  return `Hace ${Math.floor(diffMs / day)} dias`
}

export function formatFollowUp(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function channelIcon(channel: ActivityChannel): LucideIcon {
  switch (channel) {
    case 'INSTAGRAM_DM':
      return Instagram
    case 'WHATSAPP':
      return MessageCircleMore
    case 'EMAIL':
      return Mail
    case 'LLAMADA':
      return PhoneCall
    case 'LOOM_VIDEO':
      return Video
    case 'OTRO':
      return CircleDashed
  }
}

export function resultTone(result: ActivityResult | null): string {
  switch (result) {
    case 'SIN_RESPUESTA':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-200'
    case 'RESPONDIO':
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
    case 'CALL_AGENDADA':
      return 'border-amber-400/20 bg-amber-500/10 text-amber-200'
    case 'RECHAZADO':
      return 'border-zinc-400/20 bg-zinc-500/10 text-zinc-200'
    case 'POSTERGADO':
      return 'border-sky-400/20 bg-sky-500/10 text-sky-200'
    default:
      return 'border-white/10 bg-white/5 text-zinc-300'
  }
}

export function resultLabel(result: ActivityResult | null): string {
  switch (result) {
    case 'SIN_RESPUESTA':
      return 'Sin respuesta'
    case 'RESPONDIO':
      return 'Respondio'
    case 'CALL_AGENDADA':
      return 'Call agendada'
    case 'RECHAZADO':
      return 'Rechazado'
    case 'POSTERGADO':
      return 'Postergado'
    default:
      return 'Sin resultado'
  }
}
