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
  'el rótulo del fijado-foco explica el pin, no su tier de trabajo',
)
// P8: A-respondio no tiene dossier (stage null) → sin veredicto. Que haya
// respondido ya NO lo sube: el rótulo nombra lo que falta, no el contacto.
assert.equal(
  motivoOrden(mezcla.grupos.trabajar[1]),
  'Todavía no sabés si sirve — evalualo',
  'el no-fijado muestra su tier de TRABAJO, no el viejo "Respondió — va primero"',
)
assert.equal(
  motivoOrden(fijadoEnVuelo),
  null,
  'un fijado fuera de `trabajar` no muestra rótulo de orden',
)

// ── P8: el foco prioriza CONSTRUIR, no contactar ─────────────────────────────
// El criterio nuevo se verifica por la superficie pública (el orden que sale de
// `particionarCartera` y el rótulo de `motivoOrden`), no por el tier interno.

/** Los cinco tiers, cada uno en su estado mínimo, cargados en desorden. */
const construir = lead({ id: 'construir', stage: 'CONSTRUCCION' })
const esperaTuAccion = lead({ id: 'espera', stage: 'RECHAZADA' })
const contactarConDemo = lead({ id: 'con-demo', stage: 'APROBADA' })
const evaluarNuevo = lead({ id: 'evaluar', stage: 'FICHA' })
const contactoSinDemo = lead({ id: 'sin-demo', stage: 'EVALUADA', gateAbierto: false })

const colaP8 = particionarCartera([
  contactoSinDemo,
  evaluarNuevo,
  contactarConDemo,
  esperaTuAccion,
  construir,
])
assert.deepEqual(
  colaP8.grupos.trabajar.map((l) => l.id),
  ['construir', 'espera', 'con-demo', 'evaluar', 'sin-demo'],
  'el orden del foco es construir → espera tu acción → contactar con demo → evaluar → contacto sin demo',
)

// ── P8.a — construir le gana al contacto, aunque el contacto sea "más urgente" ──
// El caso exacto que el sprint viene a arreglar: con el criterio viejo
// (respondió → caliente → resto) el prospecto caliente sin evaluar era la cima y
// la demo a medio construir quedaba última.
const calienteSinEvaluar = lead({ id: 'caliente-crudo', caliente: true, stage: null })
const demoFria = lead({ id: 'demo-fria', stage: 'CONSTRUCCION', status: 'PROSPECTO' })
const duelo = particionarCartera([calienteSinEvaluar, demoFria])
assert.equal(
  duelo.grupos.trabajar[0].id,
  'demo-fria',
  'la demo a medio construir es el foco, por encima del caliente sin evaluar',
)

// ── P8.b — RESTRICCIÓN DEL PREMORTEM: nunca construir sin veredicto ──
// Ni caliente, ni respondió, ni fijado hacen que un lead sin evaluar se sugiera
// para construir: cada demo son 30 minutos y hacerla para quien no califica es la
// forma más cara de perder el día. Se barre TODO el eje de un lead sin dossier.
const ROTULO_CONSTRUIR = 'Pasó el filtro y le falta la demo — construila'
for (const sinVeredicto of [null, 'FICHA'] as const) {
  for (const caliente of [false, true]) {
    for (const status of ['PROSPECTO', 'RESPONDIO'] as const) {
      for (const pinned of [false, true]) {
        const crudo = lead({
          id: `crudo-${sinVeredicto}-${caliente}-${status}-${pinned}`,
          stage: sinVeredicto,
          caliente,
          status,
          pinned,
          // gateAbierto:true es lo que abre el brief en EVALUADA — acá NO hay
          // veredicto, así que ni siquiera con el gate abierto se sugiere construir.
          gateAbierto: true,
        })
        assert.notEqual(
          motivoOrden(crudo),
          ROTULO_CONSTRUIR,
          `un lead sin veredicto jamás se sugiere para construir (${crudo.id})`,
        )
      }
    }
  }
}
// Y el que SÍ pasó el veredicto sí lo dice — la garantía no es "nunca construir".
assert.equal(
  motivoOrden(construir),
  ROTULO_CONSTRUIR,
  'el lead que pasó la evaluación sí se sugiere para construir',
)

// ── P8.c — el gate manda: EVALUADA con el brief cerrado NO se manda a construir ──
// `gateBriefAbierto` (respondió || caliente) es gate, no presentación: el foco
// ordena dentro de lo que permite, nunca contra él.
assert.equal(
  motivoOrden(contactoSinDemo),
  'Todavía no hay demo que mostrar',
  'con el brief bloqueado por el gate, el foco no manda a construir',
)
assert.equal(
  motivoOrden(lead({ id: 'evaluada-abierta', stage: 'EVALUADA', gateAbierto: true })),
  ROTULO_CONSTRUIR,
  'la misma EVALUADA con el gate abierto sí se manda a construir',
)

// ── P8.d — el pin sigue ganando al criterio nuevo (no se regresa A-05) ──
const fijadoUltimoTier = lead({ id: 'fijado-sin-demo', stage: 'EVALUADA', pinned: true })
const dueloPin = particionarCartera([construir, fijadoUltimoTier])
assert.equal(
  dueloPin.grupos.trabajar[0].id,
  'fijado-sin-demo',
  'el pin sigue siendo el tier de más peso: gana incluso al tier de construir',
)

// ── P8.e — ningún estado accionable queda sin lugar ni sin rótulo ──
// Todo lead de `trabajar` cae en algún tier y tiene rótulo: nadie queda mudo.
for (const l of colaP8.grupos.trabajar) {
  assert.ok(motivoOrden(l), `todo lead de la cola tiene rótulo de orden (${l.id})`)
}

console.log(
  '✓ invariante OK: A-05 — el pin ordena el foco, no lo excluye (un fijado ' +
    'accionable sube a la cima y nunca deja el foco falsamente vacío; uno en vuelo ' +
    'o pausado sigue aparte). P8 — el foco prioriza CONSTRUIR: construir → espera ' +
    'tu acción → contactar con demo → evaluar → contacto sin demo, y un lead SIN ' +
    'VEREDICTO jamás se sugiere para construir (barrido de todo el eje: caliente, ' +
    'respondió, fijado, gate abierto). Es derivación (cola + orden + rótulo), no ' +
    'motor: status/stages y el gate del brief intactos.',
)
