/**
 * LeadOS B2 — Contratos zod de los blobs Json del dossier de producción.
 *
 * Regla: todo write a `fichaJson` / `evaluacionJson` / `briefJson` /
 * `selfCheckJson` / `rechazos` se parsea con estos schemas ANTES de tocar
 * Prisma — nunca guardar Json crudo que vino del cliente (o de un copy-paste
 * de IA). Son contratos base MINIMALES a propósito: B3/B4 los extienden acá
 * mismo con campos opcionales nuevos, sin romper datos ya guardados.
 */
import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

const textoLibre = z.preprocess(emptyStringToUndefined, z.string().optional())

// ── Ficha de observación del negocio (la llena el setter, texto crudo) ──────

export const IG_MANEJADO_POR_VALUES = ['DUENO', 'CM', 'NO_SABE'] as const

export const FichaSchema = z.object({
  identidad: z
    .object({
      notas: textoLibre,
      igManejadoPor: z.enum(IG_MANEJADO_POR_VALUES).optional(),
    })
    .optional(),
  presenciaDigital: textoLibre,
  resenas: textoLibre,
  contenidoReal: textoLibre, // logo / fotos / tono
  senalesOperativas: textoLibre,
  otros: textoLibre, // catch-all libre
})

// ── Evaluación externa (score + veredicto, pegada por el setter) ────────────

// admin-1c: el veredicto es la LECTURA del setter, informativa. 'CALIENTE' acá NO
// determina el caliente operativo (campo `OsLead.caliente`, criterio de Franco) ni
// dispara nada: solo se muestra (badge) y cuenta como "avanzada" en la métrica
// descarte/avance (revision.ts). El setter lo sigue eligiendo para entrenar el ojo.
export const VEREDICTO_VALUES = ['DESCARTAR', 'AVANZAR', 'CALIENTE'] as const

export const EvaluacionSchema = z.object({
  score: z.number().int().min(1).max(5),
  veredicto: z.enum(VEREDICTO_VALUES),
  razonamiento: z.string().trim().min(1),
  motivoDescarte: textoLibre,
  // B5: la estampa transitionDossier al registrar EVALUADA — alimenta la
  // ventana de 30 días de la métrica descarte/avance. Opcional: las
  // evaluaciones pre-B5 no la tienen y siguen parseando.
  fecha: z.string().datetime().optional(),
  // B5/admin-1c: marca de "Telegram informativo de score alto ya enviado" —
  // garantiza una sola notificación por dossier aunque el flujo se re-ejecute.
  // Nombre legacy (`calienteNotificadaAt`): se conserva para no migrar los blobs
  // ya estampados y evitar re-notificar. Es solo un flag de idempotencia, no
  // implica caliente operativo (ese es el campo `OsLead.caliente`).
  calienteNotificadaAt: z.string().datetime().optional(),
})

// ── Brief de diseño (insumo de la construcción de la demo) ──────────────────

export const BriefSchema = z.object({
  titulo: z.string().trim().min(1),
  concepto: textoLibre,
  secciones: z.array(z.string().trim().min(1)),
  notasMarca: textoLibre,
  cta: textoLibre,
  referenciasFicha: textoLibre,
  pegadoGem: textoLibre, // B3: respuesta cruda del Gem de diseño, tal como la pegó el setter
})

// ── Self-check del setter antes de mandar a revisión ────────────────────────

export const SelfCheckSchema = z.object({
  itemsDuros: z.array(
    z.object({
      nombre: z.string().trim().min(1),
      ok: z.boolean(),
    }),
  ),
  softFlags: z.array(z.string().trim().min(1)),
})

// ── Historial de rechazos del admin (solo lo escribe transitionDossier) ─────

export const RechazoSchema = z.object({
  fecha: z.string().datetime(),
  motivo: z.string().trim().min(1),
  detalle: textoLibre,
  // B5: rechazo estructurado del admin — dónde está el problema y el arreglo
  // concreto. Opcionales: los rechazos pre-B5 (QA de B2) solo tienen motivo.
  donde: textoLibre,
  arreglo: textoLibre,
})

export const RechazosSchema = z.array(RechazoSchema)

// ── B7: reunión agendada vía Cal.com (booking real + traspaso + cierre) ─────

export const RESULTADO_REUNION_VALUES = ['GANADO', 'PERDIDO', 'RE_SEGUIMIENTO'] as const

/**
 * B7 — Estado de la agenda del lead. `AGENDANDO` es el claim atómico del
 * setter ANTES de llamar a Cal.com (anti doble-click, patrón enviadaAt de
 * B6); `AGENDADA` es el booking confirmado por Cal.com con uid + notas de
 * traspaso OBLIGATORIAS. `realizadaAt` y `resultado` los marca SOLO el admin
 * post-reunión (GANADO lo decide Franco, nunca el setter).
 */
export const AgendaSchema = z.object({
  estado: z.enum(['AGENDANDO', 'AGENDADA']),
  /** ISO del momento del claim — diagnóstico si un claim queda colgado. */
  claimedAt: z.string().datetime().optional(),
  calBookingUid: z.string().trim().min(1).optional(),
  /** Inicio de la reunión, ISO con offset (como lo devolvió Cal.com, BA). */
  slotStart: z.string().datetime({ offset: true }).optional(),
  attendee: z
    .object({
      nombre: z.string().trim().min(1),
      email: z.string().trim().min(1),
    })
    .optional(),
  notasTraspaso: textoLibre,
  agendadaAt: z.string().datetime().optional(),
  /** Marca admin post-reunión — la métrica real del piloto (la mide B8). */
  realizadaAt: z.string().datetime().optional(),
  resultado: z
    .object({
      tipo: z.enum(RESULTADO_REUNION_VALUES),
      fecha: z.string().datetime(),
      nota: textoLibre,
    })
    .optional(),
})

export type Ficha = z.infer<typeof FichaSchema>
export type Evaluacion = z.infer<typeof EvaluacionSchema>
export type Brief = z.infer<typeof BriefSchema>
export type SelfCheck = z.infer<typeof SelfCheckSchema>
export type Rechazo = z.infer<typeof RechazoSchema>
export type Agenda = z.infer<typeof AgendaSchema>
export type ResultadoReunion = (typeof RESULTADO_REUNION_VALUES)[number]
