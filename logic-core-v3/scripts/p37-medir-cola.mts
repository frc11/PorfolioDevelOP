/**
 * P37 · LA COLA, MEDIDA — solo lectura.
 *
 * No re-deriva nada. Las dos colas se arman con las funciones del producto:
 *   PRODUCTO : particionarCartera (el comparador que el panel usa HOY, sea cual
 *              sea al momento de correr) -> seleccionarFoco -> armarCola
 *   URGENCIA : filtrarYOrdenarCartera(…, 'urgencia') -> seleccionarFoco -> armarCola
 *              (la función de la cartera: pin || ordenUrgencia)
 * Antes del cambio de P37, PRODUCTO es el criterio viejo y URGENCIA el nuevo.
 * Después, las dos tienen que ser idénticas lead por lead — el script lo afirma.
 *
 * El nivel se lee por `motivoOrden` (traducción 1:1 de `trabajoTier`).
 * El sticky del foco va en null: la cookie es por navegador, no por cartera.
 *
 * LOS NIVELES DE ARRANQUE (`EVALUAR`, `SIN_DEMO`): el drenaje simula la cola como
 * cola — el primero se hace y sale, entra el siguiente — y cuenta cuántos leads
 * hay que despachar hasta que cada nivel aparece a la vista. Es una cota
 * OPTIMISTA: no modela que un lead despachado reentre en otro nivel ni que
 * lleguen leads nuevos (que por antigüedad entran al fondo).
 *
 * Uso: npx tsx scripts/p37-medir-cola.mts
 */
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST, categoriaDe } from './dev/siembra-categorias.mts'
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

const NIVEL_POR_ROTULO: Record<string, string> = {
  'Fijado por vos — va primero': 'PIN',
  'Pasó el filtro y le falta la demo — construila': 'CONSTRUIR',
  'La demo está lista para mandar': 'CONTACTAR_CON_DEMO',
  'Todavía no sabés si sirve — evalualo': 'EVALUAR',
  'Todavía no hay demo que mostrar': 'SIN_DEMO',
}
const NIVELES = ['PIN', 'CONSTRUIR', 'ESPERA_TU_ACCION', 'CONTACTAR_CON_DEMO', 'EVALUAR', 'SIN_DEMO']
const ARRANQUE = ['EVALUAR', 'SIN_DEMO']

async function main() {
  const { prisma } = await import('@/lib/prisma')
  const { listOwnedLeads } = await import('@/lib/leados/ownership')
  const { buildHomeLeads } = await import('@/lib/leados/home')
  const { particionarCartera, motivoOrden, filtrarYOrdenarCartera } = await import('@/lib/leados/flow')
  const { TEXTO_TURNO } = await import('@/lib/leados/turno')
  const { seleccionarFoco } = await import('@/lib/leados/foco')
  const { armarCola, TOPE_COLA } = await import('@/lib/leados/cola')
  type HL = ReturnType<typeof buildHomeLeads>[number]
  NIVEL_POR_ROTULO[TEXTO_TURNO.setter.titulo] = 'ESPERA_TU_ACCION'

  const qa = await prisma.user.findUniqueOrThrow({ where: { email: 'setter-qa@develop.test' }, select: { id: true } })
  const home = buildHomeLeads(await listOwnedLeads(qa.id))
  const trabajar = particionarCartera(home).grupos.trabajar

  const nivel = (l: HL) => {
    const m = motivoOrden(l)
    return (m && NIVEL_POR_ROTULO[m]) ?? '?' + m
  }
  const colaDe = (orden: readonly HL[], tope = TOPE_COLA) => {
    const sel = seleccionarFoco(orden, null)
    return armarCola(sel.foco, sel.resto, tope)
  }
  const urgencia = (base: readonly HL[]) => filtrarYOrdenarCartera([...base], '', 'todos', 'urgencia')

  console.log(`=== setter-qa · cartera ${home.length} · accionables ${trabajar.length} · tope ${TOPE_COLA} ===`)
  const porCat = new Map<string, number>()
  for (const l of trabajar) porCat.set(categoriaDe(l.businessName), (porCat.get(categoriaDe(l.businessName)) ?? 0) + 1)
  console.log('accionables por categoría: ' + JSON.stringify(Object.fromEntries(porCat)))
  const porNivelN = new Map<string, number>()
  for (const l of trabajar) porNivelN.set(nivel(l), (porNivelN.get(nivel(l)) ?? 0) + 1)
  console.log('accionables por nivel:     ' + JSON.stringify(Object.fromEntries(porNivelN)) + '\n')

  const dump = (titulo: string, orden: readonly HL[]) => {
    const cola = colaDe(orden)
    console.log(`--- COLA ${titulo} ---`)
    cola.items.forEach((it, i) => {
      const l = it.lead
      console.log(
        `  ${i + 1}. ${l.businessName.slice(0, 44).padEnd(44)} ${categoriaDe(l.businessName).padEnd(18)} ` +
          `${nivel(l).padEnd(19)} ${l.status.padEnd(10)} cal=${l.caliente ? 'si' : 'no'} ${l.createdAt.toISOString().slice(0, 10)}`,
      )
    })
    console.log(`  ocultos ${cola.ocultos} de ${cola.total}`)
    const primera = new Map<string, number>()
    orden.forEach((l, i) => {
      if (!primera.has(nivel(l))) primera.set(nivel(l), i + 1)
    })
    const llegan = NIVELES.filter((n) => (primera.get(n) ?? Infinity) <= TOPE_COLA)
    const presentes = NIVELES.filter((n) => primera.has(n))
    console.log(`  niveles que llegan: ${llegan.length} de ${presentes.length} poblados → ${llegan.join(' · ')}`)
    for (const n of presentes.filter((x) => !llegan.includes(x))) {
      console.log(`    no llega ${n.padEnd(19)} n=${String(porNivelN.get(n)).padStart(3)} primera fila ${primera.get(n)}`)
    }
    const pins = orden.map((l, i) => (l.pinned ? i + 1 : 0)).filter(Boolean)
    console.log(`  fijados en las filas: ${pins.join(', ') || '(ninguno)'}\n`)
    return cola
  }

  const ordenProducto = trabajar
  const ordenUrg = urgencia(trabajar)
  const cP = dump('PRODUCTO (particionarCartera, código actual)', ordenProducto)
  const cU = dump('URGENCIA (filtrarYOrdenarCartera urgencia)', ordenUrg)

  const idsU = new Set(cU.items.map((i) => i.lead.id))
  const idsP = new Set(cP.items.map((i) => i.lead.id))
  console.log('SALEN (en PRODUCTO, no en URGENCIA): ' + cP.items.filter((i) => !idsU.has(i.lead.id)).map((i) => `${i.lead.businessName} [${nivel(i.lead)}]`).join(' | '))
  console.log('ENTRAN (en URGENCIA, no en PRODUCTO): ' + cU.items.filter((i) => !idsP.has(i.lead.id)).map((i) => `${i.lead.businessName} [${nivel(i.lead)}]`).join(' | '))
  const identicas = ordenProducto.length === ordenUrg.length && ordenProducto.every((l, i) => l.id === ordenUrg[i].id)
  console.log(`\nIDENTIDAD cola del producto === orden de la cartera (lead por lead, los ${trabajar.length}): ${identicas ? 'SÍ' : 'NO'}\n`)

  // Dónde está el lead con la demo aprobada (APROBADA + finalUrl + sin enviar).
  for (const l of trabajar.filter((x) => x.stage === 'APROBADA')) {
    console.log(`APROBADA: ${l.businessName} · producto fila ${ordenProducto.indexOf(l) + 1} · urgencia fila ${ordenUrg.indexOf(l) + 1}`)
  }

  // ── Los niveles de arranque: hoy y drenando, con los dos cortes ──────────────
  const drenar = (titulo: string, base: readonly HL[]) => {
    let resto = urgencia(base)
    const aparece = new Map<string, number>()
    let despachados = 0
    while (resto.length > 0) {
      for (const it of colaDe(resto).items) if (!aparece.has(nivel(it.lead))) aparece.set(nivel(it.lead), despachados)
      resto = resto.slice(1)
      despachados += 1
    }
    const nArr = ARRANQUE.map((n) => `${n} n=${base.filter((l) => nivel(l) === n).length}`)
    console.log(`--- ARRANQUE · corte ${titulo} · accionables ${base.length} (${nArr.join(', ')}) ---`)
    for (const n of ARRANQUE) {
      const d = aparece.get(n)
      console.log(`  ${n.padEnd(9)} ${d === undefined ? 'no hay leads de este nivel' : d === 0 ? 'a la vista HOY' : `aparece después de despachar ${d} leads`}`)
    }
  }
  drenar('CARTERA TAL CUAL', trabajar)
  drenar('SIN NINGUNA SEMILLA DE SUITE NI CURADA (solo SIN_PREFIJO)', trabajar.filter((l) => categoriaDe(l.businessName) === 'SIN_PREFIJO'))
  drenar('SIN CORRIDAS AUTOMÁTICAS', trabajar.filter((l) => categoriaDe(l.businessName) !== 'CORRIDA_AUTOMATICA'))

  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
