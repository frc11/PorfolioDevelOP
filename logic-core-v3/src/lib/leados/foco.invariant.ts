/**
 * Chequeo de invariante del FOCO (sticky D7) — corre sin DB.
 *
 *   npm run check:invariant:foco
 *
 * Verifica, de forma ejecutable (no "es obvio"), las garantías que el sprint 2.1a
 * promete y que la consigna pide constatar (a–d, g):
 *
 *   - CALIENTE PRIMERO (d): sin sticky, el foco es la cima de la cola `trabajar`
 *     (que ya viene ordenada respondió → caliente → resto por `ordenUrgencia`).
 *   - STICKY SOSTIENE (c): con un lead anclado, entra uno más urgente y NO te
 *     saca — el más urgente aparece como `proximo`, el foco sigue siendo el tuyo.
 *   - INVALIDACIÓN POR CONSTRUCCIÓN: si el lead anclado ya no está en la cola
 *     (cerrado/perdido/reasignado/avanzó), el sticky se ignora y el foco recae en
 *     la cima — sin escribir cookies en el render.
 *   - "TODO EN ESPERA" (semilla de 2.1b): cola vacía → foco null (la pantalla
 *     distinta la arma 2.1b; acá basta con que la selección no rompa).
 *
 * Importa solo el módulo puro `foco` — cero Neon y cero `@/` en runtime.
 */
import assert from 'node:assert/strict'
import { seleccionarFoco } from './foco.ts'
import type { HomeLead } from './flow.ts'

/** Fixture tipado mínimo: `seleccionarFoco` solo mira `id` y la posición. */
function lead(id: string): HomeLead {
  return {
    id,
    businessName: id,
    industry: null,
    zone: null,
    status: 'PROSPECTO',
    caliente: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    stage: null,
    ficha: null,
    evaluacion: null,
    ultimoRechazo: null,
    contactos: 0,
    followUpVencido: false,
    postergadoVencido: false,
    demoEnviada: false,
    pinned: false,
    snoozed: false,
    snoozedUntil: null,
    note: null,
    score: null,
    gateAbierto: false,
    grupo: 'trabajar',
    proximaAccion: 'Hacer algo',
    accionable: true,
  }
}

// La cola `trabajar` ya ordenada: A es la cima (lo más urgente), luego B, C.
const ORDEN = [lead('A'), lead('B'), lead('C')] as const

// ── 1. Cola vacía: foco null, sin romper (semilla del "todo en espera" de 2.1b) ──
const vacio = seleccionarFoco([], null)
assert.equal(vacio.foco, null, 'cola vacía → no hay foco')
assert.equal(vacio.proximo, null)
assert.equal(vacio.total, 0)
assert.equal(vacio.restantes, 0)
assert.equal(vacio.stickyActivo, false)

// ── 2. Sin sticky → caliente/cima primero (d) ──
const sinSticky = seleccionarFoco(ORDEN, null)
assert.equal(sinSticky.foco?.id, 'A', 'sin sticky, el foco es la cima de la cola (lo más urgente)')
assert.equal(sinSticky.proximo?.id, 'B', 'el próximo es el segundo de la cola')
assert.equal(sinSticky.total, 3)
assert.equal(sinSticky.restantes, 2)
assert.equal(sinSticky.stickyActivo, false)

// ── 3. Sticky en un lead NO-cima → te lo sostiene; el más urgente es "próximo" (c) ──
// El setter está trabajando B. Aunque A sea más urgente, B sigue siendo el foco y
// A aparece como lo próximo — NO te saca de lo que estás trabajando.
const anclaB = seleccionarFoco(ORDEN, 'B')
assert.equal(anclaB.foco?.id, 'B', 'el sticky sostiene el lead que estás trabajando')
assert.equal(anclaB.proximo?.id, 'A', 'el más urgente aparece como próximo, no desplaza al anclado')
assert.equal(anclaB.stickyActivo, true)
assert.equal(anclaB.restantes, 2)

// ── 4. Sticky en la cima → coincide con el orden natural ──
const anclaA = seleccionarFoco(ORDEN, 'A')
assert.equal(anclaA.foco?.id, 'A')
assert.equal(anclaA.proximo?.id, 'B')
assert.equal(anclaA.stickyActivo, true)

// ── 5. Sticky inválido (id que ya no está en la cola) → se ignora, foco a la cima ──
// Simula que el lead anclado se cerró/perdió/reasignó o avanzó de etapa: ya no
// está en `trabajar`. La invalidación es por construcción, sin tocar cookies.
const anclaFantasma = seleccionarFoco(ORDEN, 'Z-ya-no-existe')
assert.equal(anclaFantasma.foco?.id, 'A', 'sticky inválido se ignora → foco recae en la cima')
assert.equal(anclaFantasma.stickyActivo, false, 'sticky inválido no cuenta como activo')

// ── 6. Único accionable + sticky en él → foco él, sin próximo ──
const unico = seleccionarFoco([lead('solo')], 'solo')
assert.equal(unico.foco?.id, 'solo')
assert.equal(unico.proximo, null, 'no hay próximo cuando solo queda uno')
assert.equal(unico.restantes, 0)
assert.equal(unico.stickyActivo, true)

console.log(
  '✓ invariante OK: foco secuenciado + sticky (D7). Sin sticky → cima/caliente ' +
    'primero; con sticky → te sostiene el lead que trabajás y el más urgente cae ' +
    'como próximo; sticky inválido se ignora (invalidación por construcción).',
)
