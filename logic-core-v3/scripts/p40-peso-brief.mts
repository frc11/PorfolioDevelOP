/**
 * P40 · PESO DEL BRIEF — solo lectura. Branch Neon dev, y nada más.
 *
 * La pregunta de la decisión 2: ¿guardar las cuatro vueltas multiplica el peso
 * de lo que el producto lee en cada carga? Se contesta con tres números medidos,
 * no con una intuición:
 *
 *   1. Cuánto pesan hoy los briefs guardados, y cuánto de eso arrastra la home
 *      del setter (`listOwnedLeads` incluye el dossier ENTERO de cada lead).
 *   2. Cuánto pesaría un brief con cada opción, con el largo que el contrato del
 *      Gem pide (vuelta 1 en 15 líneas; documento de 800 a 1.200 palabras),
 *      convertido a bytes con la proporción medida en un texto real.
 *   3. Cuánto tarda la base en devolver esos bytes, con una consulta que no lee
 *      ninguna tabla (genera el relleno en el servidor, parametrizada).
 *
 * Uso: npx tsx scripts/p40-peso-brief.mts [--salida=C:/tmp/p40-brief/peso.json]
 */
import fs from 'fs'
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'
import {
  CUERPO_DOCUMENTO,
  DOCUMENTO_CON_HUECOS_ANTES,
  DOCUMENTO_COMPLETO,
  ENCABEZADO_EXACTO,
  VUELTA_DECISIONES,
  VUELTA_LECTURA,
} from '../tests/helpers/documento-construccion-fixtures.ts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null

const QA_EMAIL = 'setter-qa@develop.test'
const bytes = (s: string) => Buffer.byteLength(s, 'utf8')
const palabras = (s: string) => s.split(/\s+/).filter(Boolean).length
const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`
const mediana = (xs: number[]) => {
  const o = [...xs].sort((a, b) => a - b)
  return o[Math.floor(o.length / 2)]!
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url?.includes(DEV_BRANCH_HOST)) {
    console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
    process.exit(1)
  }
  const { prisma } = await import('@/lib/prisma')
  const { listOwnedLeads } = await import('@/lib/leados/ownership')

  // ── 1 · Lo que hay hoy ─────────────────────────────────────────────────────
  const dossiers = await prisma.osLeadDossier.findMany({ select: { leadId: true, briefJson: true } })
  const conBrief = dossiers.filter((d) => d.briefJson !== null)
  const pesosBrief = conBrief.map((d) => bytes(JSON.stringify(d.briefJson)))
  const promedioBrief = pesosBrief.length ? pesosBrief.reduce((a, b) => a + b, 0) / pesosBrief.length : 0

  const qa = await prisma.user.findUniqueOrThrow({ where: { email: QA_EMAIL }, select: { id: true } })
  const tiemposHome: number[] = []
  let owned: Awaited<ReturnType<typeof listOwnedLeads>> = []
  for (let i = 0; i < 7; i++) {
    const t0 = performance.now()
    owned = await listOwnedLeads(qa.id)
    tiemposHome.push(performance.now() - t0)
  }
  const homeBytes = bytes(JSON.stringify(owned))
  const homeConBrief = owned.filter((l) => l.dossier?.briefJson != null)
  const homeBriefBytes = homeConBrief.reduce((a, l) => a + bytes(JSON.stringify(l.dossier!.briefJson)), 0)

  // ── 2 · Lo que pesaría, con el largo del contrato ──────────────────────────
  const bytesPorPalabra = bytes(CUERPO_DOCUMENTO) / palabras(CUERPO_DOCUMENTO)
  const huecos = DOCUMENTO_CON_HUECOS_ANTES.slice(0, DOCUMENTO_CON_HUECOS_ANTES.indexOf(DOCUMENTO_COMPLETO))
  const doc = (n: number) => bytes(ENCABEZADO_EXACTO) + Math.round(n * bytesPorPalabra)
  // La vuelta 4 pegada ENTERA trae la caza de huecos antes del documento: se
  // estima con seis huecos del largo del ejemplo (el prompt no fija cuántos).
  const docConHuecos = (n: number) => doc(n) + bytes(huecos) * 6
  const v1 = bytes(VUELTA_LECTURA)
  const v2 = bytes(VUELTA_DECISIONES)
  const opciones = (n: number) => ({
    // A · las cuatro: lectura + decisiones + borrador (≈ documento) + documento
    A_las_cuatro: v1 + v2 + doc(n) + docConHuecos(n),
    // B · solo la que se consume: el documento de la vuelta 4
    B_solo_documento: docConHuecos(n),
    // C · lectura + decisiones + documento (el borrador de la 3 no)
    C_sin_borrador: v1 + v2 + docConHuecos(n),
  })
  const proyeccion = { palabras800: opciones(800), palabras1200: opciones(1200) }

  // ── 3 · Cuánto tarda la base en devolver esos bytes ────────────────────────
  // Sin tabla: el relleno lo genera el servidor. Parametrizada (tagged template).
  const filas = homeConBrief.length
  const medirTransferencia = async (bytesPorFila: number) => {
    const tiempos: number[] = []
    for (let i = 0; i < 7; i++) {
      const t0 = performance.now()
      await prisma.$queryRaw`SELECT repeat('x', ${bytesPorFila}::int) AS relleno FROM generate_series(1, ${filas}::int)`
      tiempos.push(performance.now() - t0)
    }
    return Math.round(mediana(tiempos))
  }
  const transferencia = {
    hoy: await medirTransferencia(Math.round(promedioBrief)),
    B_solo_documento_1200: await medirTransferencia(proyeccion.palabras1200.B_solo_documento),
    C_sin_borrador_1200: await medirTransferencia(proyeccion.palabras1200.C_sin_borrador),
    A_las_cuatro_1200: await medirTransferencia(proyeccion.palabras1200.A_las_cuatro),
  }

  await prisma.$disconnect()

  const salida = {
    medidoEn: new Date().toISOString(),
    hoy: {
      dossiers: dossiers.length,
      conBrief: conBrief.length,
      briefPromedio: Math.round(promedioBrief),
      briefMax: pesosBrief.length ? Math.max(...pesosBrief) : 0,
    },
    homeSetterQa: {
      leads: owned.length,
      leadsConBrief: filas,
      bytesTotal: homeBytes,
      bytesDeBriefs: homeBriefBytes,
      msListOwnedLeadsMediana: Math.round(mediana(tiemposHome)),
    },
    texto: { bytesPorPalabra: Number(bytesPorPalabra.toFixed(2)), v1, v2, huecosEjemplo: bytes(huecos) },
    proyeccion,
    homeProyectada: Object.fromEntries(
      Object.entries(proyeccion.palabras1200).map(([k, v]) => [k, homeBytes - homeBriefBytes + filas * v]),
    ),
    transferenciaMsMediana: transferencia,
  }

  console.log(`hoy: ${salida.hoy.conBrief} de ${salida.hoy.dossiers} dossiers con brief · promedio ${salida.hoy.briefPromedio} B · máx ${salida.hoy.briefMax} B`)
  console.log(`home de setter-qa: ${owned.length} leads · ${filas} con brief · ${kb(homeBytes)} en total, ${kb(homeBriefBytes)} de briefs · listOwnedLeads ${salida.homeSetterQa.msListOwnedLeadsMediana} ms (mediana de 7)`)
  console.log(`texto real: ${salida.texto.bytesPorPalabra} bytes por palabra · vuelta 1 ${v1} B · vuelta 2 ${v2} B`)
  for (const [largo, ops] of Object.entries(proyeccion)) {
    console.log(`un brief, ${largo}: ` + Object.entries(ops).map(([k, v]) => `${k} ${kb(v)}`).join(' · '))
  }
  console.log('home proyectada (1.200 palabras): ' + Object.entries(salida.homeProyectada).map(([k, v]) => `${k} ${kb(v)}`).join(' · '))
  console.log('transferencia desde la base, mediana de 7: ' + Object.entries(transferencia).map(([k, v]) => `${k} ${v} ms`).join(' · '))

  const destino = arg('salida')
  if (destino) {
    fs.writeFileSync(destino, JSON.stringify(salida, null, 2))
    console.log(`→ ${destino}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
