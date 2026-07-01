import { test, expect } from '@playwright/test'
import {
  createSetter,
  createLead,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'
// Cadena REAL bajo prueba (NO se toca: se TESTEA). Ninguno arrastra next/headers.
import {
  getOwnedDossier,
  saveOwnedDraftUrl,
  saveOwnedSelfCheck,
  transitionDossier,
} from '../../src/lib/leados/dossier'
import { buildSelfCheck, parseSelfCheck, selfCheckAprobado, HARD_CHECKS } from '../../src/lib/leados/flow'

/**
 * NEGATIVO FINO (Sprint 5.3) — ANTI-BYPASS del self-check.
 *
 * El envío a revisión (CONSTRUCCION→EN_REVISION) exige el self-check aprobado. El
 * servidor DESCONFÍA de la UI: la action arma el blob con `buildSelfCheck` contra
 * la lista VIGENTE `HARD_CHECKS` (los ids del cliente que no son hard-blocks NI se
 * leen) y re-valida con `selfCheckAprobado` LO PERSISTIDO. Forzar el botón (o
 * mandar un payload "todo aprobado") NO saltea el gate.
 *
 * Se asserta el COMPORTAMIENTO del gate (rechazado/enviado por ESTADO, y el stage
 * resultante), NO las etiquetas internas de los hard-checks: FG-2 puede cambiar
 * esos nombres/ids. Los fixtures se DERIVAN de `HARD_CHECKS` en vivo. Anti-bypass =
 * probar que el gate NO se saltea, jamás abrir una forma de saltearlo.
 *
 * Espejo del núcleo post-guard de `enviarARevision` (dossier.actions.ts): mismo
 * patrón que 06-claim-atomico. Se omiten requireSetter()/revalidate (por-request).
 */

const tracker: SmokeTracker = newTracker()
let setterId: string

test.beforeAll(async () => {
  const setter = await createSetter(tracker, 'anti-bypass')
  setterId = setter.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/** Payload "todo en verde" derivado de la lista VIGENTE (sin hardcodear ids). */
const fullDuros = (): Record<string, boolean> =>
  Object.fromEntries(HARD_CHECKS.map((check) => [check.id, true]))

type Decision =
  | 'sin-dossier'
  | 'rechazado-stage'
  | 'rechazado-draft'
  | 'rechazado-selfcheck'
  | 'enviado'

/** Espejo del gate de `enviarARevision`: mismo orden de guardas, misma re-validación. */
async function decisionRevision(leadId: string): Promise<Decision> {
  const dossier = await getOwnedDossier(leadId, setterId)
  if (!dossier) return 'sin-dossier'
  if (dossier.stage !== 'CONSTRUCCION') return 'rechazado-stage'
  if (!dossier.draftUrl) return 'rechazado-draft'
  const selfCheck = parseSelfCheck(dossier.selfCheckJson)
  if (!selfCheckAprobado(selfCheck)) return 'rechazado-selfcheck'
  await transitionDossier(leadId, { to: 'EN_REVISION' })
  return 'enviado'
}

async function stageDe(leadId: string): Promise<string | null> {
  const dossier = await getOwnedDossier(leadId, setterId)
  return dossier?.stage ?? null
}

test('sin draft publicado: el envío a revisión rebota', async () => {
  const lead = await createLead(tracker, { setterId, businessName: 'AntiBypassSinDraft', stage: 'CONSTRUCCION' })
  expect(await decisionRevision(lead.id)).toBe('rechazado-draft')
  expect(await stageDe(lead.id), 'sigue en construcción').toBe('CONSTRUCCION')
})

test('payload hostil "todo aprobado" (ids que no son hard-blocks) NO saltea el gate', async () => {
  const lead = await createLead(tracker, { setterId, businessName: 'AntiBypassHostil', stage: 'CONSTRUCCION' })
  await saveOwnedDraftUrl(lead.id, setterId, 'https://draft-hostil.netlify.app')

  // El cliente intenta fabricar aprobación con claves que NO son hard-blocks
  // vigentes. `buildSelfCheck` las ignora y mapea cada hard real a ok:false.
  const hostil = { aprobado: true, todos: true, bypass: true }
  await saveOwnedSelfCheck(lead.id, setterId, buildSelfCheck(hostil, []))

  expect(await decisionRevision(lead.id), 'el servidor reconstruye contra HARD_CHECKS y rechaza').toBe(
    'rechazado-selfcheck',
  )
  expect(await stageDe(lead.id), 'el gate NO se salteó: sigue en construcción').toBe('CONSTRUCCION')
})

test('un hard-block en falso (self-check incompleto persistido) NO pasa', async () => {
  const lead = await createLead(tracker, { setterId, businessName: 'AntiBypassIncompleto', stage: 'CONSTRUCCION' })
  await saveOwnedDraftUrl(lead.id, setterId, 'https://draft-incompleto.netlify.app')

  // Todos los hard-blocks en verde MENOS el primero (derivado de la lista viva).
  const incompleto = fullDuros()
  incompleto[HARD_CHECKS[0].id] = false
  await saveOwnedSelfCheck(lead.id, setterId, buildSelfCheck(incompleto, []))

  expect(await decisionRevision(lead.id)).toBe('rechazado-selfcheck')
  expect(await stageDe(lead.id)).toBe('CONSTRUCCION')
})

test('self-check completo (todos los hard-blocks) SÍ abre el envío a revisión', async () => {
  const lead = await createLead(tracker, { setterId, businessName: 'AntiBypassCompleto', stage: 'CONSTRUCCION' })
  await saveOwnedDraftUrl(lead.id, setterId, 'https://draft-completo.netlify.app')
  await saveOwnedSelfCheck(lead.id, setterId, buildSelfCheck(fullDuros(), []))

  expect(await decisionRevision(lead.id), 'con todos los hard-blocks en verde el gate deja pasar').toBe('enviado')
  expect(await stageDe(lead.id), 'ahora sí transicionó a revisión').toBe('EN_REVISION')

  // Y ya en EN_REVISION el mismo gate rebota por stage (no re-envía).
  expect(await decisionRevision(lead.id), 'fuera de CONSTRUCCION el envío rebota por stage').toBe('rechazado-stage')
})
