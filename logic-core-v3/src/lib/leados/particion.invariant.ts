/**
 * Chequeo de invariante de la PARTICIÓN de la cartera (A-05 — el pin ordena el
 * foco, no lo excluye) — corre sin DB.
 *
 *   npm run check:invariant:particion
 *
 * Verifica, de forma ejecutable (no "es obvio" y no efímero como la verificación
 * en runtime), la garantía que Sprint 6.1 promete y que el brief §4 pide: fijar
 * un lead NUNCA deja el foco falsamente vacío. Antes (2.1a) `particionarCartera`
 * sacaba al fijado de la cola `trabajar` → un fijado accionable quedaba EXCLUIDO
 * del foco y, si era la única accionable, el home caía en "todo en espera".
 *
 *   - FIJADO ACCIONABLE = FOCO (cima): un fijado en `trabajar` entra a la cola
 *     `trabajar` y sube a la cima — por encima de uno más urgente pero no fijado.
 *     NO cae en `fijados`.
 *   - NUNCA FALSAMENTE VACÍO: un único fijado accionable deja `grupos.trabajar`
 *     con ese lead (hay foco), `fijados` vacío.
 *   - EL PIN NO FABRICA ACCIONABILIDAD: un fijado NO accionable (en vuelo) sigue
 *     en `fijados`, fuera de `trabajar` — el "todo en espera" que muestre es
 *     honesto (no hay nada para hacer ahora).
 *   - PAUSA GANA AL PIN PARA EL FOCO: un fijado + pausado (snooze vigente) NO
 *     salta al foco — cae en `fijados`, jamás en `trabajar` (un lead que el setter
 *     escondió no debe aparecer como protagonista).
 *   - RÓTULO HONESTO: `motivoOrden` del fijado-foco dice "Fijado por vos — va
 *     primero" (no su tier de urgencia, que mentiría sobre por qué está arriba).
 *
 * Es derivación, no motor: `particionarCartera` NO toca `status`/stages ni la
 * máquina de estados — solo dónde cae el lead en la cola y en qué orden.
 *
 * Importa el módulo puro `flow` directo (relativo, sin `@/`): su árbol de runtime
 * quedó `@/`-free a propósito (ver el header de imports de flow.ts), así que el
 * harness ts-node lo carga sin Neon y sin tsconfig-paths.
 */
import assert from 'node:assert/strict'
import { motivoOrden, particionarCartera, type HomeLead } from './flow.ts'

/**
 * Fixture de un `HomeLead` YA clasificado (`particionarCartera` opera sobre la
 * salida de `clasificarLead`): solo miran `grupo`, `pinned`, `snoozed`, `status`,
 * `caliente` y `createdAt`. Los overrides fijan el eje que se prueba.
 */
function lead(overrides: Partial<HomeLead> & { id: string }): HomeLead {
  return {
    businessName: overrides.id,
    industry: null,
    zone: null,
    status: 'PROSPECTO',
    caliente: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    stage: null,
    ficha: null,
    evaluacion: null,
    ultimoRechazo: null,
    agenda: null,
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
    ...overrides,
  }
}

// ── 1. Fijado accionable → cima de `trabajar`, por encima de uno más urgente ──
// A: respondió (tier 0, lo más urgente por urgencia) pero NO fijado.
// B: prospecto frío (tier 2) pero FIJADO. El pin manda: B va primero.
const urgentA = lead({ id: 'A-respondio', status: 'RESPONDIO' })
const fijadoB = lead({ id: 'B-fijado', status: 'PROSPECTO', pinned: true })
const mezcla = particionarCartera([urgentA, fijadoB])
assert.equal(mezcla.grupos.trabajar.length, 2, 'el fijado accionable entra a `trabajar`, no se excluye')
assert.equal(mezcla.grupos.trabajar[0].id, 'B-fijado', 'el fijado sube a la cima, por encima del más urgente')
assert.equal(mezcla.grupos.trabajar[1].id, 'A-respondio', 'el no-fijado queda debajo, en su orden de urgencia')
assert.equal(mezcla.fijados.length, 0, 'el fijado accionable YA no cae en `fijados`')

// ── 2. Único fijado accionable → hay foco (nunca falsamente vacío) ──
const soloFijado = particionarCartera([lead({ id: 'solo', pinned: true })])
assert.equal(soloFijado.grupos.trabajar.length, 1, 'un solo fijado accionable deja foco en `trabajar`')
assert.equal(soloFijado.grupos.trabajar[0].id, 'solo')
assert.equal(soloFijado.fijados.length, 0, 'no hay `fijados` que lo escondan del foco')

// ── 3. El pin NO fabrica accionabilidad: fijado en vuelo sigue en `fijados` ──
const fijadoEnVuelo = lead({ id: 'seg', grupo: 'seguimiento', accionable: false, pinned: true })
const enVuelo = particionarCartera([fijadoEnVuelo])
assert.equal(enVuelo.fijados.length, 1, 'el fijado NO accionable flota aparte, no se mete al foco')
assert.equal(enVuelo.grupos.trabajar.length, 0, 'no aparece un foco inventado en `trabajar`')
assert.equal(enVuelo.grupos.seguimiento.length, 0, 'el fijado no accionable sale de su cola natural (va a `fijados`)')

// ── 4. Fijado + pausado NO salta al foco (la pausa gana al pin para el foco) ──
const fijadoPausado = lead({ id: 'fijado-pausado', pinned: true, snoozed: true })
const pausado = particionarCartera([fijadoPausado])
assert.equal(pausado.grupos.trabajar.length, 0, 'un lead pausado nunca es foco, aunque esté fijado')
assert.equal(pausado.fijados.length, 1, 'fijado+pausado cae en `fijados` (precedencia pin>snooze preservada)')

// ── 5. `motivoOrden` del fijado-foco es honesto ──
assert.equal(
  motivoOrden(mezcla.grupos.trabajar[0]),
  'Fijado por vos — va primero',
  'el rótulo del fijado-foco explica el pin, no su tier de urgencia',
)
assert.equal(
  motivoOrden(mezcla.grupos.trabajar[1]),
  'Respondió — va primero',
  'el no-fijado conserva su rótulo de urgencia',
)
assert.equal(
  motivoOrden(fijadoEnVuelo),
  null,
  'un fijado fuera de `trabajar` no muestra rótulo de orden',
)

console.log(
  '✓ invariante OK: A-05 — el pin ordena el foco, no lo excluye. Un fijado ' +
    'accionable sube a la cima de `trabajar` (nunca deja el foco falsamente vacío); ' +
    'un fijado en vuelo o pausado sigue aparte en `fijados`, sin inventar foco. ' +
    'Es derivación (cola + orden), no motor (status/stages intactos).',
)
