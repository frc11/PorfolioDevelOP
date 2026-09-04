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
import {
  agruparCartera,
  filtrarYOrdenarCartera,
  VISTAS_CARTERA,
  vistaDeLead,
  type HomeLead,
  type VistaCartera,
} from './flow.ts'

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

// ── 6. P22 · El grupo y el filtro homónimo NO pueden divergir ────────────────
// El valor de agrupar depende de que el conteo del encabezado sea el mismo que
// el del filtro: si «En seguimiento 14» abriera 11 tarjetas, el número mentiría.
// No puede pasar porque los dos salen de `vistaDeLead`, y esto lo FIJA: para
// cada vista, el grupo y el filtro traen exactamente los mismos ids.
for (const { vista } of VISTAS_CARTERA) {
  const delGrupo = agruparCartera(filtrarYOrdenarCartera(cartera, '', 'todos', 'urgencia'))
    .filter((g) => g.vista === vista)
    .flatMap((g) => g.leads.map((l) => l.id))
  assert.deepEqual(
    delGrupo,
    idsDe(vista),
    `el grupo «${vista}» y su filtro homónimo traen los mismos leads`,
  )
}

// ── 7. Agrupar no pierde ni duplica ──────────────────────────────────────────
// Un reparto que se come un lead deja al setter sin forma de encontrarlo: no
// está en ningún grupo y la cartera ya no tiene lista plana por defecto.
const ordenada = filtrarYOrdenarCartera(cartera, '', 'todos', 'urgencia')
const repartidos = agruparCartera(ordenada).flatMap((g) => g.leads.map((l) => l.id))
assert.equal(repartidos.length, ordenada.length, 'agrupar no pierde ni duplica leads')
assert.deepEqual(
  [...repartidos].sort(),
  ordenada.map((l) => l.id).sort(),
  'los leads de los grupos son EXACTAMENTE los de la lista',
)

// ── 8. Ningún grupo vacío, y el orden de los grupos es el declarado ──────────
const grupos = agruparCartera(ordenada)
assert.ok(
  grupos.every((g) => g.leads.length > 0),
  'un grupo sin leads no se devuelve: un encabezado «0» es cromo que no orienta',
)
const declarado = VISTAS_CARTERA.map((v) => v.vista as VistaCartera)
assert.deepEqual(
  grupos.map((g) => g.vista),
  declarado.filter((v) => grupos.some((g) => g.vista === v)),
  'los grupos salen en el orden de VISTAS_CARTERA, no en el de llegada de los leads',
)

// ── 9. Cada vista tiene rótulo, y es el que el grupo muestra ─────────────────
// `VISTAS_CARTERA` es la fuente única del filtro Y de los encabezados: si el
// rótulo del grupo no saliera de ahí, las dos superficies podrían nombrar
// distinto a los mismos leads.
const rotulos = new Map(VISTAS_CARTERA.map((v) => [v.vista as VistaCartera, v.label]))
for (const g of grupos) {
  assert.equal(g.label, rotulos.get(g.vista), `el grupo «${g.vista}» usa el rótulo de VISTAS_CARTERA`)
}
assert.ok(
  VISTAS_CARTERA.every((v) => v.label.trim() !== ''),
  'ninguna vista queda sin nombre que el setter pueda leer',
)

// ── 10. SABOTAJE — que el chequeo 6 no pase en verde sobre nada ──────────────
// Un `for` sobre una lista vacía, o un `agruparCartera` que devolviera siempre
// [], darían VERDE sin comparar nada. El piso: la fixture tiene que producir al
// menos tres grupos distintos y no vacíos, y el barrido tiene que haber
// comparado esas mismas vistas.
assert.ok(
  grupos.length >= 3,
  `la fixture tiene que producir al menos 3 grupos para que el barrido compare algo (dio ${grupos.length})`,
)
assert.ok(
  VISTAS_CARTERA.length >= 8,
  `VISTAS_CARTERA quedó corta (${VISTAS_CARTERA.length}): el barrido del chequeo 6 dejaría vistas sin comparar`,
)

console.log('✓ vista-cartera: la pausa personal y la postergación del negocio tienen cada una su filtro')
console.log('✓ vista-cartera: el grupo y el filtro homónimo traen lo mismo; agrupar no pierde leads')
