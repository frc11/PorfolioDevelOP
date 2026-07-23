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
  guardarHorariosOfrecidosOwned,
} from '../../src/lib/leados/agenda'
import { AgendaSchema, type Agenda } from '../../src/lib/leados/contracts'

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
 * La primitiva: un `updateMany` condicional hace de llave — el ganador obtiene
 * 'claim'; el que llega tarde obtiene 'agendando' (hay una confirmación en
 * curso) o 'agendada' (ya hay reunión), y la action `confirmarReunion` rebota
 * sin crear un segundo booking.
 *
 * Sprint 6.1 — la condición se ENSANCHÓ (el mecanismo no cambió: sigue siendo
 * UN solo updateMany): reclamable desde `agendaJson` NULL **o** desde un blob
 * en estado OFRECIDOS, porque `ofrecerHorarios` ahora persiste la oferta. G1-G4
 * quedaron intactos —ninguna aserción de 6.0 tuvo que cambiar— y G5-G10 cubren
 * el estado de partida nuevo, la compensación con memoria y el contrato.
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
// 6.1 — el estado de partida nuevo (OFRECIDOS) y la memoria de la oferta.
let ofrecidosLeadId: string
let raceOfrecidosLeadId: string
let agendadaSeedLeadId: string
let compOfrecidosLeadId: string
let persistLeadId: string

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
  ofrecidosLeadId = await lead('AgendaOfrecidos')
  raceOfrecidosLeadId = await lead('AgendaOfrecidosRace')
  agendadaSeedLeadId = await lead('AgendaAgendadaSeed')
  compOfrecidosLeadId = await lead('AgendaCompOfrecidos')
  persistLeadId = await lead('AgendaPersistencia')
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

/** Los 3 horarios tal como los devuelve Cal.com: ISO con offset de BA. */
const HORARIOS = [
  '2026-09-01T14:00:00.000-03:00',
  '2026-09-02T16:30:00.000-03:00',
  '2026-09-03T11:00:00.000-03:00',
] as const

/** Deja el lead en el estado de partida nuevo por el MISMO write que usa la
 *  action (`ofrecerHorarios` → `guardarHorariosOfrecidosOwned`), no por seed. */
async function ofrecer(leadId: string, horarios: readonly string[] = HORARIOS): Promise<boolean> {
  return guardarHorariosOfrecidosOwned(leadId, setterId, [...horarios])
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

  // 6.0 anticipó que esta aserción cambiaría en 6.1. NO cambió, y el motivo
  // importa: la compensación ahora RESTAURA el estado previo al claim, y el
  // previo de ESTE lead era NULL (nunca se le ofrecieron horarios). El caso con
  // memoria —el que sí quedaba vacío antes y ahora vuelve a OFRECIDOS— es G8.
  expect(await leerAgenda(compLeadId), 'sin oferta previa, la compensación deja NULL').toBeNull()

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

// ── Sprint 6.1 · el segundo estado de partida + la memoria de la oferta ──────

test('G5 · un lead con horarios OFRECIDOS es reclamable, y el claim se lleva la memoria', async () => {
  // INVARIANTE 6.1: persistir la oferta NO puede trabar el booking. Antes de
  // 6.1 este claim rebotaba ('agendando') porque el blob no era NULL — el lead
  // quedaba inreclamable para siempre apenas se le ofrecían horarios.
  await prisma.$queryRaw`SELECT 1`
  expect(await leerAgenda(ofrecidosLeadId), 'precondición: arranca sin agenda').toBeNull()

  expect(await ofrecer(ofrecidosLeadId), 'la oferta se persiste desde blob vacío').toBe(true)
  const oferta = (await leerAgenda(ofrecidosLeadId)) as {
    estado?: string
    horariosOfrecidos?: string[]
  } | null
  expect(oferta?.estado, 'el lead quedó en el estado de partida nuevo').toBe('OFRECIDOS')
  expect(oferta?.horariosOfrecidos, 'con los 3 horarios que tiene el prospecto').toEqual([
    ...HORARIOS,
  ])

  expect(await marcarAgendandoOwned(ofrecidosLeadId, setterId), 'OFRECIDOS es reclamable').toBe(
    'claim',
  )

  // El claim arrastra la oferta adentro: es lo único que le permite a la
  // compensación restaurarla (el updateMany reemplaza el blob entero).
  const claim = (await leerAgenda(ofrecidosLeadId)) as {
    estado?: string
    claimedAt?: string
    horariosOfrecidos?: string[]
  } | null
  expect(claim?.estado, 'el claim selló AGENDANDO').toBe('AGENDANDO')
  expect(claim?.claimedAt, 'con su marca de tiempo').toEqual(expect.any(String))
  expect(claim?.horariosOfrecidos, 'y con la memoria de la oferta adentro').toEqual([...HORARIOS])
})

test('G6 · doble claim sobre un lead en OFRECIDOS → exactamente uno gana', async () => {
  // INVARIANTE: ensanchar la condición no aflojó la llave. Si el OR dejara
  // pasar dos ganadores serían DOS bookings en Cal.com — misma línea roja que
  // G1, ahora sobre el estado de partida nuevo. NO ajustar: reportar.
  await prisma.$queryRaw`SELECT 1`
  expect(await ofrecer(raceOfrecidosLeadId), 'precondición: oferta persistida').toBe(true)

  let resultados: Array<'claim' | 'agendando' | 'agendada' | null>
  try {
    resultados = await Promise.all([
      marcarAgendandoOwned(raceOfrecidosLeadId, setterId),
      marcarAgendandoOwned(raceOfrecidosLeadId, setterId),
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

  expect(
    [...resultados].sort(),
    `un solo claim ganador esperado desde OFRECIDOS; resultados=${JSON.stringify(resultados)}`,
  ).toEqual(['agendando', 'claim'])
})

test('G7 · un lead en AGENDADA sigue sin ser reclamable: el OR no alcanza la reunión confirmada', async () => {
  // INVARIANTE: la condición nueva tiene DOS ramas y ninguna matchea AGENDADA.
  // G4 llega a AGENDADA por el camino del claim; acá se siembra el blob directo
  // para atacar el `where` puro, sin claim previo que lo explique.
  await prisma.$queryRaw`SELECT 1`
  await prisma.osLeadDossier.update({
    where: { leadId: agendadaSeedLeadId },
    data: { agendaJson: agendaConfirmada('cal_smoke_6_1_seed') as object },
  })

  expect(
    await marcarAgendandoOwned(agendadaSeedLeadId, setterId),
    'una reunión confirmada nunca se re-reclama',
  ).toBe('agendada')

  const blob = (await leerAgenda(agendadaSeedLeadId)) as { estado?: string } | null
  expect(blob?.estado, 'y el blob quedó intacto').toBe('AGENDADA')

  // Ofrecer horarios tampoco pisa una reunión ya confirmada.
  expect(await ofrecer(agendadaSeedLeadId), 'la oferta NO pisa una AGENDADA').toBe(false)
  const despues = (await leerAgenda(agendadaSeedLeadId)) as { estado?: string } | null
  expect(despues?.estado, 'la reunión sobrevive al intento de oferta').toBe('AGENDADA')
})

test('G8 · compensación desde OFRECIDOS: el fallo de Cal.com NO se come los horarios ofrecidos', async () => {
  // INVARIANTE 6.1 (el corazón del sprint): si Cal.com falla, el prospecto
  // sigue teniendo esos 3 horarios en el chat. Vaciar el blob obligaría al
  // setter a pedir horarios de nuevo y ofrecer OTROS — la conversación se parte.
  await prisma.$queryRaw`SELECT 1`
  expect(await ofrecer(compOfrecidosLeadId), 'precondición: oferta persistida').toBe(true)
  const antes = (await leerAgenda(compOfrecidosLeadId)) as { ofrecidosAt?: string } | null
  const ofrecidosAtOriginal = antes?.ofrecidosAt

  expect(await marcarAgendandoOwned(compOfrecidosLeadId, setterId), 'claim previo al booking').toBe(
    'claim',
  )

  // Cal.com falló → la action compensa.
  await revertirAgendandoOwned(compOfrecidosLeadId, setterId)

  const restaurado = (await leerAgenda(compOfrecidosLeadId)) as {
    estado?: string
    horariosOfrecidos?: string[]
    ofrecidosAt?: string
    claimedAt?: string
  } | null
  expect(restaurado?.estado, 'la compensación devolvió el lead a OFRECIDOS').toBe('OFRECIDOS')
  expect(restaurado?.horariosOfrecidos, 'con los MISMOS horarios que circulan por el chat').toEqual([
    ...HORARIOS,
  ])
  expect(restaurado?.ofrecidosAt, 'y con el momento original de la oferta').toBe(
    ofrecidosAtOriginal,
  )
  expect(restaurado?.claimedAt, 'sin rastro del claim liberado').toBeUndefined()

  // Y lo que importa río abajo: el reintento vuelve a poder reclamar.
  expect(await marcarAgendandoOwned(compOfrecidosLeadId, setterId), 'reintento del setter').toBe(
    'claim',
  )
})

test('G9 · contrato: un blob con el shape ANTERIOR (sin los campos de 6.1) sigue parseando válido', async () => {
  // INVARIANTE: la extensión de AgendaSchema es ADITIVA y OPCIONAL. Si un campo
  // nuevo fuera requerido, TODA agenda escrita antes de 6.1 dejaría de parsear
  // y los 7 readers de `agendaJson` la verían como "sin agenda" — el pipeline
  // perdería reuniones reales. Puro contrato: sin DB.
  const blobViejo = {
    estado: 'AGENDADA',
    calBookingUid: 'cal_pre_6_1_uid',
    slotStart: '2026-05-04T15:00:00.000-03:00',
    attendee: { nombre: 'Prospecto B7', email: 'prospecto@pre61.test' },
    notasTraspaso: 'Traspaso escrito antes de 6.1.',
    agendadaAt: '2026-05-01T12:00:00.000Z',
  }
  const parsed = AgendaSchema.safeParse(blobViejo)
  expect(parsed.success, 'el blob pre-6.1 parsea sin los campos nuevos').toBe(true)
  expect(parsed.success && parsed.data.estado).toBe('AGENDADA')
  expect(parsed.success && parsed.data.horariosOfrecidos, 'los campos nuevos son opcionales').toBeUndefined()

  // El claim viejo (AGENDANDO pelado) también sobrevive.
  expect(
    AgendaSchema.safeParse({ estado: 'AGENDANDO', claimedAt: '2026-05-01T12:00:00.000Z' }).success,
    'el claim pre-6.1 parsea igual',
  ).toBe(true)
})

test('G10 · persistencia punta a punta a nivel datos: la oferta se relee de la DB, y solo el dueño la escribe', async () => {
  // Punta a punta HASTA DONDE LLEGA EL RUNNER: `ofrecerHorarios` corre bajo
  // requireSetter() (cookies de request) y pega contra Cal.com real, así que se
  // ejercita su write-path exacto —`guardarHorariosOfrecidosOwned`, el mismo que
  // la action invoca— y se relee el lead desde la DB. Mismo criterio que G1-G4.
  await prisma.$queryRaw`SELECT 1`
  expect(await leerAgenda(persistLeadId), 'precondición: arranca sin agenda').toBeNull()

  expect(await ofrecer(persistLeadId), 'la oferta se persistió').toBe(true)

  // Relectura fresca desde la DB (nada de reusar el objeto que se escribió).
  const dossier = await prisma.osLeadDossier.findUnique({
    where: { leadId: persistLeadId },
    select: { agendaJson: true },
  })
  const persistida = AgendaSchema.safeParse(dossier?.agendaJson)
  expect(persistida.success, 'lo persistido cumple el contrato').toBe(true)
  if (!persistida.success) return
  expect(persistida.data.estado, 'estado OFRECIDOS').toBe('OFRECIDOS')
  expect(persistida.data.horariosOfrecidos, 'los slots ofrecidos, tal cual').toEqual([...HORARIOS])
  expect(persistida.data.ofrecidosAt, 'con el momento de la oferta').toEqual(expect.any(String))

  // Re-ofrecer REEMPLAZA (last-write-wins, deliberado): lo que vale es lo
  // último que el prospecto tiene en la mano.
  const nuevos = ['2026-10-05T10:00:00.000-03:00']
  expect(await ofrecer(persistLeadId, nuevos), 're-ofrecer pisa la oferta anterior').toBe(true)
  const reofrecida = (await leerAgenda(persistLeadId)) as { horariosOfrecidos?: string[] } | null
  expect(reofrecida?.horariosOfrecidos, 'quedaron solo los últimos').toEqual(nuevos)

  // OWNERSHIP: el write nuevo pasa por getOwnedDossier. Un setter ajeno no
  // escribe NADA — si esto falla es una fuga de escritura cruzada, no un test
  // a ajustar.
  expect(
    await guardarHorariosOfrecidosOwned(persistLeadId, ajenoId, [...HORARIOS]),
    'el setter ajeno no puede ofrecer horarios sobre un lead que no es suyo',
  ).toBe(false)
  const intacta = (await leerAgenda(persistLeadId)) as { horariosOfrecidos?: string[] } | null
  expect(intacta?.horariosOfrecidos, 'el intento ajeno no tocó la oferta del dueño').toEqual(nuevos)
})
