/**
 * Callejón 1 — El error del borrador tiene que llegarle al setter en castellano
 * y colgado del control que falla. Corre SIN DB ni server:
 *
 *   npm run check:invariant:draft-url-mensaje
 *   (o: npx tsx "src/app/(protected)/setter/_actions/draft-url-mensaje.invariant.ts")
 *
 * ── Qué se rompió y por qué este invariante no nace verde ────────────────────
 * `confirmoCarga` usaba los create-params `{ message }` de zod 3. Ese mensaje
 * pasa por `processCreateParams`, cuyo mapa lo aplica SOLO cuando el code es
 * `invalid_enum_value`, cuando es `invalid_type`, o cuando el dato es
 * `undefined`; para cualquier otro devuelve `ctx.defaultError`. Un interruptor
 * sin tildar manda `false` —definido— y `z.literal(true)` falla con
 * `invalid_literal`: el mensaje escrito se descartaba y al setter le llegaba
 * «Invalid literal value, expected true».
 *
 * La trampa que este archivo evita: el mensaje en castellano SÍ salía por el
 * camino `undefined`. Un invariante que solo probara ese caso pasaba en verde
 * sobre el bug. Por eso la aserción central es COMPARATIVA — el mismo campo,
 * fallando por la misma razón, tiene que decir lo MISMO con `false` que con
 * `undefined` — y no depende de la redacción: si mañana se reescribe el copy,
 * el invariante sigue vigente sin tocarlo.
 */
import assert from 'node:assert/strict'
import { DraftUrlInputSchema } from './dossier.schemas.ts'

const URL_VALIDA = 'https://alegre-tesla-123.netlify.app'

/** El primer issue de un parse que TIENE que fallar. */
function issueDe(input: unknown): { code: string; path: PropertyKey[]; message: string } {
  const parsed = DraftUrlInputSchema.safeParse(input)
  assert.equal(parsed.success, false, `este input tenía que fallar: ${JSON.stringify(input)}`)
  const issue = parsed.success ? undefined : parsed.error.issues[0]
  assert.ok(issue, 'el parse falló pero no dejó ningún issue')
  return { code: issue.code, path: [...issue.path], message: issue.message }
}

// ── El caso real: URL válida, interruptor sin tildar (el cliente manda `false`) ──
const sinTildar = issueDe({ draftUrl: URL_VALIDA, confirmoCarga: false })

// 1. El error es del INTERRUPTOR. Sin este `path` el formulario no tiene con qué
//    decidir de qué control colgar el mensaje, y termina pintando el campo de URL
//    —que está bien— con `aria-invalid`: un lector de pantalla manda a corregir
//    donde no está el problema.
assert.deepEqual(
  sinTildar.path,
  ['confirmoCarga'],
  'el issue tiene que venir con el path del interruptor, no del campo de URL',
)

// 2. NO es el default en inglés de zod. Los defaults de la librería arrancan con
//    «Invalid …»; el copy del producto es en voseo y nunca empieza así.
assert.ok(
  !/^Invalid\b/.test(sinTildar.message),
  `el mensaje sigue siendo el default en inglés de zod: ${JSON.stringify(sinTildar.message)}`,
)

// 3. La aserción central. Mismo campo, misma falla, dos formas de llegar: sin
//    tildar (`false`) y sin mandar el campo (`undefined`). El mensaje tiene que
//    ser EL MISMO. Antes divergían —inglés y castellano— porque el segundo caso
//    era el único que el mapa de zod dejaba pasar.
const ausente = issueDe({ draftUrl: URL_VALIDA })
assert.equal(
  sinTildar.message,
  ausente.message,
  'el mensaje cambia según cómo falle el interruptor: `false` y `undefined` tienen que decir lo mismo',
)

// 4. Y también cuando llega basura por el mismo campo (devtools, cliente viejo).
const basura = issueDe({ draftUrl: URL_VALIDA, confirmoCarga: 'si' })
assert.equal(
  basura.message,
  sinTildar.message,
  'un valor no booleano en el interruptor tiene que dar el mismo mensaje',
)
assert.deepEqual(basura.path, ['confirmoCarga'], 'y con el path del interruptor')

// ── El campo de URL conserva sus propios mensajes, cada uno con su path ────────
const urlRota = issueDe({ draftUrl: 'no-es-una-url', confirmoCarga: true })
assert.deepEqual(urlRota.path, ['draftUrl'], 'el error de la URL sigue siendo de la URL')
assert.ok(
  !/^Invalid\b/.test(urlRota.message),
  `el mensaje de la URL es el default en inglés: ${JSON.stringify(urlRota.message)}`,
)

// ── El happy path sigue pasando, y el tipo sigue exigiendo el literal `true` ───
const ok = DraftUrlInputSchema.safeParse({ draftUrl: URL_VALIDA, confirmoCarga: true })
assert.equal(ok.success, true, 'URL válida + interruptor tildado tiene que pasar')
assert.equal(ok.success && ok.data.confirmoCarga, true, 'el dato parseado conserva `true`')

console.log(
  '✓ invariante OK: el error del borrador llega en castellano y con el path del ' +
    'interruptor — el mismo mensaje falle como falle (false / ausente / basura).',
)
