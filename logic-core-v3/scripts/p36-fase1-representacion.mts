/**
 * P36 · Fase 1 (segunda mitad) — SIMULACION de la representacion por nivel.
 *
 * No construye nada en produccion: simula, sobre la cartera real, que cola
 * saldria si en vez de cortar un orden total en N se reservara una fila por
 * nivel poblado. Sirve para responder las dos preguntas del sprint:
 *   - cuantos leads por nivel entrarian, y que pasa con un nivel vacio;
 *   - si el tope de 5 sigue teniendo sentido con 6 niveles.
 *
 * El nivel se lee por motivoOrden (traduccion 1:1 de trabajoTier). El orden
 * DENTRO de cada nivel es el que el producto ya entrega.
 *
 * Uso: npx tsx scripts/p36-fase1-representacion.mts
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const DEV_BRANCH_HOST = 'ep-quiet-waterfall-acv0fpll'
if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

const esDeCorrida = (nombre: string) => /\d{13}/.test(nombre)

async function main() {
  const { prisma } = await import('@/lib/prisma')
  const { listOwnedLeads } = await import('@/lib/leados/ownership')
  const { buildHomeLeads } = await import('@/lib/leados/home')
  const { particionarCartera, motivoOrden } = await import('@/lib/leados/flow')
  const { TOPE_COLA } = await import('@/lib/leados/cola')
  type HL = ReturnType<typeof buildHomeLeads>[number]

  const setters = await prisma.user.findMany({ select: { id: true, email: true } })
  let target = { id: '', email: '', n: 0 }
  for (const s of setters) {
    const n = await prisma.osLead.count({ where: { assignedToId: s.id } })
    if (n > target.n) target = { id: s.id, email: s.email ?? '?', n }
  }
  const home = buildHomeLeads(await listOwnedLeads(target.id))
  const trabajar = particionarCartera(home).grupos.trabajar

  const nivel = (l: HL) => (l.pinned ? 'PIN' : (motivoOrden(l) ?? '?'))
  const esCaro = (l: HL) =>
    l.stage === 'APROBADA' || (l.demoEnviada && (l.followUpVencido || l.postergadoVencido))

  // Los seis niveles. El orden de esta lista ES la prioridad de reparto.
  const ORDEN_HOY = [
    'PIN',
    'Pasó el filtro y le falta la demo — construila',
    'Te toca a vos',
    'La demo está lista para mandar',
    'Todavía no sabés si sirve — evalualo',
    'Todavía no hay demo que mostrar',
  ]
  const ORDEN_PROPUESTO = [
    'PIN',
    'La demo está lista para mandar',
    'Te toca a vos',
    'Pasó el filtro y le falta la demo — construila',
    'Todavía no sabés si sirve — evalualo',
    'Todavía no hay demo que mostrar',
  ]

  /**
   * Round-robin por nivel: una vuelta reparte una fila a cada nivel POBLADO, en
   * el orden dado; las vueltas siguientes reparten lo que sobra. Un nivel vacio
   * simplemente no participa — su lugar NO se pierde, lo toma el siguiente.
   */
  const repartir = (base: readonly HL[], ordenNiveles: readonly string[], tope: number) => {
    const porNivel = new Map<string, HL[]>()
    for (const l of base) {
      const n = nivel(l)
      if (!porNivel.has(n)) porNivel.set(n, [])
      porNivel.get(n)!.push(l)
    }
    const cursor = new Map<string, number>()
    const salida: HL[] = []
    let progreso = true
    while (salida.length < tope && progreso) {
      progreso = false
      for (const n of ordenNiveles) {
        if (salida.length >= tope) break
        const lista = porNivel.get(n)
        const i = cursor.get(n) ?? 0
        if (lista && i < lista.length) {
          salida.push(lista[i])
          cursor.set(n, i + 1)
          progreso = true
        }
      }
    }
    return { salida, porNivel }
  }

  const simular = (titulo: string, base: readonly HL[], ordenNiveles: readonly string[], tope: number) => {
    const { salida, porNivel } = repartir(base, ordenNiveles, tope)
    console.log('=== ' + titulo + ' (tope ' + tope + ') ===')
    salida.forEach((l, i) => {
      const tag = esCaro(l) ? '[CARO]' : '      '
      console.log('  ' + (i + 1) + '. ' + tag + ' ' + l.businessName.slice(0, 40).padEnd(40) + ' | ' + nivel(l))
    })
    const niveles = new Set(salida.map(nivel))
    const poblados = [...porNivel.keys()].length
    const caros = salida.filter(esCaro).length
    console.log('  niveles poblados: ' + poblados + '  |  representados en la cola: ' + niveles.size)
    const faltan = [...porNivel.keys()].filter((n) => !niveles.has(n))
    console.log('  niveles SIN representacion: ' + (faltan.length === 0 ? '(ninguno)' : faltan.join(' · ')))
    console.log('  caros que entran: ' + caros + ' de ' + base.filter(esCaro).length)
    console.log('  ocultos: ' + (base.length - salida.length) + ' de ' + base.length)
    console.log('')
  }

  const trabajarNoCorrida = trabajar.filter((l) => !esDeCorrida(l.businessName))

  console.log('########## CARTERA COMPLETA (' + trabajar.length + ' accionables) ##########\n')
  simular('REPARTO · orden de niveles de HOY', trabajar, ORDEN_HOY, TOPE_COLA)
  simular('REPARTO · orden PROPUESTO (contactar primero)', trabajar, ORDEN_PROPUESTO, TOPE_COLA)
  simular('REPARTO · propuesto, tope 6', trabajar, ORDEN_PROPUESTO, 6)
  simular('REPARTO · propuesto, tope 7', trabajar, ORDEN_PROPUESTO, 7)

  console.log('########## CONTROL: sin siembra de corridas (' + trabajarNoCorrida.length + ') ##########\n')
  simular('REPARTO · orden de HOY', trabajarNoCorrida, ORDEN_HOY, TOPE_COLA)
  simular('REPARTO · orden PROPUESTO', trabajarNoCorrida, ORDEN_PROPUESTO, TOPE_COLA)
  simular('REPARTO · propuesto, tope 6', trabajarNoCorrida, ORDEN_PROPUESTO, 6)

  // -- El nivel vacio: se reparte o se pierde? -------------------------------
  console.log('=== UN NIVEL VACIO: SE REPARTE O SE PIERDE ===')
  const sinEvaluar = trabajar.filter((l) => nivel(l) !== 'Todavía no sabés si sirve — evalualo')
  const { salida: conTodos } = repartir(trabajar, ORDEN_PROPUESTO, TOPE_COLA)
  const { salida: sinUno } = repartir(sinEvaluar, ORDEN_PROPUESTO, TOPE_COLA)
  console.log('  con los 6 niveles ...... ' + conTodos.length + ' filas, niveles: ' + new Set(conTodos.map(nivel)).size)
  console.log('  vaciando un nivel ...... ' + sinUno.length + ' filas, niveles: ' + new Set(sinUno.map(nivel)).size)
  console.log('  -> la cola sigue llena: el lugar del nivel vacio lo toma el siguiente, no se pierde.')
  console.log('')

  // -- La aritmetica del cupo ------------------------------------------------
  const caros = trabajar.filter(esCaro)
  const pins = trabajar.filter((l) => l.pinned)
  console.log('=== LA ARITMETICA DEL CUPO ===')
  console.log('  tope de la cola ................ ' + TOPE_COLA)
  console.log('  filas que toman los fijados .... ' + pins.length)
  console.log('  filas libres ................... ' + (TOPE_COLA - pins.length))
  console.log('  leads caros .................... ' + caros.length)
  console.log(
    '  -> ' + caros.length + ' caros no entran en ' + (TOPE_COLA - pins.length) +
      ' filas con NINGUN orden ni reparto. El limite es de cupo, no de criterio.',
  )
  console.log('  tope necesario para los ' + caros.length + ' caros + los fijados: ' + (caros.length + pins.length))

  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
