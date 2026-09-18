/**
 * P5.2 — Invariante de la vitrina de módulos + demanda medida. Corre SIN DB ni server:
 *
 *   npm run check:invariant:modules
 *   (o: npx tsx src/lib/modules/modules.invariant.ts)
 *
 * Verifica, de forma ejecutable, las garantías del sprint:
 *   1. TRES ESTADOS: el join catálogo × org distingue owned / available / coming_soon.
 *   2. DEMANDA ≠ TENENCIA: un OrganizationModule INACTIVE (lo que crea el CTA de upsell)
 *      NO marca el módulo como contratado; sigue siendo available/coming_soon.
 *   3. ORG-SCOPED / ANTI-IDOR: `buildShowroom` solo mira el mapa de ESA org; lo que otra
 *      org tiene no altera la vitrina (no puede cruzar tenant).
 *   4. RANKING: `rankModuleDemand` agrega bien (orgs distintas, total, última) y ordena
 *      de forma estable y determinista.
 *
 * Importa solo módulos puros (showroom + demand). Cero Neon, cero request context.
 */
import assert from 'node:assert/strict'
import { buildShowroom, classifyModuleState } from './showroom.ts'
import { rankModuleDemand, type ModuleDemandRow } from './demand.ts'
import {
  bloqueDeParentesis,
  cuerpoDeFuncion,
  sinComentarios,
  valorDeClave,
} from '../invariant-call-site.ts'

// ── 1. classifyModuleState: los tres estados, con precedencia de tenencia ─────
{
  // Sin nada en la org: el catálogo manda.
  assert.equal(classifyModuleState('ACTIVE', null), 'available', 'catálogo ACTIVE + sin org → available')
  assert.equal(classifyModuleState('COMING_SOON', null), 'coming_soon', 'catálogo COMING_SOON + sin org → coming_soon')
  assert.equal(classifyModuleState('ACTIVE', undefined), 'available', 'undefined se trata como sin tenencia')

  // Tenencia gana: ACTIVE/PAUSED en la org → owned, aunque el catálogo sea lo que sea.
  assert.equal(classifyModuleState('ACTIVE', 'ACTIVE'), 'owned', 'org ACTIVE → owned')
  assert.equal(classifyModuleState('ACTIVE', 'PAUSED'), 'owned', 'org PAUSED → owned (lo tiene, aunque pausado)')

  // 🔴 DEMANDA ≠ TENENCIA: INACTIVE es una solicitud de upsell registrada, NO contratación.
  assert.equal(classifyModuleState('ACTIVE', 'INACTIVE'), 'available', 'org INACTIVE (demanda) NO es owned → sigue available')
  assert.equal(classifyModuleState('COMING_SOON', 'INACTIVE'), 'coming_soon', 'COMING_SOON con demanda registrada NO se vuelve contratado')

  // CANCELLED: la tuvo y la dio de baja → puede recontratarse, no es tenencia activa.
  assert.equal(classifyModuleState('ACTIVE', 'CANCELLED'), 'available', 'org CANCELLED → available de nuevo, no owned')
}

// ── 2. buildShowroom: agrupa y respeta el orden de entrada ────────────────────
type Mod = { id: string; slug: string; status: 'ACTIVE' | 'COMING_SOON' }
const catalog: Mod[] = [
  { id: 'm1', slug: 'motor-resenas', status: 'ACTIVE' },
  { id: 'm2', slug: 'email-marketing-pro', status: 'ACTIVE' },
  { id: 'm3', slug: 'whatsapp-autopilot', status: 'COMING_SOON' },
  { id: 'm4', slug: 'facturacion-afip', status: 'COMING_SOON' },
]

{
  // Org A: tiene m1 activo, pidió m3 (INACTIVE = demanda).
  const orgA = new Map<string, 'ACTIVE' | 'INACTIVE'>([
    ['m1', 'ACTIVE'],
    ['m3', 'INACTIVE'],
  ])
  const showA = buildShowroom(catalog, orgA)

  assert.deepEqual(showA.owned.map((m) => m.id), ['m1'], 'A: solo m1 es owned')
  assert.deepEqual(showA.available.map((m) => m.id), ['m2'], 'A: m2 available (m1 ya lo tiene)')
  assert.deepEqual(showA.comingSoon.map((m) => m.id), ['m3', 'm4'], 'A: m3 pedido sigue en coming_soon, no contratado')

  // Cada módulo cae en exactamente un grupo (partición sin pérdidas ni duplicados).
  const total = showA.owned.length + showA.available.length + showA.comingSoon.length
  assert.equal(total, catalog.length, 'la vitrina particiona el catálogo completo (sin perder ni duplicar módulos)')
}

// ── 3. ORG-SCOPED / ANTI-IDOR: lo de otra org no altera la vitrina ────────────
{
  const orgA = new Map<string, 'ACTIVE'>([['m1', 'ACTIVE']])
  const orgB = new Map<string, 'ACTIVE'>([['m2', 'ACTIVE']])

  const showA = buildShowroom(catalog, orgA)
  const showB = buildShowroom(catalog, orgB)

  // A tiene m1; B tiene m2. Ninguna ve la tenencia de la otra.
  assert.deepEqual(showA.owned.map((m) => m.id), ['m1'], 'A solo ve SU tenencia (m1)')
  assert.deepEqual(showB.owned.map((m) => m.id), ['m2'], 'B solo ve SU tenencia (m2)')
  assert.ok(!showA.owned.some((m) => m.id === 'm2'), 'A NO ve como owned el módulo de B (no cruza tenant)')
  assert.ok(showA.available.some((m) => m.id === 'm2'), 'para A, el módulo de B es solo "disponible"')

  // Determinismo: mismo catálogo + mismo mapa → mismo resultado.
  assert.deepEqual(buildShowroom(catalog, orgA), showA, 'buildShowroom es determinista')

  // Org vacía (cliente nuevo, sin módulos): nada owned, todo el catálogo se ofrece.
  const showEmpty = buildShowroom(catalog, new Map())
  assert.equal(showEmpty.owned.length, 0, 'org sin módulos → nada owned')
  assert.deepEqual(showEmpty.available.map((m) => m.id), ['m1', 'm2'], 'org sin módulos → ACTIVE disponibles')
  assert.deepEqual(showEmpty.comingSoon.map((m) => m.id), ['m3', 'm4'], 'org sin módulos → COMING_SOON próximamente')
}

// ── 4. rankModuleDemand: agrega y ordena la demanda medida ────────────────────
{
  const d = (iso: string) => new Date(iso)
  const rows: ModuleDemandRow[] = [
    // whatsapp: 2 orgs distintas, 5 solicitudes en total
    { moduleId: 'm3', slug: 'whatsapp-autopilot', name: 'WhatsApp Autopilot', status: 'COMING_SOON', organizationId: 'oA', organizationName: 'Org A', upsellRequestCount: 3, upsellLastRequestedAt: d('2026-06-20T10:00:00Z') },
    { moduleId: 'm3', slug: 'whatsapp-autopilot', name: 'WhatsApp Autopilot', status: 'COMING_SOON', organizationId: 'oB', organizationName: 'Org B', upsellRequestCount: 2, upsellLastRequestedAt: d('2026-06-25T10:00:00Z') },
    // facturacion: 1 org, 9 solicitudes (intensidad alta pero 1 sola org)
    { moduleId: 'm4', slug: 'facturacion-afip', name: 'Facturación AFIP', status: 'COMING_SOON', organizationId: 'oC', organizationName: 'Org C', upsellRequestCount: 9, upsellLastRequestedAt: d('2026-06-28T10:00:00Z') },
  ]

  const ranked = rankModuleDemand(rows)

  // whatsapp primero: 2 orgs > 1 org, aunque facturacion tenga más clicks totales.
  assert.equal(ranked.length, 2, 'dos módulos con demanda')
  assert.equal(ranked[0].slug, 'whatsapp-autopilot', 'ranking por orgs distintas primero (interés ancho > intensidad de uno)')
  assert.equal(ranked[0].distinctOrgs, 2, 'whatsapp: 2 orgs distintas')
  assert.equal(ranked[0].totalRequests, 5, 'whatsapp: 3+2 = 5 solicitudes')
  assert.deepEqual(ranked[0].lastRequestedAt, d('2026-06-25T10:00:00Z'), 'whatsapp: última = la más reciente de sus orgs')
  assert.equal(ranked[1].slug, 'facturacion-afip', 'facturacion segundo (1 sola org)')
  assert.equal(ranked[1].totalRequests, 9, 'facturacion: 9 solicitudes de una org')

  // Orgs dentro del módulo: más reciente primero (oB pidió después que oA).
  assert.deepEqual(ranked[0].organizations.map((o) => o.organizationId), ['oB', 'oA'], 'orgs ordenadas por última solicitud (reciente primero)')

  // Determinismo: mismas filas → mismo ranking.
  assert.deepEqual(rankModuleDemand(rows), ranked, 'rankModuleDemand es determinista')

  // Sin demanda → ranking vacío (no inventa nada).
  assert.deepEqual(rankModuleDemand([]), [], 'sin filas → []')
}

// ── 5. P32 — Y ADEMÁS: la tenencia que alimenta la vitrina sale de una consulta
//    FILTRADA POR ORG ────────────────────────────────────────────────────────
// La sección 3 se llama ANTI-IDOR y no puede fallar. El censo de P26 lo midió: el
// aislamiento lo firma la FIRMA de `buildShowroom`, que recibe el mapa de UNA org
// ya armado. Se le pasa el mapa de A y devuelve lo de A — haga lo que haga por
// dentro. No existe entrada que la haga cruzar tenant, así que ninguna aserción
// sobre ella discrimina: las cuatro de la sección 3 son verdaderas por construcción.
//
// El aislamiento real vive UN NIVEL MÁS ARRIBA, en el `where` de la consulta que
// arma ese mapa. Si ese `where` pierde el `organizationId`, el mapa se llena con
// las filas de todas las organizaciones y la vitrina le muestra a un cliente qué
// módulos contrató cada uno de los otros. Las aserciones de arriba siguen verdes:
// prueban la función, no la consulta.
//
// Es la forma «helper suelto» que P27 cerró para los nueve del aislamiento, con la
// misma herramienta: leer la fuente de la consulta REAL, acotada a su función.
const PAGINA_VITRINA = ['src', 'app', '(protected)', 'dashboard', 'services', 'page.tsx'] as const
const CTX_VITRINA = 'la consulta de tenencia de la vitrina (ServicesPage)'
// `sinComentarios` blanquea los comentarios y deja los literales intactos. Sin él,
// un `// TODO: sumar prisma.organizationModule.updateMany()` entra al bucle como si
// fuera una consulta y el recorte agarra el paréntesis de OTRO código: rojo, pero
// acusando a la consulta equivocada.
const servicesPage = sinComentarios(cuerpoDeFuncion(PAGINA_VITRINA, 'ServicesPage'))

// TODA consulta al modelo de tenencia en esa página, no sólo la que hay hoy: una
// segunda consulta sin filtro, agregada mañana, tiene que caerse acá también.
const MARCA_TENENCIA = 'prisma.organizationModule.'
let consultasDeTenencia = 0
for (
  let i = servicesPage.indexOf(MARCA_TENENCIA);
  i !== -1;
  i = servicesPage.indexOf(MARCA_TENENCIA, i + 1)
) {
  const abre = servicesPage.indexOf('(', i)
  assert.notEqual(
    abre,
    -1,
    `${CTX_VITRINA}: se encontró \`${MARCA_TENENCIA}\` sin ningún paréntesis después. La ` +
      'fuente quedó ilegible para el recorte; arreglalo junto con el cambio en vez de dejar ' +
      'que `bloqueDeParentesis` recorte desde un índice inválido.',
  )
  const llamada = bloqueDeParentesis(servicesPage, abre, CTX_VITRINA)
  // `valorDeClave` recorta el `where:` entero, así que reordenar las claves del
  // objeto o sumarle un `select` no mueve esta aserción — sólo la pierde quien
  // saque el filtro, que es exactamente lo que tiene que doler.
  const where = valorDeClave(llamada, 'where', CTX_VITRINA)
  assert.match(
    where,
    /\borganizationId\b/,
    'una consulta a `organizationModule` en la página de la vitrina dejó de filtrar por\n' +
      '  `organizationId`. Eso es cross-tenant: el mapa de tenencia se arma con las filas de\n' +
      '  TODAS las organizaciones, y la vitrina le muestra a un cliente qué módulos contrató\n' +
      '  cada uno de los otros. La sección 3 de este archivo NO lo ve: le pasa a\n' +
      '  `buildShowroom` un mapa de una sola org escrito a mano, así que su «no cruza tenant»\n' +
      '  es verdadero por construcción. Si la consulta cambió de forma, atá el filtro nuevo\n' +
      '  acá en el mismo commit.',
  )
  consultasDeTenencia += 1
}

// Piso de descubrimiento: sin esto, mudar o renombrar la consulta deja el bucle
// recorriendo cero y la sección entera sale verde sobre nada — el mismo modo de
// fallar que el guard de cuenta de `run-invariants` ya documentó.
assert.ok(
  consultasDeTenencia >= 1,
  'no se encontró ninguna consulta a `organizationModule` en `ServicesPage`. La vitrina la\n' +
    '  necesita para distinguir «ya lo tenés» de «disponible para contratar»: si se mudó a\n' +
    '  otra función o a otro archivo, se llevó el filtro de org con ella y este chequeo dejó\n' +
    '  de mirarlo. Apuntá `PAGINA_VITRINA` al lugar nuevo en el mismo commit.',
)

console.log(
  '✓ modules invariants OK: tres estados (owned/available/coming_soon), demanda (INACTIVE) ' +
    '≠ tenencia, vitrina org-scoped que no cruza tenant, y ranking de demanda determinista.',
)
