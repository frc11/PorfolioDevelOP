/**
 * P40 · EL BLOQUE DE CONSTRUCCIÓN DE CADA LEAD REAL — solo lectura. Branch Neon dev.
 *
 * «Que el bloque siga armándose entero y que sus otras secciones no se muevan»
 * se prueba sobre los briefs que existen, no sobre uno de ejemplo: esto arma el
 * bloque de Claude Design de cada lead con brief —con la MISMA función y los
 * mismos datos que usa la pantalla— y guarda el texto. Corrido con el código de
 * partida y con el nuevo, `--comparar` exige que cada bloque salga idéntico byte
 * por byte: ningún brief guardado trae los campos nuevos, así que nada tendría
 * que moverse.
 *
 * Uso:
 *   npx tsx scripts/p40-bloque-golden.mts --salida=C:/tmp/p40-brief/fase1/bloques-antes.json
 *   npx tsx scripts/p40-bloque-golden.mts --comparar=<antes.json>,<despues.json>
 */
import fs from 'fs'
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null

type Foto = { medidoEn: string; bloques: Record<string, string> }

async function main() {
  const par = arg('comparar')
  if (par) {
    const [fa, fb] = par.split(',')
    const a = (JSON.parse(fs.readFileSync(fa!, 'utf8')) as Foto).bloques
    const b = (JSON.parse(fs.readFileSync(fb!, 'utf8')) as Foto).bloques
    let iguales = 0
    let distintos = 0
    for (const [leadId, texto] of Object.entries(a)) {
      if (!(leadId in b)) {
        console.log(`  (el lead ${leadId} ya no está — no cuenta)`)
        continue
      }
      if (b[leadId] === texto) iguales++
      else {
        distintos++
        console.log(`  DISTINTO ${leadId}`)
      }
    }
    console.log(`bloques: ${Object.keys(a).length} → ${Object.keys(b).length} · idénticos ${iguales} · distintos ${distintos}`)
    process.exitCode = distintos === 0 ? 0 : 1
    return
  }

  const url = process.env.DATABASE_URL
  if (!url?.includes(DEV_BRANCH_HOST)) {
    console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
    process.exit(1)
  }
  const { prisma } = await import('@/lib/prisma')
  const { parseBrief, parseFicha } = await import('@/lib/leados/flow')
  const { buildConstruccionBlock } = await import('@/lib/leados/copy-blocks')

  const leads = await prisma.osLead.findMany({
    where: { dossier: { briefJson: { not: { equals: null } } } },
    select: {
      id: true,
      businessName: true,
      industry: true,
      zone: true,
      instagramUrl: true,
      currentWebUrl: true,
      googleMapsUrl: true,
      dossier: { select: { briefJson: true, fichaJson: true } },
    },
    orderBy: { id: 'asc' },
  })
  await prisma.$disconnect()

  const bloques: Record<string, string> = {}
  for (const l of leads) {
    const brief = parseBrief(l.dossier?.briefJson ?? null)
    if (!brief) continue
    bloques[l.id] = buildConstruccionBlock(
      {
        businessName: l.businessName,
        industry: l.industry,
        zone: l.zone,
        instagramUrl: l.instagramUrl,
        currentWebUrl: l.currentWebUrl,
        googleMapsUrl: l.googleMapsUrl,
      },
      brief,
      parseFicha(l.dossier?.fichaJson ?? null),
    )
  }
  console.log(`${Object.keys(bloques).length} bloques armados`)
  const destino = arg('salida')
  if (destino) {
    fs.writeFileSync(destino, JSON.stringify({ medidoEn: new Date().toISOString(), bloques }, null, 2))
    console.log(`→ ${destino}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
