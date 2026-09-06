/**
 * LeadOS B3/B4 — Schemas de input de las actions del setter. Compartidos
 * client-side (validación con feedback por campo) y server-side (la action
 * re-parsea siempre). Los contratos de los blobs viven en lib/leados/contracts;
 * acá solo se agregan mensajes amigables y reglas de captura.
 */
import { z } from 'zod'
import { VEREDICTO_VALUES } from '@/lib/leados/contracts'
import { herramientaSinLink } from '@/lib/leados/herramientas'

export const LeadIdSchema = z.string().trim().min(1, 'Lead inválido')

/**
 * El veredicto del setter (D15-bis: antes era la transcripción de un chat de
 * evaluación externo). Score 1–2 descarta en el mismo flujo → exige el motivo.
 * La FORMA no cambió con la fusión —mismos campos, mismos tipos, misma
 * validación—; cambió de dónde sale el dato.
 */
export const EvaluacionInputSchema = z
  .object({
    score: z
      .number({ message: 'Elegí cuánto le ves al negocio (1 a 5)' })
      .int()
      .min(1, 'El score va de 1 a 5')
      .max(5, 'El score va de 1 a 5'),
    veredicto: z.enum(VEREDICTO_VALUES, {
      message: 'Elegí tu veredicto',
    }),
    razonamiento: z.string().trim().min(1, 'Escribí por qué le pusiste ese score'),
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
 * Captura del brief: pegado libre del Gem + campos mínimos del BriefSchema con
 * mensajes amigables.
 *
 * `pegadoGem` es la TRANSCRIPCIÓN literal de lo que devuelve el Gem de diseño, y
 * por eso su obligatoriedad SIGUE AL REGISTRO de herramientas en vez de estar
 * clavada acá: si el Gem no tiene link cargado (`url: null`, la misma píldora
 * «Link pendiente» que la pantalla ya muestra arriba), el campo no se puede
 * exigir — no hay forma honesta de completarlo, solo inventarlo, y un pegado
 * inventado viaja al bloque de construcción y a la revisión de Franco como si
 * fuera la salida real del Gem. Cargar la URL en `herramientas.ts` lo vuelve
 * obligatorio solo, sin tocar este archivo ni el formulario.
 *
 * El TIPO es el mismo en los dos casos (`string`, eventualmente vacío) a
 * propósito: la exigencia viaja en un `superRefine`, no en un `.min(1)` que
 * cambiaría `BriefInput` según el estado del registro. `BriefSchema` ya tenía
 * `pegadoGem` como `textoLibre` (opcional) — el contrato persistido no se toca,
 * y el vacío se guarda como ausente igual que `concepto` o `cta`.
 *
 * Por qué una FÁBRICA y no el `herramientaSinLink()` leído adentro: el registro
 * es una constante de módulo, así que el estado «con link» no se puede alcanzar
 * en una corrida de test sin re-buildear. Con el booleano por parámetro, los DOS
 * lados de la regla se prueban contra el schema REAL (`tests/leados`), no contra
 * una copia que puede desincronizarse. La app sigue usando una sola instancia,
 * cableada abajo al registro.
 *
 * Lo demás sigue obligatorio y no entra en esta regla: `titulo` y `secciones` no
 * se transcriben del Gem — son el plano que el setter puede escribir solo (el
 * título arranca con el nombre del negocio; las secciones tienen sus ejemplos en
 * el hint), y `secciones` es lo único que hace construible la demo.
 */
export function briefInputSchemaPara(gemConLink: boolean) {
  return z
    .object({
      titulo: z.string().trim().min(1, 'Poné un título — el nombre del negocio sirve'),
      concepto: z.string().trim().optional(),
      secciones: z
        .array(z.string().trim().min(1))
        .min(1, 'Anotá al menos una sección de la demo (una por línea)'),
      notasMarca: z.string().trim().optional(),
      cta: z.string().trim().optional(),
      pegadoGem: z.string().trim(),
    })
    .superRefine((value, ctx) => {
      if (!gemConLink) return
      if (value.pegadoGem === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['pegadoGem'],
          message: 'Pegá la respuesta completa del Gem de diseño',
        })
      }
    })
}

export const BriefInputSchema = briefInputSchemaPara(!herramientaSinLink('gemDiseno'))

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
