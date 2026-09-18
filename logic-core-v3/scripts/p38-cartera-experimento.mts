/**
 * P38 · EL EXPERIMENTO DE LA CARTERA — branch Neon dev, y nada más.
 *
 * Para encontrar las pruebas cuya premisa se cumple por estado accidental, las
 * suites se corren contra una cartera de `setter-qa` DISTINTA de la de hoy, sin
 * tocar el código ni las pruebas. Dos de las tres variantes viven acá (la de
 * «más datos» es la restauración de la siembra de P37, con su propia
 * herramienta):
 *
 *   menos  — la cartera de setter-qa queda VACÍA: sus leads, sus avisos y sus
 *            metas (pin/pausa/nota) pasan a un usuario de estacionamiento. Las
 *            filas no se borran: cambia una sola columna (el dueño o el
 *            destinatario), y vuelve.
 *   orden  — los MISMOS leads en OTRO orden: el `createdAt` de cada lead de
 *            setter-qa se espeja dentro de su propio rango (el más viejo pasa a
 *            ser el más nuevo). La cola por urgencia desempata por antigüedad,
 *            así que cambia quién llega a la cola sin cambiar ningún estado.
 *
 * Guardas:
 *   1. el host de la base tiene que ser la branch dev;
 *   2. `--aplicar` exige `--respaldo=<dir>`: escribe ANTES un respaldo de las
 *      filas completas que va a tocar y lo relee;
 *   3. cada UPDATE lleva el valor viejo en el WHERE (compare-and-swap) y exige
 *      tocar exactamente las filas del respaldo;
 *   4. `--restaurar` vuelve cada columna a su valor y compara las filas
 *      COMPLETAS contra el respaldo, columna por columna — si una sola difiere,
 *      lo dice y sale con error.
 *
 * SQL parametrizado (`$executeRaw` con plantilla) y no `update` de Prisma: el
 * `@updatedAt` del cliente pisaría `updatedAt`, y la vuelta dejaría de ser exacta.
 *
 * Uso:
 *   npx tsx scripts/p38-cartera-experimento.mts --modo=menos --aplicar --respaldo=C:/tmp/p38-experimentos/menos
 *   npx tsx scripts/p38-cartera-experimento.mts --modo=menos --restaurar=C:/tmp/p38-experimentos/menos/respaldo-<ts>.json
 *   npx tsx scripts/p38-cartera-experimento.mts --verificar=<respaldo.json>        # compara sin escribir
 *   npx tsx scripts/p38-cartera-experimento.mts --comparar-respaldos=<a.json>,<b.json>   # respaldos de P37
 */
import fs from 'fs'
import path from 'path'
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

const QA_EMAIL = 'setter-qa@develop.test'
const ESTACIONAMIENTO_EMAIL = 'p38-estacionamiento@develop.test'

type Modo = 'menos' | 'orden'
type Fila = Record<string, unknown>
type Respaldo = {
  modo: Modo
  qaId: string
  creado: string
  leads: Fila[]
  avisos: Fila[]
  metas: Fila[]
  /** orden: createdAt nuevo por id (ISO). */
  espejo: Record<string, string>
}

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null
const flag = (nombre: string) => process.argv.includes(`--${nombre}`)

/** Serialización canónica de una fila: claves ordenadas, fechas en ISO. */
function canon(fila: Fila): string {
  const claves = Object.keys(fila).sort()
  return JSON.stringify(
    claves.map((k) => {
      const v = fila[k]
      return [k, v instanceof Date ? v.toISOString() : v]
    }),
  )
}

function porId(filas: readonly Fila[]): Map<string, string> {
  return new Map(filas.map((f) => [String(f.id), canon(f)]))
}

/** Diferencias columna por columna entre dos conjuntos de filas (por id). */
function diferencias(esperadas: readonly Fila[], actuales: readonly Fila[], tabla: string): string[] {
  const act = new Map(actuales.map((f) => [String(f.id), f]))
  const difs: string[] = []
  for (const e of esperadas) {
    const a = act.get(String(e.id))
    if (!a) {
      difs.push(`${tabla} ${String(e.id)}: FALTA`)
      continue
    }
    for (const k of new Set([...Object.keys(e), ...Object.keys(a)])) {
      const ve = e[k] instanceof Date ? (e[k] as Date).toISOString() : JSON.stringify(e[k])
      const va = a[k] instanceof Date ? (a[k] as Date).toISOString() : JSON.stringify(a[k])
      if (ve !== va) difs.push(`${tabla} ${String(e.id)} · ${k}: ${ve} → ${va}`)
    }
  }
  if (actuales.length !== esperadas.length) {
    difs.push(`${tabla}: ${esperadas.length} filas esperadas, ${actuales.length} encontradas`)
  }
  return difs
}

/** El JSON guarda fechas como string: se revive cada campo que parece ISO. */
function revivir(fila: Fila): Fila {
  return Object.fromEntries(
    Object.entries(fila).map(([k, v]) => [
      k,
      typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v) ? new Date(v) : v,
    ]),
  )
}

function leerRespaldo(archivo: string): Respaldo {
  const crudo: unknown = JSON.parse(fs.readFileSync(archivo, 'utf8'))
  if (typeof crudo !== 'object' || crudo === null) throw new Error(`respaldo ilegible: ${archivo}`)
  const obj = crudo as Record<string, unknown>
  for (const c of ['leads', 'avisos', 'metas']) {
    if (!Array.isArray(obj[c])) throw new Error(`respaldo sin la colección «${c}»: ${archivo}`)
  }
  if (obj.modo !== 'menos' && obj.modo !== 'orden') throw new Error(`respaldo sin modo válido: ${archivo}`)
  if (typeof obj.qaId !== 'string') throw new Error(`respaldo sin qaId: ${archivo}`)
  const r = obj as unknown as Respaldo
  return {
    ...r,
    leads: r.leads.map(revivir),
    avisos: r.avisos.map(revivir),
    metas: r.metas.map(revivir),
    espejo: r.espejo ?? {},
  }
}

async function main() {
  const { prisma } = await import('@/lib/prisma')

  const comparar = arg('comparar-respaldos')
  if (comparar) {
    const [a, b] = comparar.split(',')
    if (!a || !b) throw new Error('--comparar-respaldos=<a.json>,<b.json>')
    const ra = JSON.parse(fs.readFileSync(a, 'utf8')) as Record<string, unknown>
    const rb = JSON.parse(fs.readFileSync(b, 'utf8')) as Record<string, unknown>
    let total = 0
    let iguales = true
    for (const c of ['leads', 'dossiers', 'actividades', 'demos', 'metas', 'avisos']) {
      const fa = (ra[c] as Fila[] | undefined) ?? []
      const fb = (rb[c] as Fila[] | undefined) ?? []
      const ma = porId(fa)
      const mb = porId(fb)
      const distintas = [...ma.entries()].filter(([id, s]) => mb.get(id) !== s).length
      total += fa.length
      if (distintas > 0 || fa.length !== fb.length) iguales = false
      console.log(`  ${c.padEnd(12)} ${fa.length} vs ${fb.length} · filas distintas ${distintas}`)
    }
    console.log(iguales ? `IDÉNTICOS (${total} filas)` : 'DISTINTOS')
    process.exitCode = iguales ? 0 : 1
    await prisma.$disconnect()
    return
  }

  const qa = await prisma.user.findUniqueOrThrow({ where: { email: QA_EMAIL }, select: { id: true } })

  const leerActuales = async (r: Respaldo) => {
    const ids = r.leads.map((f) => String(f.id))
    const [leads, avisos, metas] = await Promise.all([
      prisma.osLead.findMany({ where: { id: { in: ids } } }),
      prisma.osSetterNotice.findMany({ where: { id: { in: r.avisos.map((f) => String(f.id)) } } }),
      prisma.osLeadSetterMeta.findMany({ where: { id: { in: r.metas.map((f) => String(f.id)) } } }),
    ])
    return { leads: leads as Fila[], avisos: avisos as Fila[], metas: metas as Fila[] }
  }

  const verificarIdentidad = async (r: Respaldo): Promise<string[]> => {
    const act = await leerActuales(r)
    return [
      ...diferencias(r.leads, act.leads, 'OsLead'),
      ...diferencias(r.avisos, act.avisos, 'OsSetterNotice'),
      ...diferencias(r.metas, act.metas, 'OsLeadSetterMeta'),
    ]
  }

  const verificar = arg('verificar')
  if (verificar) {
    const r = leerRespaldo(verificar)
    const difs = await verificarIdentidad(r)
    console.log(difs.length === 0 ? `IDÉNTICO al respaldo (${r.leads.length} leads · ${r.avisos.length} avisos · ${r.metas.length} metas)` : difs.join('\n'))
    process.exitCode = difs.length === 0 ? 0 : 1
    await prisma.$disconnect()
    return
  }

  const restaurar = arg('restaurar')
  if (restaurar) {
    const r = leerRespaldo(restaurar)
    if (r.qaId !== qa.id) throw new Error('el respaldo es de otro setter-qa')
    const ids = r.leads.map((f) => String(f.id))

    if (r.modo === 'menos') {
      const est = await prisma.user.findUnique({ where: { email: ESTACIONAMIENTO_EMAIL }, select: { id: true } })
      if (!est) throw new Error('no existe el usuario de estacionamiento: ¿ya se restauró?')
      const avisoIds = r.avisos.map((f) => String(f.id))
      const metaIds = r.metas.map((f) => String(f.id))
      const [nLeads, nAvisos, nMetas] = await prisma.$transaction([
        prisma.$executeRaw`UPDATE "OsLead" SET "assignedToId" = ${qa.id} WHERE id = ANY(${ids}) AND "assignedToId" = ${est.id}`,
        prisma.$executeRaw`UPDATE "OsSetterNotice" SET "setterId" = ${qa.id} WHERE id = ANY(${avisoIds}) AND "setterId" = ${est.id}`,
        prisma.$executeRaw`UPDATE "OsLeadSetterMeta" SET "setterId" = ${qa.id} WHERE id = ANY(${metaIds}) AND "setterId" = ${est.id}`,
      ])
      console.log(`devueltos a setter-qa: ${nLeads} leads · ${nAvisos} avisos · ${nMetas} metas`)
      if (nLeads !== ids.length || nAvisos !== avisoIds.length || nMetas !== metaIds.length) {
        throw new Error('la vuelta no tocó exactamente las filas del respaldo — revisar a mano antes de seguir')
      }
      const colgando = await Promise.all([
        prisma.osLead.count({ where: { assignedToId: est.id } }),
        prisma.osSetterNotice.count({ where: { setterId: est.id } }),
        prisma.osLeadSetterMeta.count({ where: { setterId: est.id } }),
        prisma.osLeadActivity.count({ where: { performedById: est.id } }),
      ])
      if (colgando.some((n) => n > 0)) {
        throw new Error(`el estacionamiento todavía tiene filas (${colgando.join('/')}): no se borra`)
      }
      await prisma.user.delete({ where: { id: est.id } })
      console.log('usuario de estacionamiento borrado (sin filas colgando)')
    } else {
      const sentencias = r.leads.map((f) => {
        const original = f.createdAt as Date
        const espejado = new Date(r.espejo[String(f.id)] ?? '')
        return prisma.$executeRaw`UPDATE "OsLead" SET "createdAt" = ${original} WHERE id = ${String(f.id)} AND "createdAt" = ${espejado}`
      })
      const tocadas = await prisma.$transaction(sentencias)
      const n = tocadas.reduce((s, x) => s + x, 0)
      console.log(`createdAt devuelto en ${n} leads`)
      if (n !== ids.length) throw new Error('la vuelta no tocó exactamente los leads del respaldo — revisar a mano')
    }

    const difs = await verificarIdentidad(r)
    if (difs.length > 0) {
      console.error('LA VUELTA NO ES EXACTA:\n' + difs.join('\n'))
      process.exit(1)
    }
    console.log(`VUELTA EXACTA: ${r.leads.length} leads · ${r.avisos.length} avisos · ${r.metas.length} metas idénticos al respaldo, columna por columna`)
    await prisma.$disconnect()
    return
  }

  if (!flag('aplicar')) {
    console.error('Nada que hacer: --aplicar | --restaurar=<archivo> | --verificar=<archivo> | --comparar-respaldos=a,b')
    process.exit(1)
  }
  const modo = arg('modo')
  if (modo !== 'menos' && modo !== 'orden') throw new Error('--modo=menos|orden')
  const dir = arg('respaldo')
  if (!dir) {
    console.error('ABORT: --aplicar exige --respaldo=<dir>.')
    process.exit(1)
  }

  const yaEstacionado = await prisma.user.findUnique({ where: { email: ESTACIONAMIENTO_EMAIL }, select: { id: true } })
  if (yaEstacionado) throw new Error('ya existe el usuario de estacionamiento: un experimento quedó aplicado. Restaurar primero.')

  const [leads, avisos, metas] = await Promise.all([
    prisma.osLead.findMany({ where: { assignedToId: qa.id }, orderBy: { id: 'asc' } }),
    modo === 'menos' ? prisma.osSetterNotice.findMany({ where: { setterId: qa.id }, orderBy: { id: 'asc' } }) : Promise.resolve([]),
    modo === 'menos' ? prisma.osLeadSetterMeta.findMany({ where: { setterId: qa.id }, orderBy: { id: 'asc' } }) : Promise.resolve([]),
  ])
  // Una corrida en curso tiene leads con stamp de 13 dígitos recién creados: no se
  // experimenta con una suite a mitad de camino.
  const enCurso = leads.filter((l) => /\d{13}/.test(l.businessName))
  if (enCurso.length > 0) {
    throw new Error(`hay ${enCurso.length} leads de una corrida en curso en setter-qa: esperar a que termine`)
  }

  const espejo: Record<string, string> = {}
  if (modo === 'orden') {
    const ts = leads.map((l) => l.createdAt.getTime())
    const min = Math.min(...ts)
    const max = Math.max(...ts)
    for (const l of leads) espejo[l.id] = new Date(min + (max - l.createdAt.getTime())).toISOString()
  }

  fs.mkdirSync(dir, { recursive: true })
  const archivo = path.join(dir, `respaldo-${Date.now()}.json`)
  const respaldo: Respaldo = { modo, qaId: qa.id, creado: new Date().toISOString(), leads, avisos, metas, espejo }
  fs.writeFileSync(archivo, JSON.stringify(respaldo))
  const releido = leerRespaldo(archivo)
  if (
    releido.leads.length !== leads.length ||
    releido.avisos.length !== avisos.length ||
    releido.metas.length !== metas.length ||
    diferencias(leads, releido.leads, 'relectura').length > 0
  ) {
    console.error('ABORT: el respaldo no se relee idéntico.')
    process.exit(1)
  }
  console.log(`respaldo → ${archivo} (${leads.length} leads · ${avisos.length} avisos · ${metas.length} metas)`)

  const ids = leads.map((l) => l.id)
  if (modo === 'menos') {
    const est = await prisma.user.create({
      data: { email: ESTACIONAMIENTO_EMAIL, name: 'P38 estacionamiento (experimento)', role: 'SETTER' },
      select: { id: true },
    })
    const avisoIds = avisos.map((a) => a.id)
    const metaIds = metas.map((m) => m.id)
    const [nLeads, nAvisos, nMetas] = await prisma.$transaction([
      prisma.$executeRaw`UPDATE "OsLead" SET "assignedToId" = ${est.id} WHERE id = ANY(${ids}) AND "assignedToId" = ${qa.id}`,
      prisma.$executeRaw`UPDATE "OsSetterNotice" SET "setterId" = ${est.id} WHERE id = ANY(${avisoIds}) AND "setterId" = ${qa.id}`,
      prisma.$executeRaw`UPDATE "OsLeadSetterMeta" SET "setterId" = ${est.id} WHERE id = ANY(${metaIds}) AND "setterId" = ${qa.id}`,
    ])
    console.log(`estacionados: ${nLeads} leads · ${nAvisos} avisos · ${nMetas} metas`)
    const quedan = await Promise.all([
      prisma.osLead.count({ where: { assignedToId: qa.id } }),
      prisma.osSetterNotice.count({ where: { setterId: qa.id } }),
      prisma.osLeadSetterMeta.count({ where: { setterId: qa.id } }),
    ])
    console.log(`setter-qa ahora: ${quedan[0]} leads · ${quedan[1]} avisos · ${quedan[2]} metas`)
    if (nLeads !== ids.length || nAvisos !== avisoIds.length || nMetas !== metaIds.length || quedan.some((n) => n > 0)) {
      console.error('ABORT: la aplicación no fue exacta — restaurar con el respaldo recién escrito.')
      process.exit(1)
    }
  } else {
    const sentencias = leads.map(
      (l) =>
        prisma.$executeRaw`UPDATE "OsLead" SET "createdAt" = ${new Date(espejo[l.id] ?? '')} WHERE id = ${l.id} AND "createdAt" = ${l.createdAt}`,
    )
    const tocadas = await prisma.$transaction(sentencias)
    const n = tocadas.reduce((s, x) => s + x, 0)
    console.log(`createdAt espejado en ${n} leads`)
    if (n !== ids.length) {
      console.error('ABORT: no se espejaron todos — restaurar con el respaldo recién escrito.')
      process.exit(1)
    }
  }
  await prisma.$disconnect()
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
