import type { ActivityChannel, ActivityResult } from '@prisma/client'

/**
 * Presentación del timeline del setter — local a esta superficie a propósito
 * (el admin tiene su propio `lead-activity.helpers.ts` en su lenguaje de panel;
 * no se cruzan). El criterio sistema/comercial NO se duplica: sale de
 * `esContactoComercial` (isolation.ts), la misma fuente que usan los conteos.
 * Los íconos viven en el componente (JSX estático, no en este `.ts`).
 */

/** Tonos del badge de resultado (subconjunto de `BadgeTone`). */
export type ResultadoTone = 'emerald' | 'amber' | 'rose' | 'blue' | 'zinc'

export function canalEtiqueta(channel: ActivityChannel): string {
  switch (channel) {
    case 'INSTAGRAM_DM':
      return 'Instagram DM'
    case 'WHATSAPP':
      return 'WhatsApp'
    case 'EMAIL':
      return 'Email'
    case 'LLAMADA':
      return 'Llamada'
    case 'LOOM_VIDEO':
      return 'Loom video'
    case 'SISTEMA':
      return 'Reasignación'
    case 'OTRO':
      return 'Otro'
  }
}

export function resultadoEtiqueta(result: ActivityResult): string {
  switch (result) {
    case 'SIN_RESPUESTA':
      return 'Sin respuesta'
    case 'RESPONDIO':
      return 'Respondió'
    case 'CALL_AGENDADA':
      return 'Call agendada'
    case 'RECHAZADO':
      return 'Rechazado'
    case 'POSTERGADO':
      return 'Postergado'
  }
}

export function resultadoTono(result: ActivityResult): ResultadoTone {
  switch (result) {
    case 'RESPONDIO':
      return 'emerald'
    case 'CALL_AGENDADA':
      return 'amber'
    case 'SIN_RESPUESTA':
      return 'rose'
    case 'POSTERGADO':
      return 'blue'
    case 'RECHAZADO':
      return 'zinc'
  }
}

/** Fecha absoluta es-AR (sin "hace X": evita `Date.now()` en render del server). */
export function formatearMomento(isoDate: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}
