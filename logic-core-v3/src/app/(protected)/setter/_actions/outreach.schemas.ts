/**
 * LeadOS B6 — Schemas de input de las actions de outreach del setter.
 * Compartidos client-side (feedback por campo) y server-side (la action
 * re-parsea siempre). El hard-block de links del opener vive acá: la UI lo
 * hace imposible Y el server lo rebota igual.
 */
import { z } from 'zod'
import { parseCalendarDayAR } from '@/lib/dates-ar'
import { contieneLink } from '@/lib/leados/flow'

export const RESULTADO_CONTACTO_VALUES = [
  'SIN_RESPUESTA',
  'RESPONDIO',
  'CALL_AGENDADA',
  'POSTERGADO',
  'RECHAZADO',
] as const

export type ResultadoContacto = (typeof RESULTADO_CONTACTO_VALUES)[number]

const notaOpcional = z
  .string()
  .trim()
  .max(1000, 'Resumila en menos de 1000 caracteres')
  .transform((value) => (value === '' ? undefined : value))
  .optional()

/**
 * Paso 7 — El opener que el setter va a pegar en Instagram. SIN link, sin
 * excepciones (el link viaja recién con la demo, segundo mensaje). El largo
 * recomendado es aviso (capa informativa), no bloqueo — acá solo un techo
 * de sanidad.
 */
export const OpenerInputSchema = z.object({
  mensaje: z
    .string()
    .trim()
    .min(10, 'Escribí el opener que vas a mandar — unas palabras al menos')
    .max(1000, 'Eso es un testamento, no un DM — recortalo')
    .refine(
      (texto) => !contieneLink(texto),
      'El opener va SIN link — el link viaja recién con la demo aprobada (segundo mensaje)',
    ),
})

export type OpenerInput = z.infer<typeof OpenerInputSchema>

/**
 * El día que el setter elige en el date-picker es un día de CALENDARIO, no un
 * instante: «el 25» significa el 25 acá, no las 00:00 UTC (que en AR son las
 * 21:00 del 24). `z.coerce.date()` a secas hacía justo eso y el lead se mostraba
 * —y se reactivaba— un día antes; `parseCalendarDayAR` lo ancla al día AR.
 *
 * El preprocess corre DOS veces sobre el mismo dato (el form valida antes de
 * llamar y manda `parsed.data`; la action re-valida server-side) y por eso pasa
 * de largo lo que ya es instante: solo un `YYYY-MM-DD` crudo se ancla. La
 * segunda pasada no vuelve a mover el día.
 */
const reactivateAtSchema = z.preprocess(
  (valor) => (typeof valor === 'string' ? parseCalendarDayAR(valor) ?? valor : valor),
  z.coerce.date().optional(),
)

/**
 * Paso 9 — Resultado de un toque de la conversación. POSTERGADO exige cuándo
 * retomar (reactivateAt futura) — la fecha del PRÓXIMO follow-up normal, en
 * cambio, jamás viene del cliente: la calcula calculateNextFollowUp.
 */
export const ResultadoInputSchema = z
  .object({
    resultado: z.enum(RESULTADO_CONTACTO_VALUES, {
      message: 'Elegí qué pasó con el mensaje',
    }),
    nota: notaOpcional,
    reactivateAt: reactivateAtSchema,
  })
  .superRefine((value, ctx) => {
    if (value.resultado !== 'POSTERGADO') return
    if (!value.reactivateAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['reactivateAt'],
        message: 'Elegí cuándo retomar el contacto',
      })
      return
    }
    if (value.reactivateAt.getTime() <= Date.now()) {
      ctx.addIssue({
        code: 'custom',
        path: ['reactivateAt'],
        message: 'La fecha de reactivación tiene que ser futura',
      })
    }
  })

export type ResultadoInput = z.infer<typeof ResultadoInputSchema>
