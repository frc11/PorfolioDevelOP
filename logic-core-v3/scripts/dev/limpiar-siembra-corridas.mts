/**
 * LIMPIEZA DE LA SIEMBRA DE CORRIDAS — branch Neon dev, y nada más (P37).
 *
 * Por qué existe: la cartera de `setter-qa` llegó a 224 leads con 179 accionables,
 * de los cuales 137 los dejaron corridas de suites que crearon leads y nunca los
 * borraron. Dos sprints seguidos (P35, P36) decidieron orden, tope y prioridad
 * mirando esos artefactos.
 *
 * Qué borra: SOLO la categoría CORRIDA_AUTOMATICA (`siembra-categorias.mts`) — un
 * nombre con timestamp de 13 dígitos. Es la única categoría que el censo de P37
 * probó que ninguna suite lee: cada corrida crea sus propios leads con un
 * `Date.now()` nuevo y no vuelve a buscar los de corridas anteriores. Las semillas
 * curadas (QA-*, M0-GAL, CORRIDA*, DEMO Web) NO son borrables por este script: las
 * leen las mediciones fijas, la galería y las verificaciones manuales.
 *
 * Tres guardas:
 *   1. el host de la base tiene que ser la branch dev;
 *   2. solo filas más viejas que `--min-edad-min` (default 120): una corrida en
 *      curso en otro worktree comparte esta base, y borrarle sus leads a mitad de
 *      camino la pondría roja por algo que no es suyo;
 *   3. sin `--borrar` es un ensayo: cuenta y lista, no toca nada.
 *
 * Con `--borrar` escribe ANTES un respaldo completo (el lead y todas sus filas
 * hijas) en `--respaldo=<dir>`, y `--restaurar=<archivo>` lo vuelve a insertar.
 * Un lead vinculado a un Project aborta todo: eso no es un artefacto.
 *
 * Uso:
 *   npx tsx scripts/dev/limpiar-siembra-corridas.mts                         # ensayo
 *   npx tsx scripts/dev/limpiar-siembra-corridas.mts --borrar --respaldo=C:/tmp/siembra
 *   npx tsx scripts/dev/limpiar-siembra-corridas.mts --restaurar=C:/tmp/siembra/respaldo-<ts>.json
 */
import fs from 'fs'
import path from 'path'
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST, categoriaDe } from './siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

const CATEGORIA_BORRABLE = 'CORRIDA_AUTOMATICA'

/** Las seis colecciones del respaldo, en orden de inserción (padres antes que hijos). */
const COLECCIONES = ['leads', 'dossiers', 'actividades', 'demos', 'metas', 'avisos'] as const
type Fila = Record<string, unknown>
type Respaldo = { categoria: string } & Record<(typeof COLECCIONES)[number], Fila[]>

/** Lee un respaldo y exige las seis colecciones como arrays: nada de `any` corriendo hacia la base. */
function leerRespaldo(archivo: string): Respaldo {
  const crudo: unknown = JSON.parse(fs.readFileSync(archivo, 'utf8'))
  if (typeof crudo !== 'object' || crudo === null) throw new Error(`respaldo ilegible: ${archivo}`)
  const obj = crudo as Record<string, unknown>
  for (const c of COLECCIONES) {
    if (!Array.isArray(obj[c])) throw new Error(`respaldo sin la colección «${c}»: ${archivo}`)
  }
  return obj as Respaldo
}

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null
const flag = (nombre: string) => process.argv.includes(`--${nombre}`)

async function main() {
  const { prisma } = await import('@/lib/prisma')
  const { Prisma } = await import('@prisma/client')

  const restaurar = arg('restaurar')
  if (restaurar) {
    const r = leerRespaldo(restaurar)
    // Json? nulo vuelve como NULL de base (así lo guarda el producto).
    const jsonNull = (row: Fila, campos: readonly string[]): Fila =>
      Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k, campos.includes(k) && v === null ? Prisma.DbNull : v]),
      )
    const JSON_DOSSIER = ['fichaJson', 'evaluacionJson', 'briefJson', 'selfCheckJson', 'progresoJson', 'rechazos', 'agendaJson']
    // Las filas salieron de un findMany de estos mismos modelos; Prisma valida la forma en runtime.
    await prisma.$transaction([
      prisma.osLead.createMany({ data: r.leads as unknown as Prisma.OsLeadCreateManyInput[] }),
      prisma.osLeadDossier.createMany({
        data: r.dossiers.map((d) => jsonNull(d, JSON_DOSSIER)) as unknown as Prisma.OsLeadDossierCreateManyInput[],
      }),
      prisma.osLeadActivity.createMany({ data: r.actividades as unknown as Prisma.OsLeadActivityCreateManyInput[] }),
      prisma.osDemo.createMany({ data: r.demos as unknown as Prisma.OsDemoCreateManyInput[] }),
      prisma.osLeadSetterMeta.createMany({ data: r.metas as unknown as Prisma.OsLeadSetterMetaCreateManyInput[] }),
      prisma.osSetterNotice.createMany({ data: r.avisos as unknown as Prisma.OsSetterNoticeCreateManyInput[] }),
    ])
    console.log(
      `restaurado: ${r.leads.length} leads · ${r.dossiers.length} dossiers · ${r.actividades.length} actividades · ` +
        `${r.demos.length} demos · ${r.metas.length} metas · ${r.avisos.length} avisos`,
    )
    await prisma.$disconnect()
    return
  }

  const minEdadMin = Number(arg('min-edad-min') ?? 120)
  const corte = new Date(Date.now() - minEdadMin * 60_000)
  const todos = await prisma.osLead.findMany({ select: { id: true, businessName: true, createdAt: true } })
  const candidatos = todos.filter((l) => categoriaDe(l.businessName) === CATEGORIA_BORRABLE)
  const borrables = candidatos.filter((l) => l.createdAt < corte)
  const ids = borrables.map((l) => l.id)

  console.log(`OsLead total ${todos.length} · categoría ${CATEGORIA_BORRABLE}: ${candidatos.length}`)
  console.log(`  más viejos que ${minEdadMin} min (borrables): ${borrables.length}`)
  console.log(`  más nuevos (se respetan, corrida en curso posible): ${candidatos.length - borrables.length}`)

  const [leads, dossiers, actividades, demos, metas, avisos, proyectos] = await Promise.all([
    prisma.osLead.findMany({ where: { id: { in: ids } } }),
    prisma.osLeadDossier.findMany({ where: { leadId: { in: ids } } }),
    prisma.osLeadActivity.findMany({ where: { leadId: { in: ids } } }),
    prisma.osDemo.findMany({ where: { leadId: { in: ids } } }),
    prisma.osLeadSetterMeta.findMany({ where: { leadId: { in: ids } } }),
    prisma.osSetterNotice.findMany({ where: { leadId: { in: ids } } }),
    prisma.project.count({ where: { osLeadId: { in: ids } } }),
  ])
  console.log(
    `  filas hijas: ${dossiers.length} dossiers · ${actividades.length} actividades · ${demos.length} demos · ` +
      `${metas.length} metas · ${avisos.length} avisos · ${proyectos} proyectos`,
  )
  if (proyectos > 0) {
    console.error('ABORT: hay leads de la categoría vinculados a un Project — eso no es un artefacto.')
    process.exit(1)
  }

  if (!flag('borrar')) {
    console.log('\nENSAYO (sin --borrar): no se tocó nada.')
    await prisma.$disconnect()
    return
  }

  const dir = arg('respaldo')
  if (!dir) {
    console.error('ABORT: --borrar exige --respaldo=<dir>. Nada se borra sin respaldo.')
    process.exit(1)
  }
  fs.mkdirSync(dir, { recursive: true })
  const archivo = path.join(dir, `respaldo-${Date.now()}.json`)
  fs.writeFileSync(archivo, JSON.stringify({ categoria: CATEGORIA_BORRABLE, leads, dossiers, actividades, demos, metas, avisos }))
  // Verificar que el respaldo se relee completo ANTES de borrar: las seis colecciones.
  const releido = leerRespaldo(archivo)
  const esperado: Record<(typeof COLECCIONES)[number], number> = {
    leads: leads.length,
    dossiers: dossiers.length,
    actividades: actividades.length,
    demos: demos.length,
    metas: metas.length,
    avisos: avisos.length,
  }
  const incompletas = COLECCIONES.filter((c) => releido[c].length !== esperado[c])
  if (incompletas.length > 0) {
    console.error(`ABORT: el respaldo no se relee completo (${incompletas.join(', ')}).`)
    process.exit(1)
  }
  console.log(`respaldo → ${archivo}`)

  // Los avisos se borran explícitamente: con onDelete SetNull quedarían huérfanos
  // (leadId null) en las novedades del setter. Dossier/actividad/demo/meta caen
  // por cascada.
  const [avisosBorrados, leadsBorrados] = await prisma.$transaction([
    prisma.osSetterNotice.deleteMany({ where: { leadId: { in: ids } } }),
    prisma.osLead.deleteMany({ where: { id: { in: ids } } }),
  ])
  console.log(`borrados: ${leadsBorrados.count} leads · ${avisosBorrados.count} avisos`)
  const restantes = await prisma.osLead.count()
  console.log(`OsLead total después: ${restantes}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
