/**
 * P39 · CENSO DE LA BASE — solo lectura. Branch Neon dev, y nada más.
 *
 * La foto contra la que se mide toda fuga del sprint: si una corrida deja filas,
 * la diferencia entre dos fotos las nombra por id. Tres niveles:
 *
 *   1. las 63 tablas del schema, contadas (lo que ninguna categoría prevé
 *      aparece acá primero);
 *   2. leads, usuarios y avisos con su id y lo mínimo para reconocerlos, por
 *      categoría;
 *   3. el panel de Novedades de `setter-qa`, con la MISMA llamada que el page:
 *      qué avisos lee (los 50 sin leer más nuevos) y cuáles dibuja.
 *
 * Las categorías de avisos son para CONTAR, no para borrar: el borrado del
 * sprint va por id (`scripts/dev/borrar-por-identidad.mts`).
 *
 * Uso:
 *   npx tsx scripts/p39-censo-base.mts --salida=C:/tmp/p39-fugas/censo/f0.json
 *   npx tsx scripts/p39-censo-base.mts --comparar=<a.json>,<b.json>
 */
import fs from 'fs'
import path from 'path'
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST, categoriaDe } from './dev/siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null

const QA_EMAIL = 'setter-qa@develop.test'

/** El aviso que deja `07-admin-assign-caliente` G1: la copia exacta de `copyNovedad`. */
const FUGA_G1 = /^SMOKE-SETTER AsignaCaliente (\d{13}) pasó a otro setter\. Ya no está en tu cartera\.$/

type AvisoFoto = {
  id: string
  destinatario: string
  kind: string
  leadId: string | null
  read: boolean
  createdAt: string
  categoria: string
  body: string
}
type Foto = {
  medidoEn: string
  host: string
  modelos: Record<string, number>
  leads: { id: string; businessName: string; categoria: string; assignedToId: string | null }[]
  usuarios: { id: string; email: string }[]
  avisos: AvisoFoto[]
  panelQa: {
    sinLeer: number
    leidos: { puesto: number; id: string; categoria: string }[]
    filasDibujadas: { kind: string; cantidad: number; leadId: string | null; vigente: boolean }[]
    ocultos: number
  }
}

function comparar(a: Foto, b: Foto): void {
  console.log(`A ${a.medidoEn} · B ${b.medidoEn} · host ${a.host === b.host ? a.host : `${a.host} ≠ ${b.host}`}`)
  const deltas = Object.keys({ ...a.modelos, ...b.modelos })
    .map((m) => [m, (b.modelos[m] ?? 0) - (a.modelos[m] ?? 0)] as const)
    .filter(([, d]) => d !== 0)
  console.log(`tablas con delta: ${deltas.length === 0 ? 'ninguna' : deltas.map(([m, d]) => `${m} ${d > 0 ? '+' : ''}${d}`).join(' · ')}`)
  const dif = <T extends { id: string }>(nombre: string, xs: T[], ys: T[], fmt: (x: T) => string) => {
    const ida = new Set(xs.map((x) => x.id))
    const idb = new Set(ys.map((y) => y.id))
    const altas = ys.filter((y) => !ida.has(y.id))
    const bajas = xs.filter((x) => !idb.has(x.id))
    console.log(`${nombre}: ${xs.length} → ${ys.length} · altas ${altas.length} · bajas ${bajas.length}`)
    for (const x of altas) console.log(`  + ${fmt(x)}`)
    for (const x of bajas) console.log(`  - ${fmt(x)}`)
  }
  dif('leads', a.leads, b.leads, (l) => `${l.id} ${l.categoria} «${l.businessName}»`)
  dif('usuarios', a.usuarios, b.usuarios, (u) => `${u.id} ${u.email}`)
  dif('avisos', a.avisos, b.avisos, (v) => `${v.id} ${v.categoria} ${v.kind} → ${v.destinatario} «${v.body.slice(0, 70)}»`)
}

async function main() {
  const par = arg('comparar')
  if (par) {
    const [fa, fb] = par.split(',')
    const leer = (f: string) => JSON.parse(fs.readFileSync(f, 'utf8')) as Foto
    comparar(leer(fa), leer(fb))
    return
  }

  const url = process.env.DATABASE_URL
  if (!url?.includes(DEV_BRANCH_HOST)) {
    console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
    process.exit(1)
  }
  const host = new URL(url).hostname

  const { prisma } = await import('@/lib/prisma')
  const { Prisma } = await import('@prisma/client')

  // 1 · Todas las tablas. El delegado de cada modelo es su nombre en lowerCamel.
  const modelos: Record<string, number> = {}
  const delegados = prisma as unknown as Record<string, { count: () => Promise<number> }>
  for (const m of Prisma.dmmf.datamodel.models) {
    modelos[m.name] = await delegados[m.name.charAt(0).toLowerCase() + m.name.slice(1)].count()
  }

  // 2 · Leads, usuarios, avisos.
  const qa = await prisma.user.findUniqueOrThrow({ where: { email: QA_EMAIL }, select: { id: true } })
  const usuarios = await prisma.user.findMany({ select: { id: true, email: true }, orderBy: { id: 'asc' } })
  const emailDe = new Map(usuarios.map((u) => [u.id, u.email]))
  const etiqueta = (id: string) => {
    if (id === qa.id) return 'setter-qa'
    const email = emailDe.get(id) ?? '(sin usuario)'
    return email.startsWith('smoke-setter-') ? 'smoke-setter' : email
  }
  const leadsCrudos = await prisma.osLead.findMany({
    select: { id: true, businessName: true, assignedToId: true },
    orderBy: { id: 'asc' },
  })
  const leads = leadsCrudos.map((l) => ({ ...l, categoria: categoriaDe(l.businessName) }))
  const idsLead = new Set(leads.map((l) => l.id))

  const avisosCrudos = await prisma.osSetterNotice.findMany({ orderBy: { createdAt: 'desc' } })
  const avisos: AvisoFoto[] = avisosCrudos.map((v) => {
    const destinatario = etiqueta(v.setterId)
    const categoria =
      v.kind === 'LEAD_REASIGNADO_SALIENTE' && v.leadId === null && v.setterId === qa.id && FUGA_G1.test(v.body)
        ? 'FUGA_07_G1'
        : v.leadId === null
          ? 'SIN_LEAD'
          : idsLead.has(v.leadId)
            ? 'CON_LEAD'
            : 'LEAD_INEXISTENTE'
    return {
      id: v.id,
      destinatario,
      kind: v.kind,
      leadId: v.leadId,
      read: v.read,
      createdAt: v.createdAt.toISOString(),
      categoria,
      body: v.body,
    }
  })

  // 3 · El panel de setter-qa: la llamada del page (`setter/page.tsx`), sin cookie de foco.
  const { listOwnedLeads } = await import('@/lib/leados/ownership')
  const { buildHomeLeads } = await import('@/lib/leados/home')
  const { particionarCartera } = await import('@/lib/leados/flow')
  const { seleccionarFoco } = await import('@/lib/leados/foco')
  const { armarCola, idsEnCola } = await import('@/lib/leados/cola')
  const { getNovedadesSetter } = await import('@/lib/leados/novedades')
  const owned = await listOwnedLeads(qa.id)
  const home = buildHomeLeads(owned)
  const particion = particionarCartera(home)
  const foco = seleccionarFoco(particion.grupos.trabajar, null)
  const cola = armarCola(foco.foco, foco.resto)
  const vista = await getNovedadesSetter(qa.id, owned, { excludeLeadIds: idsEnCola(cola), estados: home })
  const sinLeerQa = avisos.filter((v) => v.destinatario === 'setter-qa' && !v.read)
  const panelQa: Foto['panelQa'] = {
    sinLeer: sinLeerQa.length,
    leidos: sinLeerQa.slice(0, 50).map((v, i) => ({ puesto: i + 1, id: v.id, categoria: v.categoria })),
    filasDibujadas: vista.filas.map((f) => ({ kind: f.kind, cantidad: f.cantidad, leadId: f.leadId, vigente: f.vigente })),
    ocultos: vista.ocultos,
  }

  const foto: Foto = {
    medidoEn: new Date().toISOString(),
    host,
    modelos,
    leads,
    usuarios,
    avisos,
    panelQa,
  }

  // Resumen legible.
  const contar = <T,>(xs: T[], clave: (x: T) => string) =>
    Object.fromEntries(
      [...xs.reduce((m, x) => m.set(clave(x), (m.get(clave(x)) ?? 0) + 1), new Map<string, number>())].sort(),
    )
  console.log(`host ${host} · ${Object.keys(modelos).length} tablas · OsLead ${leads.length} · User ${usuarios.length} · OsSetterNotice ${avisos.length}`)
  console.log(`leads por categoría: ${JSON.stringify(contar(leads, (l) => l.categoria))}`)
  console.log(`leads de setter-qa: ${leads.filter((l) => l.assignedToId === qa.id).length} · usuarios smoke-setter: ${usuarios.filter((u) => u.email.startsWith('smoke-setter-')).length}`)
  console.log(`avisos por categoría: ${JSON.stringify(contar(avisos, (v) => v.categoria))}`)
  console.log(`avisos por destinatario/categoría/kind: ${JSON.stringify(contar(avisos, (v) => `${v.destinatario}|${v.categoria}|${v.kind}|${v.read ? 'leido' : 'sin-leer'}`), null, 1)}`)
  const semilla = sinLeerQa.map((v, i) => ({ ...v, puesto: i + 1 })).filter((v) => v.categoria !== 'FUGA_07_G1')
  console.log(`panel setter-qa: ${sinLeerQa.length} sin leer · leídos ${panelQa.leidos.length} · no-fuga sin leer ${semilla.length}, dentro del tope ${semilla.filter((v) => v.puesto <= 50).length}`)
  for (const v of semilla) console.log(`  puesto ${v.puesto} · ${v.categoria} · ${v.kind} · ${v.puesto <= 50 ? 'dentro' : 'FUERA'} del tope · «${v.body.slice(0, 60)}»`)
  console.log(`filas dibujadas: ${panelQa.filasDibujadas.map((f) => `${f.kind}×${f.cantidad}`).join(' · ')} · ocultos ${panelQa.ocultos}`)

  const salida = arg('salida')
  if (salida) {
    fs.mkdirSync(path.dirname(salida), { recursive: true })
    fs.writeFileSync(salida, JSON.stringify(foto, null, 1))
    console.log(`foto → ${salida}`)
  }
  await prisma.$disconnect()
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
