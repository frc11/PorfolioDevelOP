/**
 * P41 · LAS CINCO SUPERFICIES DEL PANEL, LEAD POR LEAD — solo lectura. Branch Neon dev.
 *
 * La pregunta del sprint: recortar la consulta de la cartera (`listOwnedLeads`),
 * ¿cambia algo de lo que el panel del setter muestra? Se contesta sin mirar la
 * consulta: se mira lo que CADA superficie recibe, armado por la misma cadena de
 * llamadas que `src/app/(protected)/setter/page.tsx`:
 *
 *   · el foco        — `seleccionarFoco` (sin cookie y con cada lead como sticky)
 *   · la cola        — `armarCola` (cada ítem con su lead, su motivo y su próximo paso)
 *   · la cartera     — los `HomeLead` que recibe `CarteraView`, agrupados con
 *                      `agruparCartera` en los cuatro órdenes que ofrece
 *   · los avisos     — `getNovedadesSetter` con el dedup contra la cola y los estados
 *   · los contadores — `derivarMisNumeros`, `getProgresoSemana`,
 *                      `contarEnVueloPorTurno`, pausados y fijados
 *
 * Para TODOS los setters con leads, no una muestra.
 *
 * ── El reloj ────────────────────────────────────────────────────────────────
 * La cadena lee la hora (vencimientos, pausas, «hace 3 h», la ventana de 7 días).
 * Dos fotos sacadas con horas de diferencia pueden diferir sin que el código haya
 * cambiado. Por eso el reloj se CONGELA antes de importar nada: la foto de partida
 * anota su instante, y la de después se saca con `--ahora=<ese instante>`. Con los
 * mismos datos y el mismo reloj, la única variable que queda es el código.
 *
 * ── Los datos ───────────────────────────────────────────────────────────────
 * Cada foto guarda también lo que la cadena LEE de cada fila (los campos del censo
 * de P41), para poder afirmar que los datos no se movieron entre las dos fotos:
 * si se movieron, la comparación de superficies no prueba nada y se dice.
 *
 * Uso:
 *   npx tsx scripts/p41-superficies.mts --salida=C:/tmp/p41-consulta/sup-antes.json
 *   npx tsx scripts/p41-superficies.mts --salida=... --ahora=2026-09-14T22:00:00.000Z
 *   npx tsx scripts/p41-superficies.mts --comparar=<a.json>,<b.json>
 */
import fs from 'fs'
import path from 'path'
import { isDeepStrictEqual } from 'node:util'
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null

/** Los campos del dossier que la cadena del panel lee (censo P41). */
const DOSSIER_LEIDO = ['stage', 'fichaJson', 'evaluacionJson', 'rechazos', 'agendaJson', 'finalUrl', 'enviadaAt', 'updatedAt'] as const
/** Los campos del lead que la cadena del panel lee. */
const LEAD_LEIDO = ['id', 'businessName', 'industry', 'zone', 'status', 'caliente', 'createdAt', 'nextFollowUpAt', 'reactivateAt'] as const

type Json = null | boolean | number | string | Json[] | { [k: string]: Json }
type FotoSetter = {
  setterId: string
  email: string
  filas: number
  clavesDelLead: string[]
  clavesDelDossier: string[]
  datos: Record<string, Json>
  superficies: Record<string, Json>
}
type Foto = { ahora: string; medidoEn: string; host: string; setters: FotoSetter[] }

/** Congela `Date.now()` y `new Date()` sin argumentos. Se instala ANTES de importar la app. */
function congelarReloj(t0: number): void {
  const Real = Date
  class Congelado extends Real {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(t0)
      else super(...(args as [number]))
    }
    static override now(): number {
      return t0
    }
  }
  globalThis.Date = Congelado as unknown as DateConstructor
}

/** JSON estable: fechas a ISO, claves ordenadas. Es lo que se compara. */
function aJson(valor: unknown): Json {
  if (valor === null || valor === undefined) return null
  if (valor instanceof Date) return valor.toISOString()
  if (Array.isArray(valor)) return valor.map(aJson)
  if (typeof valor === 'object') {
    const salida: { [k: string]: Json } = {}
    for (const k of Object.keys(valor as object).sort()) {
      const v = (valor as Record<string, unknown>)[k]
      if (v !== undefined) salida[k] = aJson(v)
    }
    return salida
  }
  if (typeof valor === 'bigint') return valor.toString()
  return valor as Json
}

async function fotografiar(ahora: number): Promise<Foto> {
  const url = process.env.DATABASE_URL
  if (!url?.includes(DEV_BRANCH_HOST)) {
    console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
    process.exit(1)
  }
  const medidoEn = new Date().toISOString() // el reloj real, antes de congelarlo
  congelarReloj(ahora)

  const { prisma } = await import('@/lib/prisma')
  const { listOwnedLeads } = await import('@/lib/leados/ownership')
  const { buildHomeLeads } = await import('@/lib/leados/home')
  const flow = await import('@/lib/leados/flow')
  const { seleccionarFoco } = await import('@/lib/leados/foco')
  const { armarCola, idsEnCola } = await import('@/lib/leados/cola')
  const { derivarMisNumeros } = await import('@/lib/leados/mis-numeros')
  const { getNovedadesSetter } = await import('@/lib/leados/novedades')
  const { getProgresoSemana } = await import('@/lib/leados/progreso')

  const duenos = await prisma.osLead.groupBy({ by: ['assignedToId'], where: { assignedToId: { not: null } } })
  const usuarios = await prisma.user.findMany({
    where: { id: { in: duenos.map((d) => d.assignedToId).filter((x): x is string => x !== null) } },
    select: { id: true, email: true },
    orderBy: { email: 'asc' },
  })

  const setters: FotoSetter[] = []
  for (const u of usuarios) {
    const leads = await listOwnedLeads(u.id)

    // Lo que la cadena lee de cada fila, para afirmar que los datos no se movieron.
    const datos: Record<string, Json> = {}
    for (const l of leads) {
      const fila = l as unknown as Record<string, unknown>
      const d = (l.dossier ?? null) as Record<string, unknown> | null
      datos[l.id] = aJson({
        lead: Object.fromEntries(LEAD_LEIDO.map((k) => [k, fila[k]])),
        contactos: l._count.activities,
        metas: l.setterMetas.map((m) => ({ setterId: m.setterId, pinned: m.pinned, snoozedUntil: m.snoozedUntil, note: m.note })),
        dossier: d === null ? null : Object.fromEntries(DOSSIER_LEIDO.map((k) => [k, d[k]])),
      })
    }

    // La cadena del page, en el mismo orden.
    const homeLeads = buildHomeLeads(leads)
    const particion = flow.particionarCartera(homeLeads)
    const foco = seleccionarFoco(particion.grupos.trabajar, null)
    const cola = armarCola(foco.foco, foco.resto)
    const enVuelo = [...particion.grupos.seguimiento, ...particion.grupos.revision, ...particion.grupos.agendadas]
    const enVueloPorTurno = flow.contarEnVueloPorTurno(enVuelo)
    const misNumeros = derivarMisNumeros(leads, u.id)
    const [novedades, progreso] = await Promise.all([
      getNovedadesSetter(u.id, leads, { excludeLeadIds: idsEnCola(cola), estados: homeLeads }),
      getProgresoSemana(u.id, leads),
    ])

    // El foco con cada accionable como sticky (la cookie que deja «Ir a trabajarlo»).
    const focoPorSticky = particion.grupos.trabajar.map((l) => {
      const f = seleccionarFoco(particion.grupos.trabajar, l.id)
      return { sticky: l.id, foco: f.foco?.id ?? null, proximo: f.proximo?.id ?? null, stickyActivo: f.stickyActivo, restantes: f.restantes }
    })
    const ids = (xs: readonly { id: string }[]) => xs.map((x) => x.id)
    const ORDENES = ['urgencia', 'reciente', 'antiguo', 'alfabetico'] as const
    const cartera = Object.fromEntries(
      ORDENES.map((orden) => [
        orden,
        flow
          .agruparCartera(flow.filtrarYOrdenarCartera(homeLeads, '', 'todos', orden))
          .map((g) => ({ vista: g.vista, label: g.label, conteo: g.leads.length, leads: ids(g.leads) })),
      ]),
    )
    const porLead = homeLeads.map((l) => ({
      id: l.id,
      nombre: l.businessName,
      grupo: l.grupo,
      vista: flow.vistaDeLead(l),
      accionable: l.accionable,
      proximaAccion: l.proximaAccion,
      motivo: flow.motivoOrden(l),
      archivo: flow.archivoMotivo(l),
      puestoEnCola: cola.items.findIndex((i) => i.lead.id === l.id),
    }))

    setters.push({
      setterId: u.id,
      email: u.email,
      filas: leads.length,
      clavesDelLead: leads.length ? Object.keys(leads[0]!).sort() : [],
      clavesDelDossier: [...new Set(leads.flatMap((l) => (l.dossier ? Object.keys(l.dossier) : [])))].sort(),
      datos,
      superficies: aJson({
        foco: {
          foco: foco.foco?.id ?? null,
          proximo: foco.proximo?.id ?? null,
          resto: ids(foco.resto),
          restantes: foco.restantes,
          total: foco.total,
          stickyActivo: foco.stickyActivo,
          rotulo: cola.items[0]?.motivo ?? null,
        },
        focoPorSticky,
        cola,
        cartera: { homeLeads, porLead, grupos: cartera },
        particion: {
          grupos: Object.fromEntries(Object.entries(particion.grupos).map(([k, v]) => [k, ids(v)])),
          fijados: ids(particion.fijados),
          pausados: ids(particion.pausados),
        },
        avisos: novedades,
        contadores: {
          misNumeros,
          progreso,
          enVueloPorTurno,
          pausados: particion.pausados.length,
          fijados: particion.fijados.length,
        },
      }) as Record<string, Json>,
    })
  }
  await prisma.$disconnect()
  return { ahora: new Date(ahora).toISOString(), medidoEn, host: new URL(url).hostname, setters }
}

/** Diferencias entre dos JSON, con la ruta de cada una. */
function diferencias(a: Json, b: Json, ruta: string, salida: string[]): void {
  if (isDeepStrictEqual(a, b)) return
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    for (const k of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
      diferencias(a[k] ?? null, b[k] ?? null, `${ruta}.${k}`, salida)
    }
    return
  }
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    a.forEach((x, i) => diferencias(x, b[i]!, `${ruta}[${i}]`, salida))
    return
  }
  salida.push(`${ruta}: ${JSON.stringify(a)?.slice(0, 160)} → ${JSON.stringify(b)?.slice(0, 160)}`)
}

function comparar(a: Foto, b: Foto): number {
  console.log(`A: reloj ${a.ahora} (medido ${a.medidoEn}) · B: reloj ${b.ahora} (medido ${b.medidoEn}) · host ${a.host === b.host ? a.host : `${a.host} ≠ ${b.host}`}`)
  if (a.ahora !== b.ahora) console.log('  ⚠ los relojes difieren: una diferencia puede ser del reloj y no del código')
  let problemas = 0
  const porId = new Map(b.setters.map((s) => [s.setterId, s]))
  if (a.setters.length !== b.setters.length) {
    console.log(`  ✗ setters: ${a.setters.length} → ${b.setters.length}`)
    problemas += 1
  }
  let leadsTotal = 0
  for (const sa of a.setters) {
    const sb = porId.get(sa.setterId)
    if (!sb) {
      console.log(`  ✗ ${sa.email}: no está en B`)
      problemas += 1
      continue
    }
    leadsTotal += sa.filas
    const difDatos: string[] = []
    diferencias(sa.datos, sb.datos, 'datos', difDatos)
    const difSup: string[] = []
    for (const k of [...new Set([...Object.keys(sa.superficies), ...Object.keys(sb.superficies)])].sort()) {
      diferencias(sa.superficies[k] ?? null, sb.superficies[k] ?? null, k, difSup)
    }
    const porSuperficie = (p: string) => difSup.filter((d) => d.startsWith(p)).length
    console.log(
      `${sa.email} · ${sa.filas} → ${sb.filas} leads · dossier ${sa.clavesDelDossier.length} → ${sb.clavesDelDossier.length} claves · ` +
        `datos ${difDatos.length === 0 ? 'iguales' : `${difDatos.length} DIFERENCIAS`} · ` +
        `foco ${porSuperficie('foco')} · cola ${porSuperficie('cola')} · cartera ${porSuperficie('cartera')} · ` +
        `particion ${porSuperficie('particion')} · avisos ${porSuperficie('avisos')} · contadores ${porSuperficie('contadores')}`,
    )
    for (const d of difDatos.slice(0, 20)) console.log(`    datos: ${d}`)
    for (const d of difSup.slice(0, 40)) console.log(`    ✗ ${d}`)
    problemas += difSup.length + difDatos.length
  }
  const clavesA = [...new Set(a.setters.flatMap((s) => s.clavesDelDossier))].sort()
  const clavesB = [...new Set(b.setters.flatMap((s) => s.clavesDelDossier))].sort()
  console.log(`claves del dossier A (${clavesA.length}): ${clavesA.join(' ')}`)
  console.log(`claves del dossier B (${clavesB.length}): ${clavesB.join(' ')}`)
  console.log(`se fueron: ${clavesA.filter((k) => !clavesB.includes(k)).join(' ') || '—'} · llegaron: ${clavesB.filter((k) => !clavesA.includes(k)).join(' ') || '—'}`)
  console.log(`${a.setters.length} setters · ${leadsTotal} leads comparados · ${problemas === 0 ? 'CERO diferencias' : `${problemas} diferencias`}`)
  return problemas
}

async function main() {
  const par = arg('comparar')
  if (par) {
    const [fa, fb] = par.split(',')
    const leer = (f: string) => JSON.parse(fs.readFileSync(f, 'utf8')) as Foto
    process.exitCode = comparar(leer(fa!), leer(fb!)) === 0 ? 0 : 1
    return
  }
  const ahoraArg = arg('ahora')
  const ahora = ahoraArg ? new Date(ahoraArg).getTime() : Date.now()
  const foto = await fotografiar(ahora)
  for (const s of foto.setters) {
    const sup = s.superficies as { cola: { items: unknown[]; total: number }; avisos: { filas: unknown[] } }
    console.log(`${s.email}: ${s.filas} leads · cola ${sup.cola.items.length}/${sup.cola.total} · avisos ${sup.avisos.filas.length} · dossier con ${s.clavesDelDossier.length} claves`)
  }
  const salida = arg('salida')
  if (salida) {
    fs.mkdirSync(path.dirname(salida), { recursive: true })
    fs.writeFileSync(salida, JSON.stringify(foto, null, 1))
    console.log(`reloj ${foto.ahora} → ${salida}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
