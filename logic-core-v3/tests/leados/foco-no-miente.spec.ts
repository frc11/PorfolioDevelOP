import { test, expect } from '@playwright/test'
import {
  createSetter,
  createLead,
  getLead,
  newTracker,
  prisma,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'
// Cadena REAL bajo prueba (NO se toca: se TESTEA). Ninguno arrastra next/headers.
//  - `registrarContactoComercial` = la maquinaria comercial compartida (lo MISMO
//    que llaman las actions del setter DESPUÉS del guard de ownership).
//  - lectura por el camino owned del setter: `listOwnedLeads(setterId)` filtra por
//    `assignedToId` → jamás se saltea el aislamiento.
import { registrarContactoComercial } from '../../src/lib/os-commercial'
import { listOwnedLeads } from '../../src/lib/leados/ownership'
import { buildHomeLeads } from '../../src/lib/leados/home'

/**
 * Sprint 2.1 — EL FOCO NO MIENTE: los tres loops que hacían que el foco sirviera
 * leads muertos como trabajo tienen que cortarse.
 *
 *  - A (cadencia agotada / C-02): 4 SIN_RESPUESTA seguidos → el próximo toque se
 *    limpia (`nextFollowUpAt` null); el lead NO cae en «trabajar» y aparece en
 *    «seguimiento» como pasivo («se enfría»), no como toque pendiente.
 *  - B (postergado vencido / B-01): registrar un contacto de retomar limpia el
 *    vencimiento (`reactivateAt` null) → el lead deja de servirse como trabajo.
 *  - C (rechazado / C-11): un RECHAZADO limpia el toque agendado → deja de generar
 *    el CTA de toque eterno y queda en el mismo estado pasivo visible.
 *
 * Patrón in-process (espejo de envio-demo-rechazo.spec): se ejerce la maquinaria
 * real contra la DB, y se LEE por `listOwnedLeads` (owned) → `buildHomeLeads`, el
 * mismo camino que arma el home del setter. Sin acceso privilegiado que saltee el
 * ownership.
 */

const DIA_MS = 24 * 60 * 60 * 1000

const tracker: SmokeTracker = newTracker()
let setterId: string

test.beforeAll(async () => {
  const setter = await createSetter(tracker, 'foco-no-miente')
  setterId = setter.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/** El lead ya clasificado, leído por el camino owned del setter (aislado). */
async function homeLead(leadId: string) {
  const owned = await listOwnedLeads(setterId)
  const home = buildHomeLeads(owned)
  const lead = home.find((l) => l.id === leadId)
  expect(lead, 'el lead aparece en el home owned del setter').toBeTruthy()
  return lead!
}

/** Un toque real por la maquinaria compartida (lo que corre la action tras el guard). */
async function registrarToque(
  leadId: string,
  result: 'SIN_RESPUESTA' | 'RECHAZADO',
): Promise<void> {
  await registrarContactoComercial({
    leadId,
    channel: 'INSTAGRAM_DM',
    result,
    performedById: setterId,
  })
}

test('A — cadencia agotada: 4 SIN_RESPUESTA limpian el toque y el lead se enfría (no es trabajo)', async () => {
  // EVALUADA + PROSPECTO frío = gate cerrado → fase de outreach (opener + toques).
  const lead = await createLead(tracker, {
    setterId,
    businessName: 'FocoCadenciaAgotada',
    stage: 'EVALUADA',
    status: 'PROSPECTO',
  })

  // Opener + 3 toques = 4 SIN_RESPUESTA: al 4º, calculateNextFollowUp(4) === null.
  for (let i = 0; i < 4; i++) {
    await registrarToque(lead.id, 'SIN_RESPUESTA')
  }

  // El vencimiento se LIMPIA (antes quedaba el date del 3º toque, luego vencido →
  // followUpVencido eterno → «trabajar» para siempre).
  const fila = await getLead(lead.id)
  expect(fila?.nextFollowUpAt, 'cadencia agotada limpia el próximo toque').toBeNull()

  // Presentación: seguimiento pasivo, jamás «trabajar», jamás un CTA de toque.
  const hl = await homeLead(lead.id)
  expect(hl.grupo, 'la cadencia agotada NO es trabajo de ahora').not.toBe('trabajar')
  expect(hl.grupo, 'aparece en seguimiento (presencia, no solo ausencia)').toBe('seguimiento')
  expect(hl.accionable, 'no es accionable — el cierre lo decide Franco').toBe(false)
  expect(hl.proximaAccion, 'rótulo de enfriamiento, no de toque').toContain('Se enfría')
})

test('B — postergado vencido: registrar el retomar limpia el vencimiento y sale de trabajar', async () => {
  const lead = await createLead(tracker, {
    setterId,
    businessName: 'FocoPostergadoVencido',
    stage: 'EVALUADA',
    status: 'POSTERGADO',
  })
  // Vencimiento en el pasado (setup de test a nivel datos, legítimo): así el
  // postergado ya venció y hoy se sirve como trabajo («retomá el contacto»).
  await prisma.osLead.update({
    where: { id: lead.id },
    data: { reactivateAt: new Date(Date.now() - DIA_MS) },
  })

  // Pre-condición del loop: vencido → hoy es trabajo.
  const antes = await homeLead(lead.id)
  expect(antes.grupo, 'el postergado vencido hoy se sirve como trabajo').toBe('trabajar')

  // El setter retoma el contacto (no respondió): la maquinaria registra el toque.
  await registrarToque(lead.id, 'SIN_RESPUESTA')

  // El vencimiento se limpia → deja de servirse como trabajo.
  const fila = await getLead(lead.id)
  expect(fila?.reactivateAt, 'retomar limpia el vencimiento').toBeNull()

  const hl = await homeLead(lead.id)
  expect(hl.grupo, 'ya no se repite como trabajo («retomá el contacto» eterno)').not.toBe('trabajar')
})

test('C — rechazado: limpia el toque agendado y queda pasivo visible, no vuelve a trabajar', async () => {
  const lead = await createLead(tracker, {
    setterId,
    businessName: 'FocoRechazado',
    stage: 'EVALUADA',
    status: 'PROSPECTO',
  })

  // Opener (arma un follow-up futuro) y después el negocio rechaza.
  await registrarToque(lead.id, 'SIN_RESPUESTA')
  await registrarToque(lead.id, 'RECHAZADO')

  // El RECHAZADO limpia el toque agendado (antes quedaba y, al vencer, generaba el
  // CTA de toque eterno).
  const fila = await getLead(lead.id)
  expect(fila?.nextFollowUpAt, 'un rechazado no deja toque agendado').toBeNull()

  const hl = await homeLead(lead.id)
  expect(hl.grupo, 'el rechazado no vuelve a trabajar').not.toBe('trabajar')
  expect(hl.grupo, 'queda pasivo visible en seguimiento').toBe('seguimiento')
  expect(hl.accionable, 'no genera un toque para mandar').toBe(false)
})
