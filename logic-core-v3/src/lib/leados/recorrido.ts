/**
 * LeadOS B-beta — Recorrido de cola: prev/next dentro de una cola de "Mi día"
 * sin volver al home entre lead y lead.
 *
 * Módulo PURO (sin Prisma, sin server-only): solo ordena los vecinos de una
 * cola YA clasificada. NO toca gates ni transiciones — cada lead que se abre
 * sigue renderizando su wizard completo, con todos sus gates intactos (el
 * opener sigue SIN link, hard-block B6). Esto solo orquesta el recorrido.
 *
 * El orden de la cola es EXACTAMENTE el del home: ambos parten de
 * `particionarCartera(buildHomeLeads(...))`, así prev/next respeta el mismo
 * criterio (urgencia en `trabajar`/`fijados`, antigüedad en el resto).
 *
 * Aislamiento (#1): quien arma la `CarteraParticion` la obtiene de
 * `listOwnedLeads(userId)` (filtra `assignedToId`) — este módulo nunca lee la
 * DB, así que no hay forma de filtrar una cola ajena por acá.
 */
import type { CarteraParticion, HomeLead } from './flow'

/** Colas recorribles. El mecanismo soporta todas; la UI solo abre las útiles. */
export type ColaKey = 'fijados' | 'trabajar' | 'revision' | 'seguimiento' | 'agendadas'

export const COLA_LABELS: Record<ColaKey, string> = {
  fijados: 'Fijados por vos',
  trabajar: 'Para trabajar ahora',
  revision: 'Esperando revisión',
  seguimiento: 'En seguimiento',
  agendadas: 'Agendadas',
}

const COLA_KEYS = Object.keys(COLA_LABELS) as ColaKey[]

/** Guard de borde: el `?cola=` del cliente solo vale si es una cola conocida. */
export function esColaKey(valor: string | undefined | null): valor is ColaKey {
  return valor != null && (COLA_KEYS as string[]).includes(valor)
}

export type RecorridoVecino = { id: string; businessName: string } | null

export type RecorridoView = {
  cola: ColaKey
  label: string
  /** Tamaño actual de la cola (recomputado "ahora", puede haber cambiado). */
  total: number
  /** 1-based si el lead sigue en la cola; null si ya salió (p.ej. tras accionar). */
  posicion: number | null
  anterior: RecorridoVecino
  siguiente: RecorridoVecino
}

function leadsDeCola(particion: CarteraParticion, cola: ColaKey): HomeLead[] {
  return cola === 'fijados' ? particion.fijados : particion.grupos[cola]
}

function vecino(lead: HomeLead | undefined): RecorridoVecino {
  return lead ? { id: lead.id, businessName: lead.businessName } : null
}

/**
 * Arma la vista del recorrido. Self-healing: si el lead ya NO está en la cola
 * (lo accionaste y cambió de grupo, o lo pausaste), `posicion` es null y
 * `siguiente` apunta al próximo pendiente (la cima de la cola). Así el setter
 * encadena openers sin volver al home: acciona → el lead sale de "trabajar" →
 * "Siguiente" lo lleva al próximo que falta.
 */
export function construirRecorrido(
  particion: CarteraParticion,
  cola: ColaKey,
  leadId: string,
): RecorridoView {
  const lista = leadsDeCola(particion, cola)
  const total = lista.length
  const idx = lista.findIndex((lead) => lead.id === leadId)
  const base = { cola, label: COLA_LABELS[cola], total }

  if (idx >= 0) {
    return {
      ...base,
      posicion: idx + 1,
      anterior: vecino(lista[idx - 1]),
      siguiente: vecino(lista[idx + 1]),
    }
  }

  // El lead salió de la cola → ofrecé el próximo pendiente, sin "anterior".
  return {
    ...base,
    posicion: null,
    anterior: null,
    siguiente: vecino(lista[0]),
  }
}
