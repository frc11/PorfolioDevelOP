/**
 * Chequeo de invariante de la VISTA de un lead en el filtro de la cartera —
 * corre sin DB.
 *
 *   npm run check:invariant:vista-cartera
 *
 * Lo que protege: la pausa personal del setter y la postergación comercial del
 * lead son DOS conceptos, con dos escrituras distintas y dos alcances distintos:
 *
 *   - pausa personal   → `OsLeadSetterMeta.snoozedUntil` (cartera.actions#pausarLead).
 *     Privada del setter, no toca el lead, el cron no la mira.
 *   - postergación     → `OsLead.status = POSTERGADO` + `reactivateAt`
 *     (os-commercial#postergarLead, vía outreach.actions#registrarResultado).
 *     Global: la ve el admin y el cron os-follow-up avisa cuando se reactiva.
 *
 * Antes de este sprint `vistaDeLead` solo conocía la primera. Un lead postergado
 * caía en `seguimiento` y el ÚNICO filtro que sonaba parecido —«Pausados por
 * vos»— salía vacío: el setter postergaba, iba a buscarlo ahí y leía «0 leads».
 * Acá se fija, de forma ejecutable, que cada filtro contiene lo que su nombre
 * dice, y —lo que es más fácil de romper sin darse cuenta— que el filtro nuevo
 * NO se traga trabajo accionable.
 *
 * Es derivación pura: `vistaDeLead` no toca status, stage ni la máquina de
 * estados — solo decide bajo qué filtro se lo encuentra.
 *
 * Importa el módulo puro `flow` directo (relativo, sin `@/`), como el resto de
 * los invariantes de este árbol: se carga con ts-node sin Neon ni tsconfig-paths.
 */
import assert from 'node:assert/strict'
import { filtrarYOrdenarCartera, vistaDeLead, type HomeLead } from './flow.ts'

/** Fixture de un `HomeLead` YA clasificado (mismo patrón que particion.invariant). */
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

/** Un lead que el NEGOCIO pidió postergar y cuya fecha todavía no llegó. */
const postergado = lead({
  id: 'postergado',
  status: 'POSTERGADO',
  grupo: 'seguimiento',
  accionable: false,
})

/** El mismo lead con la fecha ya vencida: `grupoPara` lo devolvió a `trabajar`. */
const postergadoVencido = lead({
  id: 'postergado-vencido',
  status: 'POSTERGADO',
  postergadoVencido: true,
  grupo: 'trabajar',
})

/** Pausa PERSONAL del setter sobre un lead que por lo demás está para trabajar. */
const pausado = lead({ id: 'pausado', snoozed: true, snoozedUntil: new Date('2099-01-01') })

/** Un lead en seguimiento por la conversación, sin postergación de por medio. */
const enSeguimiento = lead({
  id: 'en-seguimiento',
  grupo: 'seguimiento',
  accionable: false,
})

// ── 1. El postergado tiene su propia vista — NO cae en `seguimiento` ──────────
// Este es el bug que el sprint arregla: el filtro que lo contenía no lo nombraba.
assert.equal(
  vistaDeLead(postergado),
  'postergados',
  'un lead postergado por el negocio se encuentra en su propio filtro',
)

// ── 2. La pausa personal sigue siendo la suya, y gana al resto ────────────────
assert.equal(vistaDeLead(pausado), 'pausados', 'la pausa personal del setter conserva su vista')
assert.equal(
  vistaDeLead(lead({ id: 'ambos', status: 'POSTERGADO', grupo: 'seguimiento', snoozed: true })),
  'pausados',
  'pausado Y postergado: gana la pausa personal — el setter lo busca donde lo escondió',
)

// ── 3. El filtro nuevo NO se traga trabajo accionable ─────────────────────────
// Un POSTERGADO vencido vuelve a ser trabajo de ahora (el cron avisa, no reactiva).
// Si cayera en `postergados`, «Para trabajar» perdería un lead accionable en silencio.
assert.equal(
  vistaDeLead(postergadoVencido),
  'trabajar',
  'el postergado VENCIDO vuelve a `trabajar`: el filtro nuevo no esconde lo accionable',
)

// ── 4. «En seguimiento» conserva lo que sí es seguimiento ─────────────────────
assert.equal(
  vistaDeLead(enSeguimiento),
  'seguimiento',
  'un lead en seguimiento sin postergación sigue en `seguimiento`',
)

// ── 5. De punta a punta: cada filtro devuelve exactamente lo suyo ─────────────
const cartera = [postergado, postergadoVencido, pausado, enSeguimiento]
const idsDe = (estado: Parameters<typeof filtrarYOrdenarCartera>[2]) =>
  filtrarYOrdenarCartera(cartera, '', estado, 'urgencia').map((l) => l.id)

assert.deepEqual(idsDe('postergados'), ['postergado'], 'el filtro «Postergados por el negocio» trae el postergado vigente')
assert.deepEqual(idsDe('pausados'), ['pausado'], 'el filtro «Pausados por vos» trae solo la pausa personal')
assert.deepEqual(idsDe('seguimiento'), ['en-seguimiento'], '«En seguimiento» ya no arrastra al postergado')
assert.deepEqual(idsDe('trabajar'), ['postergado-vencido'], '«Para trabajar» conserva el postergado vencido')
assert.equal(idsDe('todos').length, 4, 'ningún lead queda sin filtro que lo alcance')

console.log('✓ vista-cartera: la pausa personal y la postergación del negocio tienen cada una su filtro')
