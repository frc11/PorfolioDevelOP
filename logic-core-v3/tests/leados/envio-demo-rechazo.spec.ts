import { test, expect } from '@playwright/test'
import {
  prisma,
  createSetter,
  createLead,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'
// Cadena REAL bajo prueba (NO se toca: se TESTEA). Ninguno arrastra next/headers.
import { getOwnedDossier, marcarDemoEnviadaOwned } from '../../src/lib/leados/dossier'
import { getOwnedLead } from '../../src/lib/leados/ownership'
import { gateEnvioDemo } from '../../src/lib/leados/flow'

/**
 * NEGATIVO FINO (Sprint 5.3) — la MITAD QUE FALTA de `gateEnvioDemo`.
 *
 * 06-claim-atomico cubre el camino feliz (claim → 1 OsDemo). Acá el RECHAZO: la
 * demo NO se envía cuando el gate no está satisfecho. La UI no ofrece el envío
 * antes, pero la action (`enviarDemoAprobada`) NO confía en la UI y re-valida
 * `gateEnvioDemo(APROBADA ∧ finalUrl ∧ respondió|caliente)` server-side.
 *
 * Se replica FIELMENTE el núcleo post-guard de la action (mismo patrón que
 * 06-claim-atomico con `enviarDemoCore`): se omiten requireSetter()/Zod/revalidate
 * (por-request, atados a next/headers, no sensibles a esta invariante). Lo que se
 * ejerce es el GATE + el claim contra la DB real. NINGÚN gate se relaja: se prueba
 * que NO se saltea, y que no queda residuo (enviadaAt null, 0 OsDemo).
 */

const tracker: SmokeTracker = newTracker()
let setterId: string

test.beforeAll(async () => {
  const setter = await createSetter(tracker, 'envio-rechazo')
  setterId = setter.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

type Decision = 'sin-lead' | 'rechazado-gate' | 'claim-tomado'

/**
 * Espejo del núcleo de `enviarDemoAprobada` (outreach.actions.ts): el gate decide
 * ANTES del claim. Devuelve la decisión sin crear OsDemo — en el rechazo el claim
 * nunca se toca. (El camino feliz completo, con createDemo, ya lo cubre 06.)
 */
async function decisionEnvio(leadId: string): Promise<Decision> {
  const lead = await getOwnedLead(leadId, setterId)
  if (!lead) return 'sin-lead'
  const dossier = await getOwnedDossier(leadId, setterId)
  if (!dossier) return 'sin-lead'
  const finalUrl = dossier.finalUrl
  if (
    !finalUrl ||
    !gateEnvioDemo({ status: lead.status, caliente: lead.caliente, stage: dossier.stage, finalUrl })
  ) {
    return 'rechazado-gate'
  }
  // Solo si el gate deja pasar se toma el claim atómico.
  await marcarDemoEnviadaOwned(leadId, setterId)
  return 'claim-tomado'
}

async function assertSinEnvio(leadId: string) {
  const dossier = await prisma.osLeadDossier.findUnique({ where: { leadId }, select: { enviadaAt: true } })
  expect(dossier?.enviadaAt, 'no quedó marca de envío (enviadaAt null)').toBeNull()
  expect(await prisma.osDemo.count({ where: { leadId } }), 'no se creó ningún OsDemo').toBe(0)
}

test('stage no-APROBADA: el gate rechaza y la primitiva del claim también rebota', async () => {
  // EN_REVISION: la demo todavía no está aprobada por Franco.
  const lead = await createLead(tracker, {
    setterId,
    businessName: 'EnvioEnRevision',
    stage: 'EN_REVISION',
    status: 'RESPONDIO',
  })

  expect(await decisionEnvio(lead.id), 'el gate corta antes del claim').toBe('rechazado-gate')

  // Defensa en profundidad: aunque se saltara el gate del action, la primitiva
  // `marcarDemoEnviadaOwned` rebota fuera de APROBADA.
  let caught = false
  try {
    await marcarDemoEnviadaOwned(lead.id, setterId)
  } catch {
    caught = true
  }
  expect(caught, 'la primitiva del claim rebota fuera de APROBADA').toBe(true)

  await assertSinEnvio(lead.id)
})

test('APROBADA pero gate del brief CERRADO (frío, sin responder): rechazado', async () => {
  // Demo aprobada con finalUrl, pero PROSPECTO + frío → no respondió y no caliente.
  const lead = await createLead(tracker, {
    setterId,
    businessName: 'EnvioFrio',
    stage: 'APROBADA',
    status: 'PROSPECTO',
    finalUrl: 'https://demo-frio.example.com',
  })

  expect(await decisionEnvio(lead.id), 'APROBADA no alcanza si el negocio no respondió ni está caliente').toBe(
    'rechazado-gate',
  )
  await assertSinEnvio(lead.id)
})

test('APROBADA y respondió pero SIN finalUrl: rechazado (no hay link que mandar)', async () => {
  const lead = await createLead(tracker, {
    setterId,
    businessName: 'EnvioSinUrl',
    stage: 'APROBADA',
    status: 'RESPONDIO',
    finalUrl: 'https://se-borra.example.com',
  })
  // Vaciar la finalUrl a nivel datos (simula APROBADA sin URL publicada aún).
  await prisma.osLeadDossier.update({ where: { leadId: lead.id }, data: { finalUrl: null } })

  expect(await decisionEnvio(lead.id), 'sin finalUrl no se envía aunque respondió y esté APROBADA').toBe(
    'rechazado-gate',
  )
  await assertSinEnvio(lead.id)
})

test('el gate positivo (pura): APROBADA + finalUrl + respondió|caliente habilita', async () => {
  // Contraste puro (sin crear OsDemo — eso es 06): ambas puertas del flujo abren.
  expect(
    gateEnvioDemo({ status: 'RESPONDIO', caliente: false, stage: 'APROBADA', finalUrl: 'https://x.example.com' }),
    'respondió + APROBADA + finalUrl → habilitado',
  ).toBe(true)
  expect(
    gateEnvioDemo({ status: 'PROSPECTO', caliente: true, stage: 'APROBADA', finalUrl: 'https://x.example.com' }),
    'caliente + APROBADA + finalUrl → habilitado (demo preventiva)',
  ).toBe(true)
})
