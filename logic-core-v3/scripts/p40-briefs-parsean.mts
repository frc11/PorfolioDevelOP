/**
 * P40 · ¿QUÉ BRIEFS PARSEAN? — solo lectura. Branch Neon dev, y nada más.
 *
 * La regla 1 del sprint dice que ningún brief guardado puede dejar de parsear.
 * Probarlo con un brief de ejemplo prueba ese ejemplo; esto lo prueba con TODOS
 * los que hay en la base: corre la lectura del producto (`parseBrief`) sobre cada
 * `briefJson` y anota, por lead, si parsea y qué objeto devuelve. Se corre con el
 * código de partida y con el código nuevo, y `--comparar` exige que todo lo que
 * parseaba siga parseando y devuelva lo mismo.
 *
 * Uso:
 *   npx tsx scripts/p40-briefs-parsean.mts --salida=C:/tmp/p40-brief/fase1/parsean-antes.json
 *   npx tsx scripts/p40-briefs-parsean.mts --comparar=<antes.json>,<despues.json>
 */
import fs from 'fs'
import { isDeepStrictEqual } from 'node:util'
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null

type Fila = { leadId: string; parsea: boolean; claves: string[]; leido: unknown }
type Foto = { medidoEn: string; filas: Fila[] }

function comparar(a: Foto, b: Foto): number {
  const despues = new Map(b.filas.map((f) => [f.leadId, f]))
  let roturas = 0
  let iguales = 0
  for (const fa of a.filas) {
    const fb = despues.get(fa.leadId)
    if (!fb) {
      console.log(`  (el lead ${fa.leadId} ya no está en la base — no cuenta)`)
      continue
    }
    if (fa.parsea && !fb.parsea) {
      roturas++
      console.log(`  ROTO ${fa.leadId}: parseaba y dejó de parsear`)
      continue
    }
    if (fa.parsea && !isDeepStrictEqual(fa.leido, fb.leido)) {
      roturas++
      console.log(`  DISTINTO ${fa.leadId}: parsea, pero devuelve otro objeto`)
      continue
    }
    if (fa.parsea === fb.parsea) iguales++
  }
  const parseabanAntes = a.filas.filter((f) => f.parsea).length
  console.log(
    `briefs en la base: ${a.filas.length} → ${b.filas.length} · parseaban antes ${parseabanAntes} · ` +
      `siguen igual ${iguales} · roturas ${roturas}`,
  )
  return roturas
}

async function main() {
  const par = arg('comparar')
  if (par) {
    const [fa, fb] = par.split(',')
    const leer = (f: string) => JSON.parse(fs.readFileSync(f, 'utf8')) as Foto
    process.exitCode = comparar(leer(fa!), leer(fb!)) === 0 ? 0 : 1
    return
  }

  const url = process.env.DATABASE_URL
  if (!url?.includes(DEV_BRANCH_HOST)) {
    console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
    process.exit(1)
  }
  const { prisma } = await import('@/lib/prisma')
  const { parseBrief } = await import('@/lib/leados/flow')

  const dossiers = await prisma.osLeadDossier.findMany({
    where: { briefJson: { not: { equals: null } } },
    select: { leadId: true, briefJson: true },
    orderBy: { leadId: 'asc' },
  })
  await prisma.$disconnect()

  const filas: Fila[] = dossiers
    .filter((d) => d.briefJson !== null)
    .map((d) => {
      const leido = parseBrief(d.briefJson)
      const crudo = d.briefJson as Record<string, unknown>
      return {
        leadId: d.leadId,
        parsea: leido !== null,
        claves: Object.keys(crudo ?? {}).sort(),
        // JSON ida y vuelta: lo que se compara es el dato, no la identidad del objeto.
        leido: leido === null ? null : JSON.parse(JSON.stringify(leido)),
      }
    })

  const parsean = filas.filter((f) => f.parsea).length
  const formas = new Map<string, number>()
  for (const f of filas) formas.set(f.claves.join(','), (formas.get(f.claves.join(',')) ?? 0) + 1)
  console.log(`${filas.length} briefs guardados · parsean ${parsean} · no parsean ${filas.length - parsean}`)
  for (const [claves, n] of formas) console.log(`  ${n} × {${claves}}`)

  const destino = arg('salida')
  if (destino) {
    fs.writeFileSync(destino, JSON.stringify({ medidoEn: new Date().toISOString(), filas }, null, 2))
    console.log(`→ ${destino}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
