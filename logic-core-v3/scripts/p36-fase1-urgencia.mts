/**
 * P36 · Fase 1 — LA OPCION BARATA: alcanza el criterio de urgencia que la
 * cartera YA usa, sin construir el mecanismo nuevo?
 *
 * No re-deriva NADA. Las dos colas se arman con las mismas funciones que el
 * producto usa en el panel:
 *   - cola ACTUAL   : particionarCartera (aplica ordenFoco) -> seleccionarFoco -> armarCola
 *   - cola URGENCIA : filtrarYOrdenarCartera(..., 'urgencia') -> seleccionarFoco -> armarCola
 * filtrarYOrdenarCartera es literalmente la funcion de la cartera
 * (cartera-view.tsx default 'urgencia'): pin || ordenUrgencia.
 *
 * El tier se lee por motivoOrden (traduccion 1:1 de trabajoTier, switch
 * exhaustivo) — igual que la medicion de Fase 1 previa.
 *
 * Uso: npx tsx scripts/p36-fase1-urgencia.mts
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const DEV_BRANCH_HOST = 'ep-quiet-waterfall-acv0fpll'
if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

/**
 * Criterio de ARTEFACTO — escrito, no implicito. Dos cortes, los dos declarados:
 *
 *  ESTRICTO: cualquier prefijo de siembra (incluye las semillas QA-* curadas a
 *            mano para los estados del manual).
 *  CORRIDA : solo lo que dejo una corrida AUTOMATICA. El discriminador es
 *            objetivo, no una lista: las suites nombran con Date.now(), asi que
 *            un timestamp de 13 digitos en el nombre delata la siembra. Las
 *            semillas curadas no lo tienen. Es el corte que uso la medicion
 *            previa (da 28 leads).
 */
const PREFIJOS_ARTEFACTO = ['SMOKE-SETTER', 'M0-GAL', 'CORRIDA', 'QA-W', 'QA-B', 'SEED-']
const esArtefacto = (nombre: string) =>
  PREFIJOS_ARTEFACTO.some((p) => nombre.toUpperCase().startsWith(p))
/** Timestamp de 13 digitos = lo sembro una corrida automatica. */
const esDeCorrida = (nombre: string) => /\d{13}/.test(nombre)

async function main() {
  const { prisma } = await import('@/lib/prisma')
  const { listOwnedLeads } = await import('@/lib/leados/ownership')
  const { buildHomeLeads } = await import('@/lib/leados/home')
  const { particionarCartera, motivoOrden, filtrarYOrdenarCartera } = await import(
    '@/lib/leados/flow'
  )
  const { seleccionarFoco } = await import('@/lib/leados/foco')
  const { armarCola, TOPE_COLA } = await import('@/lib/leados/cola')
  type HL = ReturnType<typeof buildHomeLeads>[number]

  // -- La cartera real --------------------------------------------------------
  const setters = await prisma.user.findMany({ select: { id: true, email: true } })
  const conLeads: Array<{ id: string; email: string; n: number }> = []
  for (const s of setters) {
    const n = await prisma.osLead.count({ where: { assignedToId: s.id } })
    if (n > 0) conLeads.push({ id: s.id, email: s.email ?? '(sin email)', n })
  }
  conLeads.sort((a, b) => b.n - a.n)
  const target = conLeads[0]
  console.log('=== CARTERA: ' + target.email + ' (' + target.n + ' leads) ===\n')

  const home = buildHomeLeads(await listOwnedLeads(target.id))
  const part = particionarCartera(home)
  const trabajar = part.grupos.trabajar // YA ordenado por ordenFoco (flow.ts:842)

  // -- CENSO: reales contra artefactos ---------------------------------------
  const artefactos = home.filter((l) => esArtefacto(l.businessName))
  const reales = home.filter((l) => !esArtefacto(l.businessName))
  const trabajarReales = trabajar.filter((l) => !esArtefacto(l.businessName))
  console.log('=== CENSO ===')
  console.log('  cartera total ......... ' + home.length)
  console.log(
    '  artefactos de suites .. ' + artefactos.length + '  (prefijos: ' + PREFIJOS_ARTEFACTO.join(', ') + ')',
  )
  console.log('  leads reales .......... ' + reales.length)
  console.log(
    '  accionables (trabajar)  ' + trabajar.length + '   de los cuales reales: ' + trabajarReales.length,
  )
  const deCorrida = home.filter((l) => esDeCorrida(l.businessName))
  const noCorrida = home.filter((l) => !esDeCorrida(l.businessName))
  const trabajarNoCorrida = trabajar.filter((l) => !esDeCorrida(l.businessName))
  console.log('  -- corte CORRIDA (timestamp de 13 digitos en el nombre) --')
  console.log('  sembrados por corrida . ' + deCorrida.length)
  console.log('  no sembrados .......... ' + noCorrida.length + '   accionables: ' + trabajarNoCorrida.length)
  console.log('')

  // -- LOS CAROS, por criterio (no por nombre) -------------------------------
  const esCaro = (l: HL) =>
    l.stage === 'APROBADA' || (l.demoEnviada && (l.followUpVencido || l.postergadoVencido))
  const caros = trabajar.filter(esCaro)
  console.log(
    '=== LOS CAROS (criterio: stage APROBADA  o  demo enviada + toque vencido) — ' + caros.length + ' ===',
  )
  for (const c of caros) {
    const clase = c.stage === 'APROBADA' ? 'A) link listo, sin mandar' : 'B) demo mandada, toque vencido'
    const tag = esArtefacto(c.businessName) ? '[art] ' : '[REAL]'
    console.log('  ' + tag + ' ' + c.businessName.slice(0, 40).padEnd(40) + ' ' + clase)
  }
  console.log('')

  // -- LAS DOS COLAS ---------------------------------------------------------
  const colaDe = (orden: readonly HL[]) => {
    const sel = seleccionarFoco(orden, null)
    return armarCola(sel.foco, sel.resto, TOPE_COLA)
  }
  const ordenActual = trabajar
  // Copia para no mutar: filtrarYOrdenarCartera ordena in-place sobre su filtrado.
  const ordenUrg = filtrarYOrdenarCartera([...trabajar], '', 'todos', 'urgencia')

  const nivel = (l: HL) => (l.pinned ? 'PIN' : (motivoOrden(l) ?? '?'))

  const dump = (titulo: string, orden: readonly HL[]) => {
    const cola = colaDe(orden)
    console.log('=== COLA ' + titulo + ' (tope ' + TOPE_COLA + ') ===')
    cola.items.forEach((it, i) => {
      const tag = esArtefacto(it.lead.businessName) ? '[art] ' : '[REAL]'
      console.log(
        '  ' + (i + 1) + '. ' + tag + ' ' + it.lead.businessName.slice(0, 40).padEnd(40) + ' | ' + nivel(it.lead),
      )
    })
    console.log('  ocultos: ' + cola.ocultos + ' de ' + cola.total)
    const niveles = new Set(cola.items.map((it) => nivel(it.lead)))
    console.log('  niveles representados: ' + niveles.size + ' -> ' + [...niveles].join(' · '))
    console.log('')
    return cola
  }

  const cActual = dump('ACTUAL (ordenFoco: pin -> tier -> urgencia)', ordenActual)
  const cUrg = dump('URGENCIA (pin -> respondio -> caliente -> antiguedad)', ordenUrg)

  // -- Las respuestas --------------------------------------------------------
  const posEn = (orden: readonly HL[], id: string) => orden.findIndex((l) => l.id === id) + 1
  console.log('=== DONDE QUEDAN LOS CAROS ===')
  console.log('  lead'.padEnd(46) + ' | actual | urgencia | entra con urgencia?')
  for (const c of caros) {
    const pa = posEn(ordenActual, c.id)
    const pu = posEn(ordenUrg, c.id)
    console.log(
      '  ' + c.businessName.slice(0, 42).padEnd(44) + ' | ' + String(pa).padStart(6) + ' | ' +
        String(pu).padStart(8) + ' | ' + (pu <= TOPE_COLA ? 'SI' : 'no'),
    )
  }
  console.log('')

  const idsA = new Set(cActual.items.map((i) => i.lead.id))
  const idsU = new Set(cUrg.items.map((i) => i.lead.id))
  const salen = cActual.items.filter((i) => !idsU.has(i.lead.id))
  const entran = cUrg.items.filter((i) => !idsA.has(i.lead.id))
  console.log('=== QUE CAMBIA ===')
  console.log('  SALEN (hoy entran, con urgencia no): ' + salen.length)
  for (const s of salen)
    console.log('    - ' + s.lead.businessName.slice(0, 40).padEnd(40) + ' | ' + nivel(s.lead))
  console.log('  ENTRAN (hoy no, con urgencia si): ' + entran.length)
  for (const e of entran)
    console.log('    + ' + e.lead.businessName.slice(0, 40).padEnd(40) + ' | ' + nivel(e.lead))
  console.log('')

  // -- Alcance por nivel: primera fila que ocuparia cada nivel ---------------
  const porNivel = (orden: readonly HL[], titulo: string) => {
    console.log('=== ALCANCE POR NIVEL — ' + titulo + ' ===')
    const vistos = new Map<string, number>()
    orden.forEach((l, i) => {
      const n = nivel(l)
      if (!vistos.has(n)) vistos.set(n, i + 1)
    })
    const conteo = new Map<string, number>()
    for (const l of orden) conteo.set(nivel(l), (conteo.get(nivel(l)) ?? 0) + 1)
    for (const [n, pos] of [...vistos.entries()].sort((a, b) => a[1] - b[1])) {
      console.log(
        '  ' + n.slice(0, 46).padEnd(46) + ' | n=' + String(conteo.get(n)).padStart(3) +
          ' | 1a fila ' + String(pos).padStart(3) + ' | ' + (pos <= TOPE_COLA ? 'LLEGA' : 'INALCANZABLE'),
      )
    }
    console.log('')
  }
  porNivel(ordenActual, 'ACTUAL')
  porNivel(ordenUrg, 'URGENCIA')

  // -- Los controles: la misma medicion sobre carteras sin siembra ----------
  const control = (titulo: string, base: readonly HL[]) => {
    console.log('########## CONTROL: ' + titulo + ' ##########\n')
    const urg = filtrarYOrdenarCartera([...base], '', 'todos', 'urgencia')
    dump('ACTUAL · ' + titulo, base)
    dump('URGENCIA · ' + titulo, urg)
    porNivel(base, 'ACTUAL · ' + titulo)
    porNivel(urg, 'URGENCIA · ' + titulo)
    const cs = base.filter(esCaro)
    console.log('caros en este control: ' + cs.length)
    for (const c of cs) {
      console.log(
        '  ' + c.businessName.slice(0, 40).padEnd(40) + ' | actual ' + posEn(base, c.id) +
          ' | urgencia ' + posEn(urg, c.id),
      )
    }
    console.log('')
  }
  // El control informativo: sin lo que sembraron las corridas automaticas.
  control('sin siembra de corridas', trabajarNoCorrida)
  // El control estricto: sin ninguna semilla, ni las curadas a mano.
  control('solo leads reales (corte estricto)', trabajarReales)

  console.log('=== CUANTOS DE LOS CAROS SON REALES ===')
  console.log('  caros (cartera completa) ........ ' + caros.length)
  console.log('  caros sin siembra de corridas ... ' + trabajarNoCorrida.filter(esCaro).length)
  console.log('  caros que son leads reales ...... ' + trabajarReales.filter(esCaro).length)

  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
