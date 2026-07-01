import { test, expect } from '@playwright/test'
import {
  createSetter,
  createLead,
  prisma,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'
// Cadena REAL bajo prueba (importable en el runner — verificado: dossier.ts /
// os-commercial.ts no arrastran next/headers ni server-only; el alias `@/`
// resuelve). NO se toca esta lógica: se TESTEA.
import { marcarDemoEnviadaOwned, revertirDemoEnviadaOwned } from '../../src/lib/leados/dossier'
import { crearDemoComercial } from '../../src/lib/os-commercial'

/**
 * Sección F — Claim atómico del envío de demo (Sprint 5.2, gap (a)).
 *
 * El gap que SOLO la DB real alcanza: dos envíos simultáneos sobre el MISMO lead
 * deben producir EXACTAMENTE un OsDemo. La línea roja es `marcarDemoEnviadaOwned`
 * (dossier.ts): un `updateMany` condicional sobre `enviadaAt: null` hace de claim
 * — el ganador obtiene 'marcada' y crea el OsDemo; el perdedor obtiene
 * 'ya-enviada' (compensación idempotente) y NO crea un segundo demo.
 *
 * Por qué in-process y no por HTTP: `enviarDemoAprobada` (la action) corre bajo
 * `requireSetter()` → `auth()` → cookies de request, inalcanzable desde el
 * runner; y dos POST paralelos contra Neon son el camino MÁS flaky (lo advierte
 * el sprint). Acá llamamos la primitiva de concurrencia directa, contra la DB
 * real, vía Promise.all — determinista y sin ruido de red.
 */

const FINAL_URL = 'https://smoke-claim-final.example.com'
const tracker: SmokeTracker = newTracker()
let setterId: string
let raceLeadId: string
let idemLeadId: string

test.beforeAll(async () => {
  const setter = await createSetter(tracker, 'claim')
  setterId = setter.id
  // Dos leads APROBADA distintos (namespaced SMOKE-SETTER, teardown por id): uno
  // para la carrera, otro para el contrato idempotencia/compensación. Status
  // RESPONDIO = gate de envío abierto (aunque el claim no lo mira, el lead queda
  // en un estado realmente enviable).
  const race = await createLead(tracker, {
    setterId,
    businessName: 'ClaimRace',
    stage: 'APROBADA',
    status: 'RESPONDIO',
    finalUrl: FINAL_URL,
  })
  raceLeadId = race.id
  const idem = await createLead(tracker, {
    setterId,
    businessName: 'ClaimIdem',
    stage: 'APROBADA',
    status: 'RESPONDIO',
    finalUrl: FINAL_URL,
  })
  idemLeadId = idem.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/** Heurística para distinguir "pool de Neon stale/caído" de un bug de concurrencia. */
function esErrorDeConexion(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return /P100\d|P1017|can't reach|connection|connect|pool|timed out|timeout|ECONNREFUSED|terminating/i.test(
    msg,
  )
}

/**
 * Espejo FIEL del cuerpo post-gate de `enviarDemoAprobada` (outreach.actions.ts):
 * el claim decide y SOLO el ganador crea el OsDemo. Se omiten a propósito
 * requireSetter()/Zod/gate (guards por-request, NO sensibles a concurrencia y
 * atados a `next/headers`) y los revalidate (irrelevantes a la invariante de DB).
 * Lo que se ejerce es exactamente la primitiva línea roja: marcar + crear.
 */
async function enviarDemoCore(
  leadId: string,
  userId: string,
  demoUrl: string,
): Promise<'marcada' | 'ya-enviada' | null> {
  const claim = await marcarDemoEnviadaOwned(leadId, userId)
  if (claim === 'marcada') {
    await crearDemoComercial({ leadId, demoUrl, notes: 'smoke 5.2 claim-atómico' })
  }
  return claim
}

test('F1 · dos envíos en paralelo sobre el mismo lead → exactamente 1 OsDemo; el perdedor recibe "ya-enviada"', async () => {
  // Guard anti-flaky (mandato del sprint): si el pool está stale, los errores de
  // conexión NO son el claim. Pingear conectividad y precondición ANTES de correr.
  await prisma.$queryRaw`SELECT 1`
  const antes = await prisma.osLeadDossier.findUnique({
    where: { leadId: raceLeadId },
    select: { enviadaAt: true },
  })
  expect(antes?.enviadaAt, 'precondición: arranca sin enviar (enviadaAt null)').toBeNull()
  expect(
    await prisma.osDemo.count({ where: { leadId: raceLeadId } }),
    'precondición: 0 OsDemo',
  ).toBe(0)

  let resultados: Array<'marcada' | 'ya-enviada' | null>
  try {
    resultados = await Promise.all([
      enviarDemoCore(raceLeadId, setterId, FINAL_URL),
      enviarDemoCore(raceLeadId, setterId, FINAL_URL),
    ])
  } catch (error) {
    if (esErrorDeConexion(error)) {
      throw new Error(
        'DB pool stale/inalcanzable durante la carrera — corré `npx prisma migrate status` y reintentá; ' +
          'NO es un bug de concurrencia. Causa: ' +
          (error instanceof Error ? error.message : String(error)),
      )
    }
    throw error
  }

  // La línea roja: exactamente UN ganador ('marcada') y UN perdedor ('ya-enviada').
  expect(
    [...resultados].sort(),
    `un solo claim ganador esperado; resultados=${JSON.stringify(resultados)}`,
  ).toEqual(['marcada', 'ya-enviada'])

  // La invariante observable: UN solo OsDemo. Si da 2 → BUG real de concurrencia
  // (el claim no aisló). NO ajustar el test: reportar.
  const demos = await prisma.osDemo.count({ where: { leadId: raceLeadId } })
  expect(demos, 'exactamente 1 OsDemo tras la carrera').toBe(1)

  // La marca atómica quedó puesta.
  const despues = await prisma.osLeadDossier.findUnique({
    where: { leadId: raceLeadId },
    select: { enviadaAt: true },
  })
  expect(despues?.enviadaAt, 'enviadaAt quedó sellado por el ganador').not.toBeNull()
})

test('F2 · contrato del claim: re-marcar es idempotente ("ya-enviada") y la compensación reabre el claim', async () => {
  await prisma.$queryRaw`SELECT 1`

  // 1) Primer claim: gana.
  expect(await marcarDemoEnviadaOwned(idemLeadId, setterId)).toBe('marcada')
  // 2) Re-marcar: idempotente, sin segundo claim.
  expect(await marcarDemoEnviadaOwned(idemLeadId, setterId)).toBe('ya-enviada')

  // 3) Compensación (cuando la creación del OsDemo falla): libera la marca.
  await revertirDemoEnviadaOwned(idemLeadId, setterId)
  const reabierto = await prisma.osLeadDossier.findUnique({
    where: { leadId: idemLeadId },
    select: { enviadaAt: true },
  })
  expect(reabierto?.enviadaAt, 'la compensación liberó enviadaAt').toBeNull()

  // 4) Tras compensar, el claim vuelve a estar disponible (reintento del setter).
  expect(await marcarDemoEnviadaOwned(idemLeadId, setterId)).toBe('marcada')
})
