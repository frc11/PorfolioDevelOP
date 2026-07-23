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
// Cadena REAL bajo prueba (importable en el runner: agenda.ts no arrastra
// next/headers ni server-only, el alias `@/` resuelve). NO se toca esta
// lógica: se CARACTERIZA lo que hace HOY.
import {
  marcarAgendandoOwned,
  revertirAgendandoOwned,
  guardarAgendaOwned,
} from '../../src/lib/leados/agenda'
import type { Agenda } from '../../src/lib/leados/contracts'

/**
 * Sección G — Claim atómico de AGENDA (Sprint 6.0, red previa a B-05).
 *
 * Test de CARACTERIZACIÓN: documenta y protege el comportamiento ACTUAL de
 * `marcarAgendandoOwned` (agenda.ts) — el claim que corre ANTES del booking en
 * Cal.com. Hasta hoy ese guard no tenía ninguna cobertura: `06-claim-atomico`
 * cubre el claim del ENVÍO de demo (`enviadaAt`), y el único test que rozaba
 * agenda (`01-flow`) siembra `agendaJson` en AGENDADA directo, salteando el
 * claim entero.
 *
 * La primitiva: un `updateMany` condicional sobre `agendaJson NULL` hace de
 * llave — el ganador obtiene 'claim'; el que llega tarde obtiene 'agendando'
 * (hay una confirmación en curso) o 'agendada' (ya hay reunión), y la action
 * `confirmarReunion` rebota sin crear un segundo booking.
 *
 * Por qué in-process y no por HTTP: `confirmarReunion` corre bajo
 * `requireSetter()` → `auth()` → cookies de request, inalcanzable desde el
 * runner, y además pega contra Cal.com REAL (createBooking). Acá se llama la
 * primitiva de concurrencia directa contra la DB real — determinista, sin red
 * y sin agendar nada en el calendario de Franco. Mismo criterio que la
 * sección F.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let ajenoId: string
let raceLeadId: string
let ajenoLeadId: string
let compLeadId: string
let agendadaLeadId: string

test.beforeAll(async () => {
  const setter = await createSetter(tracker, 'agenda')
  setterId = setter.id
  const ajeno = await createSetter(tracker, 'agenda-ajeno')
  ajenoId = ajeno.id

  // Cuatro leads namespaced (teardown por id) del setter A, en el punto de
  // partida REAL del Paso 10: status RESPONDIO (el negocio aceptó reunirse) y
  // demo aprobada. El claim no mira status ni stage, pero el escenario queda
  // honesto. El setter B nunca es dueño de ninguno: es el intruso de G2.
  const lead = async (businessName: string) =>
    (
      await createLead(tracker, {
        setterId,
        businessName,
        stage: 'APROBADA',
        status: 'RESPONDIO',
      })
    ).id

  raceLeadId = await lead('AgendaRace')
  ajenoLeadId = await lead('AgendaAjeno')
  compLeadId = await lead('AgendaComp')
  agendadaLeadId = await lead('AgendaYaAgendada')
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/** Heurística para distinguir "pool de Neon stale/caído" de un bug de concurrencia. */
function esErrorDeConexion(error: unknown): boolean {
  return /P100\d|P1017|can't reach|connection|connect|pool|timed out|timeout|ECONNREFUSED|terminating/i.test(
    error instanceof Error ? error.message : String(error),
  )
}

async function leerAgenda(leadId: string): Promise<unknown> {
  const dossier = await prisma.osLeadDossier.findUnique({
    where: { leadId },
    select: { agendaJson: true },
  })
  return dossier?.agendaJson ?? null
}

/** Espejo del blob que escribe `confirmarReunion` tras el OK de Cal.com. */
function agendaConfirmada(uid: string): Agenda {
  return {
    estado: 'AGENDADA',
    calBookingUid: uid,
    slotStart: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    attendee: { nombre: 'Prospecto Smoke', email: 'prospecto@smoke.test' },
    notasTraspaso: 'Traspaso de smoke 6.0 — caracterización del claim.',
    agendadaAt: new Date().toISOString(),
  }
}

test('G1 · doble claim sobre el mismo lead → exactamente uno gana; el segundo rebota a "agendando"', async () => {
  // INVARIANTE: dos confirmaciones simultáneas producen UN solo booking en
  // Cal.com. El `updateMany` condicional sobre agendaJson NULL es la llave.
  await prisma.$queryRaw`SELECT 1`
  expect(await leerAgenda(raceLeadId), 'precondición: arranca sin agenda').toBeNull()

  // Misma técnica que la sección F (06-claim-atomico): Promise.all sobre la
  // primitiva contra la DB real. NO es paralelismo de proceso, pero sí dos
  // transacciones en vuelo contra el mismo row — que es exactamente lo que el
  // updateMany condicional tiene que resolver.
  let resultados: Array<'claim' | 'agendando' | 'agendada' | null>
  try {
    resultados = await Promise.all([
      marcarAgendandoOwned(raceLeadId, setterId),
      marcarAgendandoOwned(raceLeadId, setterId),
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

  // La línea roja: UN ganador ('claim') y UN perdedor ('agendando'). Si dieran
  // dos 'claim' → BUG real de concurrencia. NO ajustar el test: reportar.
  expect(
    [...resultados].sort(),
    `un solo claim ganador esperado; resultados=${JSON.stringify(resultados)}`,
  ).toEqual(['agendando', 'claim'])

  // El ganador dejó el blob AGENDANDO con su marca de tiempo: el estado que
  // `guardarAgendaOwned` exige después para poder escribir AGENDADA.
  const blob = (await leerAgenda(raceLeadId)) as { estado?: string; claimedAt?: string } | null
  expect(blob?.estado, 'el ganador selló el claim AGENDANDO').toBe('AGENDANDO')
  expect(blob?.claimedAt, 'el claim viaja con claimedAt (diagnóstico de claims colgados)').toEqual(
    expect.any(String),
  )
})

test('G2 · ownership cruzado: un setter NO puede reclamar la agenda del lead de otro setter', async () => {
  // INVARIANTE (aislamiento multi-tenant): el claim pasa por getOwnedDossier —
  // un lead ajeno devuelve null ANTES de tocar la DB. Si esto falla no es un
  // test a ajustar: es una fuga de escritura cruzada.
  await prisma.$queryRaw`SELECT 1`
  expect(await leerAgenda(ajenoLeadId), 'precondición: arranca sin agenda').toBeNull()

  const intrusion = await marcarAgendandoOwned(ajenoLeadId, ajenoId)
  expect(intrusion, 'el setter ajeno recibe null (lead no encontrado), no un claim').toBeNull()
  expect(await leerAgenda(ajenoLeadId), 'el intento ajeno NO escribió nada en el dossier').toBeNull()

  // Y el dueño real sigue pudiendo reclamar: el rebote ajeno no consumió la llave.
  expect(await marcarAgendandoOwned(ajenoLeadId, setterId), 'el dueño reclama normal').toBe('claim')
})

test('G3 · compensación: tras revertirAgendandoOwned el lead vuelve a ser reclamable', async () => {
  // INVARIANTE: si Cal.com falla, el claim se libera y el setter puede
  // reintentar — el lead no queda trabado para siempre en AGENDANDO.
  await prisma.$queryRaw`SELECT 1`

  expect(await marcarAgendandoOwned(compLeadId, setterId), 'primer claim gana').toBe('claim')
  // Re-claim inmediato: idempotente, rebota a 'agendando' (confirmación en curso).
  expect(await marcarAgendandoOwned(compLeadId, setterId), 're-claim rebota').toBe('agendando')

  await revertirAgendandoOwned(compLeadId, setterId)

  // COMPORTAMIENTO ACTUAL (caracterización, NO deseo): la compensación deja el
  // blob en NULL de DB (`Prisma.DbNull`) — borra el claim entero en vez de
  // dejar rastro del intento fallido. El sprint 6.1 va a cambiar esto A
  // PROPÓSITO; cuando lo haga, esta aserción es la que tiene que actualizarse.
  expect(await leerAgenda(compLeadId), 'la compensación dejó agendaJson en NULL').toBeNull()

  // Lo que importa río abajo: la llave volvió a estar disponible.
  expect(await marcarAgendandoOwned(compLeadId, setterId), 'reintento del setter').toBe('claim')
})

test('G4 · post-AGENDADA: un lead con reunión confirmada no se puede volver a reclamar', async () => {
  // INVARIANTE: una reunión ya confirmada nunca se pisa con un segundo booking;
  // el intento se distingue del "en curso" para que la UI diga la verdad.
  await prisma.$queryRaw`SELECT 1`

  // Camino REAL, no seed crudo: claim → write final (lo que hace confirmarReunion
  // tras el OK de Cal.com). `guardarAgendaOwned` exige el claim AGENDANDO propio.
  expect(await marcarAgendandoOwned(agendadaLeadId, setterId), 'claim previo al booking').toBe(
    'claim',
  )
  await guardarAgendaOwned(agendadaLeadId, setterId, agendaConfirmada('cal_smoke_6_0_uid'))

  const blob = (await leerAgenda(agendadaLeadId)) as { estado?: string } | null
  expect(blob?.estado, 'precondición: el lead quedó AGENDADA').toBe('AGENDADA')

  // Camino de HOY: el updateMany no matchea (agendaJson no es NULL) y el parse
  // del blob existente da AGENDADA → 'agendada'. La action lo traduce a
  // "Este lead ya tiene la reunión agendada" (distinto del rebote 'agendando').
  expect(await marcarAgendandoOwned(agendadaLeadId, setterId), 'segundo intento post-booking').toBe(
    'agendada',
  )

  // Y la compensación del claim NO alcanza una AGENDADA (filtra por AGENDANDO):
  // la reunión confirmada sobrevive a un revert tardío.
  await revertirAgendandoOwned(agendadaLeadId, setterId)
  const despues = (await leerAgenda(agendadaLeadId)) as { estado?: string } | null
  expect(despues?.estado, 'la AGENDADA sobrevive al revert del claim').toBe('AGENDADA')
})
