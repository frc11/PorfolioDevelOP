import { test, expect } from '@playwright/test'
import {
  prisma,
  createLead,
  createSetter,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'
// La cadena REAL del panel (`setter/page.tsx`), no una réplica: el alias `@/`
// resuelve en el runner y ninguno de estos módulos arrastra next/headers.
import { listOwnedLeads } from '../../src/lib/leados/ownership'
import { buildHomeLeads } from '../../src/lib/leados/home'
import { filtrarYOrdenarCartera, particionarCartera } from '../../src/lib/leados/flow'
import { seleccionarFoco } from '../../src/lib/leados/foco'
import { armarCola, idsEnCola, TOPE_COLA } from '../../src/lib/leados/cola'

/**
 * P37 — LA COLA ORDENA POR URGENCIA, Y LA DE UN SETTER NO MUESTRA LEADS DE OTRO.
 *
 * El orden: seis leads para construir, fríos y más viejos, y una demo aprobada
 * cuyo negocio respondió. Con la clase de trabajo como criterio primario (P8) la
 * demo caía en la fila 8 y la cola de TOPE_COLA no la mostraba: el defecto que
 * midió P36. Con la urgencia va segunda, debajo del fijado.
 *
 * El aislamiento tiene que fallar POR SU ASERTO, no por el tope. Por eso el lead
 * ajeno es el más urgente de TODA la base (respondió, caliente, creado en el año
 * 2000): si la consulta dejara de filtrar por setter, caería en la fila 2 —
 * adentro de la cola visible— y el aserto que lo nombra sería el que se pone rojo.
 * Un lead ajeno cualquiera podría quedar escondido debajo del tope y el test
 * pasaría con el aislamiento roto.
 *
 * Datos namespaced (SMOKE-SETTER) + setters propios + teardown por id exacto.
 */

const tracker: SmokeTracker = newTracker()
let setterA: string
let setterB: string
const construirDeA: string[] = []
let demoListaDeA: string
let fijadoDeA: string
let ajenoUrgenteDeB: string

async function fechar(leadId: string, createdAt: Date): Promise<void> {
  await prisma.osLead.update({ where: { id: leadId }, data: { createdAt } })
}

/** La cola exactamente como la arma el panel, sin sticky. */
async function colaDelPanel(setterId: string) {
  const home = buildHomeLeads(await listOwnedLeads(setterId))
  const orden = particionarCartera(home).grupos.trabajar
  const seleccion = seleccionarFoco(orden, null)
  return { home, orden, cola: armarCola(seleccion.foco, seleccion.resto, TOPE_COLA) }
}

test.beforeAll(async () => {
  setterA = (await createSetter(tracker, 'cola-urg-a')).id
  setterB = (await createSetter(tracker, 'cola-urg-b')).id

  for (let i = 0; i < 6; i += 1) {
    const l = await createLead(tracker, { setterId: setterA, businessName: `ColaUrg Construir ${i}`, stage: 'CONSTRUCCION', status: 'PROSPECTO' })
    await fechar(l.id, new Date(Date.UTC(2026, 0, 1 + i)))
    construirDeA.push(l.id)
  }
  const demo = await createLead(tracker, { setterId: setterA, businessName: 'ColaUrg Demo Lista', stage: 'APROBADA', status: 'RESPONDIO' })
  await fechar(demo.id, new Date('2026-03-01T00:00:00.000Z'))
  demoListaDeA = demo.id

  // Fijado, frío y el más nuevo: si igual va primero, el pin le gana a la urgencia.
  const fijado = await createLead(tracker, {
    setterId: setterA,
    businessName: 'ColaUrg Fijado',
    stage: 'CONSTRUCCION',
    status: 'PROSPECTO',
    meta: { pinned: true },
  })
  await fechar(fijado.id, new Date('2026-04-01T00:00:00.000Z'))
  fijadoDeA = fijado.id

  const ajeno = await createLead(tracker, { setterId: setterB, businessName: 'ColaUrg Ajeno Urgente', stage: 'APROBADA', status: 'RESPONDIO' })
  await prisma.osLead.update({ where: { id: ajeno.id }, data: { caliente: true, createdAt: new Date('2000-01-01T00:00:00.000Z') } })
  ajenoUrgenteDeB = ajeno.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('P37-1 · la cola ordena por urgencia: la demo lista entra aunque haya seis para construir más viejos', async () => {
  const { orden, cola } = await colaDelPanel(setterA)

  // Precondición: los ocho son accionables. Sin esto el orden no prueba nada.
  expect(orden, 'los ocho leads de A están para trabajar').toHaveLength(8)

  expect(
    idsEnCola(cola),
    `la demo aprobada con el negocio respondiendo entra en la cola de ${TOPE_COLA} (con el nivel como criterio caía en la fila 8)`,
  ).toContain(demoListaDeA)
  expect(cola.items[0].lead.id, 'el fijado sigue primero, aunque sea frío y el más nuevo').toBe(fijadoDeA)
  expect(cola.items[1].lead.id, 'la demo lista va inmediatamente debajo del fijado').toBe(demoListaDeA)
  expect(
    cola.items.slice(2).map((i) => i.lead.id),
    'y los de construir siguen, del más viejo al más nuevo',
  ).toEqual(construirDeA.slice(0, TOPE_COLA - 2))

  // Una sola fuente: la cola es la cartera en orden «urgencia», lead por lead.
  const home = buildHomeLeads(await listOwnedLeads(setterA))
  const cartera = filtrarYOrdenarCartera(home.filter((l) => l.grupo === 'trabajar'), '', 'todos', 'urgencia')
  expect(orden.map((l) => l.id), 'la cola del panel y la cartera ordenan igual').toEqual(cartera.map((l) => l.id))
})

test('P37-2 · la cola de un setter no muestra leads de otro, aunque el ajeno sea el más urgente de la base', async () => {
  const deA = await colaDelPanel(setterA)

  // EL ASERTO, primero: nada de conteos antes, para que un aislamiento roto no
  // se ponga rojo por otra razón.
  const filaDelAjeno = deA.orden.findIndex((l) => l.id === ajenoUrgenteDeB) + 1
  expect(
    idsEnCola(deA.cola),
    `la cola visible de A no contiene el lead de B (si entrara, estaría en la fila ${filaDelAjeno}, adentro del tope de ${TOPE_COLA})`,
  ).not.toContain(ajenoUrgenteDeB)
  expect(deA.orden.map((l) => l.id), 'y tampoco lo tiene entre los ocultos').not.toContain(ajenoUrgenteDeB)

  const idsDeA = new Set([...construirDeA, demoListaDeA, fijadoDeA])
  expect(deA.home.every((l) => idsDeA.has(l.id)), 'la cartera de A es exactamente lo de A').toBe(true)
  expect(deA.cola.total, 'el total de la cola cuenta solo lo de A').toBe(8)

  const deB = await colaDelPanel(setterB)
  expect(idsEnCola(deB.cola), 'la cola de B es su único lead, sin nada de A').toEqual([ajenoUrgenteDeB])
})
