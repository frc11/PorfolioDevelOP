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

// P3#3: techo de sanidad contra blobs sin fin (pegado de IA, copy-paste
// accidental) — no es un límite de UX, es una cota de rendering/storage.
const TEXTO_LIBRE_MAX = 5000

const textoLibre = z.preprocess(
  emptyStringToUndefined,
  z.string().max(TEXTO_LIBRE_MAX).optional(),
)

/**
 * P5-A: una DIRECCIÓN opcional que el setter pega (no un archivo — el producto
 * no tiene subida en ninguna superficie, y la ausencia es deliberada).
 *
 * Mismo patrón que el resto de las direcciones opcionales del panel
 * (`optionalUrl` de `prospecto.schemas.ts`): vacío → `undefined`, y si hay algo
 * tiene que ser una URL completa. El tope de largo copia el de `DraftUrlInputSchema`.
 * Se exporta para que el formulario valide con ESTE schema y no con una copia
 * que se desincronice.
 */
export const EnlaceFichaSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .url('Link inválido — pegá la dirección completa (https://…)')
    .max(500, 'Esa dirección es demasiado larga — revisá que sea la correcta')
    .optional(),
)

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
  /**
   * P5-A — El MATERIAL del negocio que la construcción necesita tener junto
   * antes de arrancar (el recorrido nuevo llega con la demo ya hecha, así que
   * esto no puede estar repartido en dos momentos del flujo).
   *
   * TODO opcional, y el grupo entero también: una ficha guardada ANTES de P5-A
   * no trae la clave `materiales` y sigue parseando igual — es exactamente el
   * crecimiento que anticipa el encabezado de este archivo. No entra en
   * `fichaFaltantes` a propósito: suma material, no mueve el gate de señal.
   */
  materiales: z
    .object({
      resenasUrl: EnlaceFichaSchema, // dónde se leen las reseñas (ficha de Google, etc.)
      imagenesUrl: EnlaceFichaSchema, // de dónde bajar el logo y las fotos reales
      otraRedUrl: EnlaceFichaSchema, // otra red además del Instagram del alta
      queVende: textoLibre, // productos/servicios + precios SI están publicados
      comoSePresenta: textoLibre, // bio / eslogan / qué destaca de sí mismo
    })
    .optional(),
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

// ── E.1: progreso del checklist de Construcción (auto-reportado, NO gate) ────

/**
 * IDs ESTABLES de las fases de la Construcción — la llave del progreso
 * persistido. id-keyed a propósito (NO índices): reordenar o reetiquetar
 * `SHELL_CONSTRUCCION` (flow-content.ts) NO corrompe un progreso ya guardado.
 * `ShellFase.id` calza 1:1 contra estos ids por `satisfies`.
 */
export const FASE_IDS = [
  'estructura',
  'personalizacion',
  'assets',
  'cta',
  'calidad',
  'mobile',
] as const

export type FaseId = (typeof FASE_IDS)[number]

/**
 * Progreso del checklist de Construcción — CHECKLIST auto-reportado por el
 * setter, NUNCA un gate: `progresoJson` jamás se cablea a la transición
 * EN_REVISION (el único gate sigue siendo draftUrl + `selfCheckAprobado`). En
 * el dossier, `null` = checklist fresco (sin backfill); acá el default es
 * `{ completadas: [] }`. `marcadas` estampa cuándo se marcó cada fase (ISO) —
 * dato de diagnóstico id-keyed, no una condición de nada.
 */
export const ProgresoSchema = z.object({
  completadas: z.array(z.enum(FASE_IDS)).default([]),
  faseActual: z.enum(FASE_IDS).optional(),
  marcadas: z.record(z.enum(FASE_IDS), z.string().datetime()).optional(),
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
 * B7 — Estado de la agenda del lead. `OFRECIDOS` es la oferta de horarios ya
 * pasada al prospecto (6.1: memoria del booking — sobrevive al cierre de la
 * pestaña); `AGENDANDO` es el claim atómico del setter ANTES de llamar a
 * Cal.com (anti doble-click, patrón enviadaAt de B6); `AGENDADA` es el booking
 * confirmado por Cal.com con uid + notas de traspaso OBLIGATORIAS.
 * `realizadaAt` y `resultado` los marca SOLO el admin post-reunión (GANADO lo
 * decide Franco, nunca el setter).
 *
 * 6.1 — La extensión es ADITIVA y OPCIONAL a propósito: el valor nuevo del
 * enum y los dos campos nuevos no invalidan ningún blob viejo (una AGENDADA
 * escrita en B7 sigue parseando igual). Ese es el contrato con los 7 readers
 * de `agendaJson`, que filtran todos por `estado === 'AGENDADA'` y a los que
 * un blob OFRECIDOS les resulta inerte.
 */
export const AgendaSchema = z.object({
  estado: z.enum(['OFRECIDOS', 'AGENDANDO', 'AGENDADA']),
  /** ISO del momento del claim — diagnóstico si un claim queda colgado. */
  claimedAt: z.string().datetime().optional(),
  /**
   * 6.1 — Los horarios que el setter le pasó al prospecto (starts ISO con
   * offset, como los devolvió Cal.com — mismo validador que `slotStart`).
   * Viajan también DENTRO del claim AGENDANDO: son la memoria que la
   * compensación restaura si Cal.com falla.
   */
  horariosOfrecidos: z.array(z.string().datetime({ offset: true })).optional(),
  /** ISO del momento de la oferta — cuánto hace que el prospecto la tiene. */
  ofrecidosAt: z.string().datetime().optional(),
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
export type Progreso = z.infer<typeof ProgresoSchema>
export type Rechazo = z.infer<typeof RechazoSchema>
export type Agenda = z.infer<typeof AgendaSchema>
export type ResultadoReunion = (typeof RESULTADO_REUNION_VALUES)[number]
