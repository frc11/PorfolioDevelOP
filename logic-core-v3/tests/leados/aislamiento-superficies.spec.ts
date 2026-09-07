import { test, expect } from '@playwright/test'
import {
  prisma,
  createLead,
  createNotice,
  createSetter,
  newTracker,
  registerActivity,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'
// La cadena REAL bajo prueba. Se importa la función de producción, no una
// réplica: el alias `@/` resuelve en el runner y ninguno de estos módulos
// arrastra next/headers ni server-only (mismo criterio que dossier-gates).
import { getOwnedLead, listOwnedLeads } from '../../src/lib/leados/ownership'
import { listOwnedLeadTimeline } from '../../src/lib/leados/timeline'
import { contarDmsHoy, listOwnedLeadActivities } from '../../src/lib/leados/outreach'
import { getProgresoSemana } from '../../src/lib/leados/progreso'
import {
  contarNovedadesSinLeer,
  marcarNovedadesVistas,
} from '../../src/lib/leados/novedades'
import { upsertSetterMeta } from '../../src/lib/leados/setter-meta'
import { derivarMisNumeros } from '../../src/lib/leados/mis-numeros'

/**
 * P27 — AISLAMIENTO ENTRE SETTERS, OPERANDO LA APLICACIÓN.
 *
 * Los invariantes de P27 leen la FUENTE: prueban que cada consulta llama a su
 * helper y que cada caller tiene su gate. Eso es una afirmación sobre el texto
 * del programa. Esta suite prueba la otra mitad —la conducta— corriendo las
 * funciones de producción contra la DB, una por cada superficie que el censo de
 * P27 marcó, con dos setters de verdad:
 *
 *   A tiene su cartera, su meta privado, su historial, sus DMs y sus novedades.
 *   B tiene los suyos. Ninguna llamada de B devuelve NADA de A.
 *
 * Por qué las dos mitades y no una: leer la fuente atrapa el `where` reescrito a
 * mano (que corre bien hasta el día que no); operar la aplicación atrapa lo que
 * el texto no dice —un `include` que arrastra de más, un filtro que Prisma
 * interpreta distinto—. Ninguna de las dos sola alcanza.
 *
 * Datos namespaced (SMOKE-SETTER) + teardown por id EXACTO: la Neon dev es
 * compartida y driftada; nunca se borra por heurística amplia.
 */

const tracker: SmokeTracker = newTracker()
let setterA: string
let setterB: string
let leadDeA: string
let leadDeB: string

test.beforeAll(async () => {
  const a = await createSetter(tracker, 'aisl-a')
  const b = await createSetter(tracker, 'aisl-b')
  setterA = a.id
  setterB = b.id

  const la = await createLead(tracker, {
    setterId: setterA,
    businessName: 'Cartera de A',
    meta: { pinned: true, note: 'nota privada de A' },
  })
  const lb = await createLead(tracker, {
    setterId: setterB,
    businessName: 'Cartera de B',
    meta: { pinned: true, note: 'nota privada de B' },
  })
  leadDeA = la.id
  leadDeB = lb.id

  // Historial: cada uno registra sus propios contactos sobre su propio lead.
  await registerActivity(leadDeA, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterA, 'opener de A')
  await registerActivity(leadDeB, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterB, 'opener de B')
  await registerActivity(leadDeB, 'WHATSAPP', 'SIN_RESPUESTA', setterB, 'segundo toque de B')

  // Novedades dirigidas: dos para B, ninguna para A.
  await createNotice({
    setterId: setterB,
    leadId: leadDeB,
    kind: 'DEMO_APROBADA',
    title: 'Novedad de B',
    body: 'solo para B',
  })
  await createNotice({
    setterId: setterB,
    leadId: null,
    kind: 'LEAD_REASIGNADO_SALIENTE',
    title: 'Otra novedad de B',
    body: 'solo para B',
  })
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('la CARTERA de A no trae ningún lead de B (listOwnedLeads)', async () => {
  const deA = await listOwnedLeads(setterA)
  const idsA = deA.map((lead) => lead.id)

  expect(idsA, 'el lead propio de A está en su cartera').toContain(leadDeA)
  expect(idsA, 'el lead de B NO puede aparecer en la cartera de A').not.toContain(leadDeB)
  expect(
    deA.every((lead) => lead.assignedToId === setterA),
    'toda fila de la cartera de A es de A',
  ).toBe(true)
})

test('el META PRIVADO de A no viaja en la cartera de B, ni al revés (setterMetas)', async () => {
  // El caso que hace falta forzar: A escribe SU meta sobre un lead que después
  // es de B. La fila existe y es de A; el `include` de B no puede traerla.
  await upsertSetterMeta(leadDeB, setterA, { note: 'nota de A sobre un lead que hoy es de B' })

  const deB = await listOwnedLeads(setterB)
  const filaB = deB.find((lead) => lead.id === leadDeB)
  expect(filaB, 'B ve su propio lead').toBeTruthy()

  const notas = (filaB?.setterMetas ?? []).map((meta) => meta.note)
  expect(
    filaB?.setterMetas.every((meta) => meta.setterId === setterB),
    'toda fila de meta que B recibe es SUYA',
  ).toBe(true)
  expect(notas, 'la nota privada de A no puede llegarle a B').not.toContain(
    'nota de A sobre un lead que hoy es de B',
  )
  expect(notas, 'B sigue viendo su propia nota').toContain('nota privada de B')
})

test('un LEAD ajeno es indistinguible de inexistente (getOwnedLead)', async () => {
  expect(await getOwnedLead(leadDeB, setterA), 'A no alcanza el lead de B').toBeNull()
  expect(await getOwnedLead(leadDeA, setterB), 'B no alcanza el lead de A').toBeNull()
  expect(await getOwnedLead(leadDeA, setterA), 'cada uno sí alcanza el suyo').not.toBeNull()
})

test('el TIMELINE de un lead ajeno no se abre (listOwnedLeadTimeline)', async () => {
  expect(
    await listOwnedLeadTimeline(leadDeB, setterA),
    'A no lee el historial del lead de B',
  ).toBeNull()

  const propio = await listOwnedLeadTimeline(leadDeB, setterB)
  expect(propio, 'B sí lee el suyo').not.toBeNull()
  expect(propio?.length, 'y trae sus dos contactos').toBe(2)
})

test('las ACTIVIDADES comerciales de un lead ajeno no se leen (listOwnedLeadActivities)', async () => {
  expect(
    await listOwnedLeadActivities(leadDeB, setterA),
    'A no lee las actividades del lead de B',
  ).toBeNull()
  expect(
    (await listOwnedLeadActivities(leadDeB, setterB))?.length,
    'B lee las suyas',
  ).toBe(2)
})

test('los CONTADORES son por performer: los DMs y los contactos de B no suman a A', async () => {
  // B mandó un DM hoy; A mandó uno. Ninguno ve el del otro.
  expect(await contarDmsHoy(setterA), 'A cuenta SOLO su propio DM').toBe(1)
  expect(await contarDmsHoy(setterB), 'B cuenta SOLO el suyo').toBe(1)

  const semanaA = await getProgresoSemana(setterA, [])
  const semanaB = await getProgresoSemana(setterB, [])
  expect(semanaA.contactos, 'los contactos de la semana de A son los de A').toBe(1)
  expect(semanaB.contactos, 'los de B son los de B (dos toques)').toBe(2)
})

test('las NOVEDADES dirigidas a B no las ve ni las marca A (feed addressed)', async () => {
  expect(await contarNovedadesSinLeer(setterB), 'B tiene sus dos avisos').toBe(2)
  expect(await contarNovedadesSinLeer(setterA), 'A no tiene ninguno').toBe(0)

  // Y la ESCRITURA: A marcando «vistas» no puede apagarle los avisos a B.
  const marcadasPorA = await marcarNovedadesVistas(setterA)
  expect(marcadasPorA, 'A no marca ninguna: no tiene').toBe(0)
  expect(
    await contarNovedadesSinLeer(setterB),
    'los avisos de B siguen sin leer después de que A marcó',
  ).toBe(2)

  const marcadasPorB = await marcarNovedadesVistas(setterB)
  expect(marcadasPorB, 'B sí marca los suyos').toBe(2)
})

test('MIS NÚMEROS de A se calculan solo con su cartera y bajo su propio id', async () => {
  const numeros = await listOwnedLeads(setterA).then((leads) =>
    derivarMisNumeros(leads, setterA),
  )
  const deA = await listOwnedLeads(setterA)

  expect(numeros.enCartera, 'la cartera de A es exactamente la que devolvió su query').toBe(
    deA.length,
  )
  // La contracara: los números de B, sobre la MISMA superficie, no coinciden con
  // los de A — si coincidieran, sería la señal de que una cartera se coló en la otra.
  const numerosB = await listOwnedLeads(setterB).then((leads) => derivarMisNumeros(leads, setterB))
  const totalDeLosDos = await prisma.osLead.count({
    where: { assignedToId: { in: [setterA, setterB] } },
  })
  expect(
    numeros.enCartera + numerosB.enCartera,
    'las dos carteras PARTICIONAN los leads: ninguna cuenta un lead de la otra',
  ).toBe(totalDeLosDos)
})
