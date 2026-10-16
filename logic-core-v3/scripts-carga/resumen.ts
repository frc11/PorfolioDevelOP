/**
 * [CIERRE A-ter] A13 · EL RESUMEN DE UNA TANDA DEL ARNÉS (`estres.ts`): la tasa de fallos por escenario (la condición, la carga, el momento
 * del clic, el ítem, los dos clics seguidos, el contexto perdido), en lo estricto (1,5 s después de llegar), en lo que se quedó (5,5 s) y
 * después de scrollear; cuántas veces cada tipo de falla, los clics que fueron el salto nativo, los avisos del perro guardián y los errores
 * de la consola. Con `RECIBO=<ruta>` escribe el recibo que lee s75 (`docs/rediseno/entregas/cierre-a-ter/`).
 *
 *   npx tsx scripts-carga/resumen.ts ~/.cache/b4-medicion/cierre-a-ter/carga/build-antes.jsonl [otra.jsonl …]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

interface Falla {
  readonly tipo: string
  readonly id: string
  readonly detalle: string
}
interface Revision {
  readonly fallas: readonly Falla[]
}
interface Evento {
  readonly que: string
  readonly id: string
  readonly dato: string
}
interface Corrida {
  readonly tipo: 'corrida'
  readonly n: number
  readonly carga: string
  readonly condicion: string
  readonly item: string
  readonly segundo: string | null
  readonly momentoMs: number
  readonly error?: string
  readonly estricto?: Revision | null
  readonly persistente?: Revision | null
  readonly trasScroll?: Revision | null
  readonly errores?: readonly string[]
  readonly avisos?: number
  readonly eventos?: readonly Evento[]
  readonly fondo?: string | null
}

const fallo = (r: Revision | null | undefined): boolean => r === null || r === undefined || r.fallas.length > 0

export interface Tasa {
  readonly corridas: number
  readonly estricto: number
  readonly persistente: number
  readonly trasScroll: number
}

function tasas(cs: readonly Corrida[]): Tasa {
  const ok = cs.filter((c) => c.error === undefined)
  return { corridas: ok.length, estricto: ok.filter((c) => fallo(c.estricto)).length, persistente: ok.filter((c) => fallo(c.persistente)).length, trasScroll: ok.filter((c) => fallo(c.trasScroll)).length }
}

function porDimension(cs: readonly Corrida[], clave: (c: Corrida) => string): Record<string, Tasa> {
  const grupos = new Map<string, Corrida[]>()
  for (const c of cs) grupos.set(clave(c), [...(grupos.get(clave(c)) ?? []), c])
  return Object.fromEntries([...grupos].map(([k, v]) => [k, tasas(v)]))
}

function tipos(cs: readonly Corrida[], de: (c: Corrida) => Revision | null | undefined): Record<string, number> {
  const cuenta: Record<string, number> = {}
  for (const c of cs) for (const t of new Set((de(c)?.fallas ?? []).map((f) => f.tipo))) cuenta[t] = (cuenta[t] ?? 0) + 1
  return cuenta
}

export interface ResumenDeLaTanda {
  readonly archivo: string
  readonly modo: string
  readonly tanda: string
  readonly gpu: string
  readonly total: Tasa
  readonly errores: number
  readonly porCondicion: Record<string, Tasa>
  readonly porCarga: Record<string, Tasa>
  readonly porMomento: Record<string, Tasa>
  readonly porItem: Record<string, Tasa>
  readonly dobles: Tasa
  readonly tipos: { readonly estricto: Record<string, number>; readonly persistente: Record<string, number>; readonly trasScroll: Record<string, number> }
  readonly clicsNativos: number
  readonly avisosDelGuardian: number
  readonly erroresDeConsola: number
  readonly ejemplos: readonly string[]
}

export function resumir(archivo: string): ResumenDeLaTanda {
  const filas = readFileSync(archivo, 'utf8').split('\n').filter((l) => l.trim() !== '').map((l) => JSON.parse(l) as { tipo: string } & Record<string, unknown>)
  const cabeza = filas.find((f) => f.tipo === 'tanda') ?? {}
  const cs = filas.filter((f): f is Corrida & { tipo: 'corrida' } & Record<string, unknown> => f.tipo === 'corrida') as unknown as Corrida[]
  const simples = cs.filter((c) => c.segundo === null)
  const ejemplos = cs
    .filter((c) => fallo(c.persistente) || fallo(c.estricto))
    .slice(0, 12)
    .map((c) => `#${String(c.n)} ${c.condicion}/${c.carga}/${String(c.momentoMs)}ms/${c.item}${c.segundo === null ? '' : `+${c.segundo}`}: ${(c.estricto?.fallas ?? []).map((f) => `${f.tipo}(${f.id}: ${f.detalle})`).join(' · ').slice(0, 300)}`)
  return {
    archivo: path.basename(archivo),
    modo: String((cabeza as Record<string, unknown>).modo ?? '?'),
    tanda: String((cabeza as Record<string, unknown>).tanda ?? '?'),
    gpu: String((cabeza as Record<string, unknown>).gpu ?? '?'),
    total: tasas(cs),
    errores: cs.filter((c) => c.error !== undefined).length,
    porCondicion: porDimension(cs, (c) => c.condicion),
    porCarga: porDimension(simples, (c) => c.carga),
    porMomento: porDimension(simples, (c) => String(c.momentoMs)),
    porItem: porDimension(simples, (c) => c.item),
    dobles: tasas(cs.filter((c) => c.segundo !== null)),
    tipos: { estricto: tipos(cs, (c) => c.estricto), persistente: tipos(cs, (c) => c.persistente), trasScroll: tipos(cs, (c) => c.trasScroll) },
    clicsNativos: cs.filter((c) => (c.eventos ?? []).some((e) => e.que === 'clic' && e.dato === 'NATIVO')).length,
    avisosDelGuardian: cs.reduce((a, c) => a + (c.avisos ?? 0), 0),
    erroresDeConsola: cs.reduce((a, c) => a + (c.errores?.length ?? 0), 0),
    ejemplos,
  }
}

const pct = (t: Tasa, k: 'estricto' | 'persistente' | 'trasScroll'): string => (t.corridas === 0 ? '—' : `${String(t[k])}/${String(t.corridas)} (${Math.round((100 * t[k]) / t.corridas)} %)`)

export function tabla(titulo: string, filas: Record<string, Tasa>): string {
  const lineas = [`| ${titulo} | corridas | a 1,5 s | a 5,5 s | tras scrollear |`, '|---|---|---|---|---|']
  for (const [k, t] of Object.entries(filas)) lineas.push(`| ${k} | ${String(t.corridas)} | ${pct(t, 'estricto')} | ${pct(t, 'persistente')} | ${pct(t, 'trasScroll')} |`)
  return lineas.join('\n')
}

function main(): void {
  const archivos = process.argv.slice(2)
  const resumenes = archivos.map(resumir)
  for (const r of resumenes) {
    console.log(`\n## ${r.modo} · ${r.tanda} (${r.archivo}) · ${r.gpu}`)
    console.log(`total: ${pct(r.total, 'estricto')} a 1,5 s · ${pct(r.total, 'persistente')} a 5,5 s · ${pct(r.total, 'trasScroll')} tras scrollear · ${String(r.errores)} corridas con error del arnés`)
    console.log(`clics que fueron el salto nativo: ${String(r.clicsNativos)} · avisos del guardián: ${String(r.avisosDelGuardian)} · errores de la consola: ${String(r.erroresDeConsola)}`)
    console.log(tabla('condición', r.porCondicion))
    console.log(tabla('carga', r.porCarga))
    console.log(tabla('momento del clic (ms)', r.porMomento))
    console.log(tabla('ítem', r.porItem))
    console.log(tabla('dos clics seguidos', { 'en < 500 ms': r.dobles }))
    console.log('tipos (a 1,5 s):', JSON.stringify(r.tipos.estricto))
    console.log('tipos (a 5,5 s):', JSON.stringify(r.tipos.persistente))
    console.log('tipos (tras scrollear):', JSON.stringify(r.tipos.trasScroll))
    for (const e of r.ejemplos) console.log(`  ${e}`)
  }
  const recibo = process.env.RECIBO
  if (recibo !== undefined) {
    mkdirSync(path.dirname(recibo), { recursive: true })
    writeFileSync(recibo, `${JSON.stringify(resumenes, null, 1)}\n`)
    console.log(`recibo: ${recibo}`)
  }
}

if (process.argv[1]?.endsWith('resumen.ts')) main()
