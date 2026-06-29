/**
 * Chequeo de invariante de la CLASIFICACIÓN del home (D6) — corre sin DB.
 *
 *   npm run check:invariant:flow
 *
 * Verifica, de forma ejecutable (no "es obvio" y no efímero como la verificación
 * en runtime), la garantía central de 2.1b/D6 que la consigna pide constatar:
 *
 *   - POSTERGADO VENCIDO ES ACCIONABLE: un POSTERGADO con `postergadoVencido:true`
 *     (su `reactivateAt` ya pasó — el cron solo notifica, no reactiva) vuelve al
 *     trabajo de AHORA: `grupo:'trabajar'`, `accionable:true`, con el paso "Se
 *     venció la postergación — retomá el contacto".
 *   - POSTERGADO FUTURO NO LO ES: el mismo lead con `postergadoVencido:false`
 *     sigue pausado: `grupo:'seguimiento'`, `accionable:false`, "Postergado — se
 *     retoma cuando se reactive". El único discriminador es el flag de vencimiento.
 *
 * La clasificación es por CLASIFICACIÓN, no por transición: `clasificarLead` NO
 * toca el `status` ni la máquina de estados — el lead sigue siendo POSTERGADO en
 * ambos casos; lo que cambia es la cola y el `accionable` derivados.
 *
 * Importa el módulo puro `flow` directo (relativo, sin `@/`): su árbol de runtime
 * quedó `@/`-free a propósito (ver el header de imports de flow.ts), así que el
 * harness ts-node lo carga sin Neon y sin tsconfig-paths.
 */
import assert from 'node:assert/strict'
import { clasificarLead, type HomeLeadInput } from './flow.ts'

/**
 * Fixture mínimo de un POSTERGADO. `stage:null` a propósito: la rama POSTERGADO
 * de `grupoPara`/`proximaAccionPara` decide antes de mirar el stage, pero un
 * stage EN_REVISION/DESCARTADA se interceptaría antes — null mantiene el caso
 * puro sobre el eje que se está probando (el vencimiento).
 */
function postergado(postergadoVencido: boolean): HomeLeadInput {
  return {
    id: 'cafe-bergamota',
    businessName: 'Café Bergamota',
    industry: 'Gastronomía',
    zone: null,
    status: 'POSTERGADO',
    caliente: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    stage: null,
    ficha: null,
    evaluacion: null,
    ultimoRechazo: null,
    contactos: 1,
    followUpVencido: false,
    postergadoVencido,
    demoEnviada: false,
    pinned: false,
    snoozed: false,
    snoozedUntil: null,
    note: null,
  }
}

// ── 1. POSTERGADO vencido → accionable, vuelve a "trabajar" ──
const vencido = clasificarLead(postergado(true))
assert.equal(vencido.grupo, 'trabajar', 'postergado vencido vuelve al trabajo de ahora')
assert.equal(vencido.accionable, true, 'postergado vencido es accionable')
assert.equal(
  vencido.proximaAccion,
  'Se venció la postergación — retomá el contacto',
  'el paso invita a retomar el contacto',
)
// El status NO cambia: la re-entrada es por clasificación, no por transición.
assert.equal(vencido.status, 'POSTERGADO', 'sigue siendo POSTERGADO (no se tocó la máquina de estados)')

// ── 2. POSTERGADO futuro → NO accionable, sigue en "seguimiento" ──
const futuro = clasificarLead(postergado(false))
assert.equal(futuro.grupo, 'seguimiento', 'postergado futuro sigue pausado')
assert.equal(futuro.accionable, false, 'postergado futuro no es accionable')
assert.equal(
  futuro.proximaAccion,
  'Postergado — se retoma cuando se reactive',
  'el paso dice que espera la reactivación',
)
assert.equal(futuro.status, 'POSTERGADO')
// El string de "vencido" no debe filtrarse al caso futuro.
assert.ok(
  !futuro.proximaAccion.includes('venció'),
  'el paso del futuro no menciona vencimiento',
)

// ── 3. El flag es el ÚNICO discriminador (mismo lead, distinto vencimiento) ──
assert.notEqual(
  vencido.grupo,
  futuro.grupo,
  'el mismo POSTERGADO clasifica distinto solo por postergadoVencido',
)
assert.notEqual(vencido.accionable, futuro.accionable)

console.log(
  '✓ invariante OK: D6 — un POSTERGADO vencido es accionable (vuelve a "trabajar", ' +
    '"retomá el contacto"); uno futuro no (sigue en "seguimiento", espera reactivarse). ' +
    'La re-entrada es por clasificación: el status sigue POSTERGADO en ambos.',
)
