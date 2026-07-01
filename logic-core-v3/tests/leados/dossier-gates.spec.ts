import { test, expect } from '@playwright/test'
import { Prisma } from '@prisma/client'
import {
  prisma,
  createSetter,
  newTracker,
  teardown,
  disconnect,
  SMOKE_TAG,
  type SmokeTracker,
} from '../helpers/setter-db'
// Cadena REAL bajo prueba (NO se toca: se TESTEA). Mismo patrón que
// 06-claim-atomico: el alias `@/` interno de dossier.ts resuelve en el runner y
// no arrastra next/headers ni server-only.
import {
  ensureOwnedDossier,
  getOwnedDossier,
  transitionDossier,
  DossierTransitionError,
} from '../../src/lib/leados/dossier'

/**
 * COSECHA DE DURABILIDAD (Sprint 5.3) — `scripts/b2-verify-dossier.ts` era un
 * harness manual host-gateado a la branch Neon dev + `npx tsx`, NO wired a la
 * suite. Acá sus checks corren como regresión durable, contra la DB de la config
 * (Neon dev en local vía .env.local, DB de test dedicada en CI): la máquina de
 * stage, el gate del flujo invertido (EVALUADA→BRIEF), el motivo obligatorio del
 * descarte/rechazo, el append al historial `rechazos` y el re-loop
 * RECHAZADA→CONSTRUCCION que preserva la historia.
 *
 * Datos namespaced (SMOKE-SETTER) + teardown por id EXACTO — la Neon dev es
 * compartida/driftada: nunca borrar por heurística amplia. NINGÚN gate se relaja:
 * se verifica que bloquea cuando debe y deja pasar cuando debe.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let otroSetterId: string

test.beforeAll(async () => {
  const a = await createSetter(tracker, 'gates-a')
  const b = await createSetter(tracker, 'gates-b')
  setterId = a.id
  otroSetterId = b.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/**
 * Lead namespaced SIN dossier (para ejercer ensureOwnedDossier desde cero).
 * `createLead` del helper siempre crea el dossier; acá se necesita el lead pelado.
 */
async function createBareLead(opts: {
  status?: 'PROSPECTO' | 'RESPONDIO'
  caliente?: boolean
}): Promise<string> {
  const lead = await prisma.osLead.create({
    data: {
      businessName: `${SMOKE_TAG} gates ${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      source: 'leados-gates-spec',
      status: opts.status ?? 'PROSPECTO',
      caliente: opts.caliente ?? false,
      assignedToId: setterId,
    },
    select: { id: true },
  })
  tracker.leadIds.push(lead.id)
  return lead.id
}

/** Lleva un lead pelado hasta EVALUADA con el score/veredicto pedido. */
async function hastaEvaluada(leadId: string, score: number, veredicto: 'AVANZAR' | 'CALIENTE' | 'DESCARTAR') {
  await ensureOwnedDossier(leadId, setterId)
  await transitionDossier(leadId, {
    to: 'EVALUADA',
    evaluacion: { score, veredicto, razonamiento: 'fixture de gate 5.3' },
  })
}

async function expectRejects(fn: () => Promise<unknown>): Promise<DossierTransitionError> {
  let caught: unknown = null
  try {
    await fn()
  } catch (error) {
    caught = error
  }
  expect(caught, 'se esperaba un DossierTransitionError').toBeInstanceOf(DossierTransitionError)
  return caught as DossierTransitionError
}

/** Solo exige que algo se haya lanzado (el contrato zod rebota con ZodError, no DossierTransitionError). */
async function expectThrows(fn: () => Promise<unknown>): Promise<void> {
  let threw = false
  try {
    await fn()
  } catch {
    threw = true
  }
  expect(threw, 'se esperaba que la operación lanzara').toBe(true)
}

test('unicidad 1:1 + idempotencia: ensureOwnedDossier crea en FICHA y no duplica', async () => {
  const leadId = await createBareLead({})

  const d1 = await ensureOwnedDossier(leadId, setterId)
  expect(d1?.stage, 'el dossier nace en FICHA').toBe('FICHA')

  const d2 = await ensureOwnedDossier(leadId, setterId)
  expect(d2?.id, 'segundo ensure devuelve el MISMO dossier (idempotente)').toBe(d1?.id)

  // El unique de DB en leadId rechaza un create crudo duplicado (P2002).
  let code: string | null = null
  try {
    await prisma.osLeadDossier.create({ data: { leadId } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) code = error.code
  }
  expect(code, 'un segundo dossier para el mismo lead viola el unique (P2002)').toBe('P2002')
})

test('ownership: un lead ajeno da null en get y ensure (anti cross-setter)', async () => {
  const leadId = await createBareLead({})
  await ensureOwnedDossier(leadId, setterId)

  expect(await getOwnedDossier(leadId, otroSetterId), 'otro setter no lee el dossier').toBeNull()
  expect(await ensureOwnedDossier(leadId, otroSetterId), 'otro setter no crea sobre un lead ajeno').toBeNull()
})

test('máquina de stage: transición ilegal y contrato inválido fallan', async () => {
  const leadId = await createBareLead({})
  await ensureOwnedDossier(leadId, setterId)

  await expectRejects(() => transitionDossier(leadId, { to: 'BRIEF' })) // FICHA→BRIEF ilegal (DossierTransitionError)
  await expectThrows(() =>
    transitionDossier(leadId, {
      to: 'EVALUADA',
      // score fuera de rango 1..5 → el contrato zod rebota (ZodError).
      evaluacion: { score: 7 as never, veredicto: 'AVANZAR', razonamiento: 'score inválido' },
    }),
  )
})

test('gate EVALUADA→BRIEF: bloquea frío (aun con score alto) y deja pasar al marcar caliente', async () => {
  // PROSPECTO + caliente=false + score 5: el gate del flujo invertido BLOQUEA.
  // El score del setter ya no abre la demo preventiva — la abre el campo `caliente`.
  const leadId = await createBareLead({ status: 'PROSPECTO', caliente: false })
  await hastaEvaluada(leadId, 5, 'CALIENTE')

  await expectRejects(() => transitionDossier(leadId, { to: 'BRIEF' }))

  await prisma.osLead.update({ where: { id: leadId }, data: { caliente: true } })
  const brief = await transitionDossier(leadId, { to: 'BRIEF' })
  expect(brief.stage, 'marcar caliente=true abre el gate').toBe('BRIEF')
})

test('gate EVALUADA→BRIEF: RESPONDIO abre aunque el score sea bajo y esté frío', async () => {
  const leadId = await createBareLead({ status: 'RESPONDIO', caliente: false })
  await hastaEvaluada(leadId, 2, 'AVANZAR')

  const brief = await transitionDossier(leadId, { to: 'BRIEF' })
  expect(brief.stage, 'el responder manda: gate abierto con score 2 y frío').toBe('BRIEF')
})

test('DESCARTADA exige motivo, lo guarda y es terminal', async () => {
  const leadId = await createBareLead({})
  await hastaEvaluada(leadId, 2, 'DESCARTAR')

  await expectRejects(() => transitionDossier(leadId, { to: 'DESCARTADA', motivoDescarte: '   ' }))

  const descartado = await transitionDossier(leadId, {
    to: 'DESCARTADA',
    motivoDescarte: 'Score 2: sin presencia digital rescatable',
  })
  expect(descartado.stage).toBe('DESCARTADA')
  const evalJson = descartado.evaluacionJson as Record<string, unknown> | null
  expect(typeof evalJson?.motivoDescarte, 'el motivo queda estampado en evaluacionJson').toBe('string')

  // Terminal: ninguna transición sale de DESCARTADA.
  await expectRejects(() => transitionDossier(leadId, { to: 'BRIEF' }))
})

test('RECHAZADA exige motivo, appendea al historial y el re-loop preserva la historia', async () => {
  // Camino caliente hasta EN_REVISION.
  const leadId = await createBareLead({ status: 'PROSPECTO', caliente: true })
  await hastaEvaluada(leadId, 5, 'CALIENTE')
  await transitionDossier(leadId, { to: 'BRIEF' })
  await transitionDossier(leadId, { to: 'CONSTRUCCION' })
  await transitionDossier(leadId, { to: 'EN_REVISION' })

  // Motivo obligatorio.
  await expectRejects(() => transitionDossier(leadId, { to: 'RECHAZADA', motivo: '' }))

  // Primer rechazo → historial de 1.
  const r1 = await transitionDossier(leadId, {
    to: 'RECHAZADA',
    motivo: 'Hero flojo',
    detalle: 'El above-the-fold no comunica el rubro',
  })
  expect(Array.isArray(r1.rechazos) ? r1.rechazos.length : 0, 'primer rechazo appendea 1').toBe(1)

  // Re-loop y SEGUNDO rechazo → historial de 2 (el primero SOBREVIVE al re-loop).
  await transitionDossier(leadId, { to: 'CONSTRUCCION' })
  await transitionDossier(leadId, { to: 'EN_REVISION' })
  const r2 = await transitionDossier(leadId, { to: 'RECHAZADA', motivo: 'Faltan assets reales' })
  expect(Array.isArray(r2.rechazos) ? r2.rechazos.length : 0, 'el re-loop preserva la historia (2 rechazos)').toBe(2)

  // Cierre del loop: reabrir → revisión → APROBADA, con la historia intacta.
  await transitionDossier(leadId, { to: 'CONSTRUCCION' })
  await transitionDossier(leadId, { to: 'EN_REVISION' })
  const aprobado = await transitionDossier(leadId, { to: 'APROBADA' })
  expect(aprobado.stage).toBe('APROBADA')
  expect(Array.isArray(aprobado.rechazos) ? aprobado.rechazos.length : 0, 'los 2 rechazos sobreviven hasta APROBADA').toBe(2)
})

test('cascade: borrar el lead borra su dossier', async () => {
  const leadId = await createBareLead({})
  await ensureOwnedDossier(leadId, setterId)

  await prisma.osLead.delete({ where: { id: leadId } })
  tracker.leadIds.splice(tracker.leadIds.indexOf(leadId), 1)

  expect(await prisma.osLeadDossier.findUnique({ where: { leadId } }), 'onDelete Cascade borró el dossier').toBeNull()
})
