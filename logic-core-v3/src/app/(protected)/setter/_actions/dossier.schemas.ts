/**
 * LeadOS B3/B4 — Schemas de input de las actions del setter. Compartidos
 * client-side (validación con feedback por campo) y server-side (la action
 * re-parsea siempre). Los contratos de los blobs viven en lib/leados/contracts;
 * acá solo se agregan mensajes amigables y reglas de captura.
 */
import { z } from 'zod'
import { VEREDICTO_VALUES } from '@/lib/leados/contracts'

export const LeadIdSchema = z.string().trim().min(1, 'Lead inválido')

/**
 * Transcripción de la respuesta del Evaluador externo (captura manual, no se
 * parsea prosa). Score 1–2 descarta en el mismo flujo → exige el motivo.
 */
export const EvaluacionInputSchema = z
  .object({
    score: z
      .number({ message: 'Elegí el score que dio el Evaluador (1 a 5)' })
      .int()
      .min(1, 'El score va de 1 a 5')
      .max(5, 'El score va de 1 a 5'),
    veredicto: z.enum(VEREDICTO_VALUES, {
      message: 'Elegí el veredicto que dio el Evaluador',
    }),
    razonamiento: z.string().trim().min(1, 'Pegá el razonamiento del Evaluador'),
    motivoDescarte: z
      .string()
      .trim()
      .transform((value) => (value === '' ? undefined : value))
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.score <= 2 && !value.motivoDescarte) {
      ctx.addIssue({
        code: 'custom',
        path: ['motivoDescarte'],
        message: 'Score 1–2 descarta el lead: resumí el motivo en una línea',
      })
    }
  })

export type EvaluacionInput = z.infer<typeof EvaluacionInputSchema>

/**
 * Captura del brief: pegado libre del Gem (obligatorio acá — es el corazón
 * del paso) + campos mínimos del BriefSchema con mensajes amigables.
 */
export const BriefInputSchema = z.object({
  titulo: z.string().trim().min(1, 'Poné un título — el nombre del negocio sirve'),
  concepto: z.string().trim().optional(),
  secciones: z
    .array(z.string().trim().min(1))
    .min(1, 'Anotá al menos una sección de la demo (una por línea)'),
  notasMarca: z.string().trim().optional(),
  cta: z.string().trim().optional(),
  pegadoGem: z.string().trim().min(1, 'Pegá la respuesta completa del Gem de diseño'),
})

export type BriefInput = z.infer<typeof BriefInputSchema>

/**
 * B4 — Publicación del draft (Netlify Drop). La confirmación de carga es
 * humana (checkbox "lo abrí y carga"), no un fetch automático: el literal
 * true la exige también server-side.
 */
export const DraftUrlInputSchema = z.object({
  draftUrl: z
    .string()
    .trim()
    .min(1, 'Pegá la URL del borrador que te dio Netlify Drop')
    .url('Eso no parece una URL — copiala completa desde la barra del navegador')
    .refine((url) => url.startsWith('https://'), 'La URL tiene que empezar con https://')
    .refine((url) => url.length <= 500, 'Esa URL es demasiado larga — revisá que sea la del borrador'),
  // `errorMap`, NO `message`. En zod 3 el `message` de los create-params pasa
  // por `processCreateParams`, cuyo mapa solo lo aplica a `invalid_enum_value`,
  // a `invalid_type` y al dato `undefined`: para cualquier otro code devuelve
  // `ctx.defaultError`. Un interruptor sin tildar manda `false` (definido) y
  // `z.literal(true)` falla con `invalid_literal` → el mensaje de acá se
  // DESCARTABA y al setter le llegaba el default en inglés («Invalid literal
  // value, expected true»). `errorMap` se devuelve tal cual y aplica a TODOS los
  // codes — el mismo idioma que ya usan plan.schemas.ts y
  // executive-report-prefs.schemas.ts. El tipo inferido sigue siendo `true`.
  confirmoCarga: z.literal(true, {
    errorMap: () => ({
      message: 'Abrí el link en otra pestaña y confirmá que la demo carga — sin eso no se guarda',
    }),
  }),
})

export type DraftUrlInput = z.infer<typeof DraftUrlInputSchema>

/**
 * B4 — Self-check del setter. El cliente manda ids + booleanos; los nombres
 * que viajan a la revisión (B5) los arma el server con buildSelfCheck contra
 * las listas vigentes de flow.ts — nunca se confía en strings del cliente.
 */
export const SelfCheckInputSchema = z.object({
  duros: z.record(z.string(), z.boolean()),
  softIds: z.array(z.string().trim().min(1)),
})

export type SelfCheckInput = z.infer<typeof SelfCheckInputSchema>

/** B4 — Escalamiento "me trabé": la descripción del problema, sin vueltas. */
export const EscalamientoInputSchema = z.object({
  descripcion: z
    .string()
    .trim()
    .min(10, 'Contá un poco más: qué intentaste y dónde te trabaste')
    .max(1000, 'Resumilo en menos de 1000 caracteres'),
})

export type EscalamientoInput = z.infer<typeof EscalamientoInputSchema>
