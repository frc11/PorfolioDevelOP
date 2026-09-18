/**
 * BORRADO POR IDENTIDAD — branch Neon dev, y nada más (P39).
 *
 * Borra una LISTA DE IDS, no un criterio. La lista la arma quien censa (y queda
 * escrita en un archivo que se puede leer antes de correr esto); acá no se busca
 * nada por patrón. Dos clases de fila:
 *
 *   avisos — `OsSetterNotice` por id (la fuga de 07-G1: `leadId` null, no la
 *            alcanza ningún borrado por lead ni por setter);
 *   leads  — `OsLead` por id, con todas sus filas hijas en el respaldo
 *            (dossier, actividades, demos, metas y los avisos que lo nombran).
 *
 * Guardas:
 *   1. el host de la base tiene que ser la branch dev;
 *   2. sin `--borrar` es un ensayo: lee y lista, no toca nada;
 *   3. cada id de la lista tiene que existir: si falta uno, la identidad ya no es
 *      la que se censó y no se borra ninguno;
 *   4. con `--esperar-aviso-fuga-g1` cada aviso tiene que seguir siendo la copia
 *      exacta de la fuga (destinatario setter-qa, `LEAD_REASIGNADO_SALIENTE`, sin
 *      lead, cuerpo idéntico salvo el stamp) — un control, no el criterio;
 *   5. `--borrar` exige `--respaldo=<dir>`: filas completas, releídas antes de borrar;
 *   6. un lead con `Project` aborta todo.
 *
 * Vuelta atrás: `--restaurar=<respaldo>` reinserta y COMPARA las filas de la base
 * contra el respaldo, columna por columna. `--comparar-respaldos=<a>,<b>` compara
 * dos respaldos sin tocar la base.
 *
 * Uso:
 *   npx tsx scripts/dev/borrar-por-identidad.mts --ids=<ids.json>                      # ensayo
 *   npx tsx scripts/dev/borrar-por-identidad.mts --ids=<ids.json> --borrar --respaldo=<dir>
 *   npx tsx scripts/dev/borrar-por-identidad.mts --restaurar=<respaldo.json>
 *   npx tsx scripts/dev/borrar-por-identidad.mts --comparar-respaldos=<a.json>,<b.json>
 *
 * `<ids.json>` = `{ "avisos": ["..."], "leads": ["..."] }` (cualquiera puede faltar).
 */
import fs from 'fs'
import path from 'path'
import { config as loadEnv } from 'dotenv'
import type { Prisma as TiposPrisma } from '@prisma/client'
import { DEV_BRANCH_HOST } from './siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

const COLECCIONES = ['leads', 'dossiers', 'actividades', 'demos', 'metas', 'avisos'] as const
type Coleccion = (typeof COLECCIONES)[number]
type Fila = Record<string, unknown>
type Respaldo = { creado: string } & Record<Coleccion, Fila[]>

const QA_EMAIL = 'setter-qa@develop.test'
/** La copia exacta de `copyNovedad('LEAD_REASIGNADO_SALIENTE', …)` sobre el lead de 07-G1. */
const COPIA_FUGA_G1 = /^SMOKE-SETTER AsignaCaliente \d{13} pasó a otro setter\. Ya no está en tu cartera\.$/

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null
const flag = (nombre: string) => process.argv.includes(`--${nombre}`)

const valor = (v: unknown) => (v instanceof Date ? v.toISOString() : JSON.stringify(v))

/** Diferencias columna por columna entre dos conjuntos de filas, emparejadas por id. */
function diferencias(tabla: string, esperadas: readonly Fila[], actuales: readonly Fila[]): string[] {
  const act = new Map(actuales.map((f) => [String(f.id), f]))
  const difs: string[] = []
  for (const e of esperadas) {
    const a = act.get(String(e.id))
    if (!a) {
      difs.push(`${tabla} ${String(e.id)}: FALTA`)
      continue
    }
    for (const k of new Set([...Object.keys(e), ...Object.keys(a)])) {
      if (valor(e[k]) !== valor(a[k])) difs.push(`${tabla} ${String(e.id)} · ${k}: ${valor(e[k])} → ${valor(a[k])}`)
    }
  }
  if (actuales.length !== esperadas.length) difs.push(`${tabla}: ${esperadas.length} esperadas, ${actuales.length} encontradas`)
  return difs
}

/** El JSON guarda las fechas como string ISO: se reviven para reinsertar y comparar. */
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
  for (const c of COLECCIONES) {
    if (!Array.isArray(obj[c])) throw new Error(`respaldo sin la colección «${c}»: ${archivo}`)
  }
  const r = obj as unknown as Respaldo
  return {
    creado: String(obj.creado),
    leads: r.leads.map(revivir),
    dossiers: r.dossiers.map(revivir),
    actividades: r.actividades.map(revivir),
    demos: r.demos.map(revivir),
    metas: r.metas.map(revivir),
    avisos: r.avisos.map(revivir),
  }
}

function leerIds(archivo: string): { avisos: string[]; leads: string[] } {
  const crudo: unknown = JSON.parse(fs.readFileSync(archivo, 'utf8'))
  if (typeof crudo !== 'object' || crudo === null) throw new Error(`lista de ids ilegible: ${archivo}`)
  const obj = crudo as Record<string, unknown>
  const lista = (c: string): string[] => {
    const v = obj[c] ?? []
    if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) throw new Error(`«${c}» tiene que ser una lista de ids`)
    return [...new Set(v as string[])]
  }
  return { avisos: lista('avisos'), leads: lista('leads') }
}

async function main() {
  const { prisma } = await import('@/lib/prisma')
  const { Prisma } = await import('@prisma/client')

  /** Las filas de la base que corresponden a un respaldo (mismas ids, todas las colecciones). */
  const leerActuales = async (r: Respaldo): Promise<Record<Coleccion, Fila[]>> => {
    const ids = (c: Coleccion) => r[c].map((f) => String(f.id))
    const [leads, dossiers, actividades, demos, metas, avisos] = await Promise.all([
      prisma.osLead.findMany({ where: { id: { in: ids('leads') } } }),
      prisma.osLeadDossier.findMany({ where: { id: { in: ids('dossiers') } } }),
      prisma.osLeadActivity.findMany({ where: { id: { in: ids('actividades') } } }),
      prisma.osDemo.findMany({ where: { id: { in: ids('demos') } } }),
      prisma.osLeadSetterMeta.findMany({ where: { id: { in: ids('metas') } } }),
      prisma.osSetterNotice.findMany({ where: { id: { in: ids('avisos') } } }),
    ])
    return { leads, dossiers, actividades, demos, metas, avisos }
  }

  const comparar = arg('comparar-respaldos')
  if (comparar) {
    const [a, b] = comparar.split(',')
    if (!a || !b) throw new Error('--comparar-respaldos=<a.json>,<b.json>')
    const ra = leerRespaldo(a)
    const rb = leerRespaldo(b)
    const difs = COLECCIONES.flatMap((c) => diferencias(c, ra[c], rb[c]))
    for (const c of COLECCIONES) console.log(`  ${c.padEnd(12)} ${ra[c].length} vs ${rb[c].length}`)
    for (const d of difs) console.log(`  ${d}`)
    console.log(difs.length === 0 ? `IDÉNTICOS columna por columna` : `DISTINTOS: ${difs.length} diferencias`)
    process.exitCode = difs.length === 0 ? 0 : 1
    await prisma.$disconnect()
    return
  }

  const restaurar = arg('restaurar')
  if (restaurar) {
    const r = leerRespaldo(restaurar)
    const JSON_DOSSIER = ['fichaJson', 'evaluacionJson', 'briefJson', 'selfCheckJson', 'progresoJson', 'rechazos', 'agendaJson']
    // Json? nulo vuelve como NULL de base (así lo guarda el producto).
    const conDbNull = (fila: Fila) =>
      Object.fromEntries(Object.entries(fila).map(([k, v]) => [k, JSON_DOSSIER.includes(k) && v === null ? Prisma.DbNull : v]))
    // Las filas salieron de un findMany de estos mismos modelos; Prisma valida la forma en runtime.
    await prisma.$transaction([
      prisma.osLead.createMany({ data: r.leads as unknown as TiposPrisma.OsLeadCreateManyInput[] }),
      prisma.osLeadDossier.createMany({ data: r.dossiers.map(conDbNull) as unknown as TiposPrisma.OsLeadDossierCreateManyInput[] }),
      prisma.osLeadActivity.createMany({ data: r.actividades as unknown as TiposPrisma.OsLeadActivityCreateManyInput[] }),
      prisma.osDemo.createMany({ data: r.demos as unknown as TiposPrisma.OsDemoCreateManyInput[] }),
      prisma.osLeadSetterMeta.createMany({ data: r.metas as unknown as TiposPrisma.OsLeadSetterMetaCreateManyInput[] }),
      prisma.osSetterNotice.createMany({ data: r.avisos as unknown as TiposPrisma.OsSetterNoticeCreateManyInput[] }),
    ])
    const actuales = await leerActuales(r)
    const difs = COLECCIONES.flatMap((c) => diferencias(c, r[c], actuales[c]))
    console.log(`restaurado: ${COLECCIONES.map((c) => `${r[c].length} ${c}`).join(' · ')}`)
    for (const d of difs) console.log(`  ${d}`)
    console.log(difs.length === 0 ? 'VUELTA EXACTA: la base coincide con el respaldo columna por columna' : `VUELTA INEXACTA: ${difs.length} diferencias`)
    process.exitCode = difs.length === 0 ? 0 : 1
    await prisma.$disconnect()
    return
  }

  const archivoIds = arg('ids')
  if (!archivoIds) throw new Error('falta --ids=<ids.json> (o --restaurar / --comparar-respaldos)')
  const pedido = leerIds(archivoIds)
  const leadIds = pedido.leads

  const [leads, dossiers, actividades, demos, metas, avisosDeLeads, avisosPedidos, proyectos] = await Promise.all([
    prisma.osLead.findMany({ where: { id: { in: leadIds } } }),
    prisma.osLeadDossier.findMany({ where: { leadId: { in: leadIds } } }),
    prisma.osLeadActivity.findMany({ where: { leadId: { in: leadIds } } }),
    prisma.osDemo.findMany({ where: { leadId: { in: leadIds } } }),
    prisma.osLeadSetterMeta.findMany({ where: { leadId: { in: leadIds } } }),
    prisma.osSetterNotice.findMany({ where: { leadId: { in: leadIds } } }),
    prisma.osSetterNotice.findMany({ where: { id: { in: pedido.avisos } } }),
    prisma.project.count({ where: { osLeadId: { in: leadIds } } }),
  ])
  const avisos = [...new Map([...avisosDeLeads, ...avisosPedidos].map((v) => [v.id, v])).values()]

  console.log(`pedido: ${pedido.avisos.length} avisos · ${leadIds.length} leads`)
  console.log(
    `encontrado: ${avisosPedidos.length} avisos pedidos · ${leads.length} leads (+ ${dossiers.length} dossiers · ` +
      `${actividades.length} actividades · ${demos.length} demos · ${metas.length} metas · ${avisosDeLeads.length} avisos de esos leads) · ${proyectos} proyectos`,
  )
  const faltan = [
    ...pedido.avisos.filter((id) => !avisosPedidos.some((v) => v.id === id)).map((id) => `aviso ${id}`),
    ...leadIds.filter((id) => !leads.some((l) => l.id === id)).map((id) => `lead ${id}`),
  ]
  if (faltan.length > 0) {
    console.error(`ABORT: ${faltan.length} ids no existen (${faltan.slice(0, 5).join(', ')}…): la identidad no es la censada.`)
    process.exit(1)
  }
  if (proyectos > 0) {
    console.error('ABORT: hay leads vinculados a un Project — eso no es un artefacto.')
    process.exit(1)
  }
  if (flag('esperar-aviso-fuga-g1')) {
    const qa = await prisma.user.findUniqueOrThrow({ where: { email: QA_EMAIL }, select: { id: true } })
    const ajenos = avisosPedidos.filter(
      (v) => v.setterId !== qa.id || v.kind !== 'LEAD_REASIGNADO_SALIENTE' || v.leadId !== null || !COPIA_FUGA_G1.test(v.body),
    )
    if (ajenos.length > 0) {
      console.error(`ABORT: ${ajenos.length} avisos de la lista ya no son la copia de la fuga (${ajenos[0]?.id}).`)
      process.exit(1)
    }
    console.log(`control: los ${avisosPedidos.length} avisos siguen siendo la copia exacta de la fuga de 07-G1`)
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
  const respaldo: Respaldo = { creado: new Date().toISOString(), leads, dossiers, actividades, demos, metas, avisos }
  fs.writeFileSync(archivo, JSON.stringify(respaldo))
  const releido = leerRespaldo(archivo)
  const incompletas = COLECCIONES.flatMap((c) => diferencias(c, respaldo[c], releido[c]))
  if (incompletas.length > 0) {
    console.error(`ABORT: el respaldo no se relee igual (${incompletas.length} diferencias).`)
    process.exit(1)
  }
  console.log(`respaldo → ${archivo}`)

  // Avisos primero: con onDelete SetNull, borrar el lead los dejaría huérfanos con
  // leadId null — exactamente la clase de fila que este sprint persigue.
  const [avisosBorrados, leadsBorrados] = await prisma.$transaction([
    prisma.osSetterNotice.deleteMany({ where: { id: { in: avisos.map((v) => v.id) } } }),
    prisma.osLead.deleteMany({ where: { id: { in: leadIds } } }),
  ])
  console.log(`borrados: ${avisosBorrados.count} avisos · ${leadsBorrados.count} leads`)
  if (avisosBorrados.count !== avisos.length || leadsBorrados.count !== leads.length) {
    console.error('ATENCIÓN: se borraron más o menos filas de las respaldadas.')
    process.exitCode = 1
  }
  await prisma.$disconnect()
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
