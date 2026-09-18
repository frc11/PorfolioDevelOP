/**
 * P42 · LA LLAVE DEL PROGRESO, SERIALIZADA — solo lectura. Branch Neon dev.
 *
 * El sprint colapsa los tres tildes de «Construir» en uno. La regla es que la
 * llave del progreso guardado no se toque: las fases siguen siendo las mismas,
 * con los mismos ids, y lo que ya está guardado se lee igual. Esto lo vuelve
 * comparable: se corre en la Fase 0 (código de partida) y al cierre, y las dos
 * salidas tienen que ser idénticas byte por byte.
 *
 * Lo que serializa:
 *   1. las listas que forman la llave — `FASE_IDS`, los ids del shell, la tabla
 *      fase→pantalla, las pantallas de Construcción, los ids de pantalla y los
 *      nombres de los checks del chequeo final (la otra llave del dossier);
 *   2. cómo lee `ProgresoSchema` una batería fija de blobs (válidos, parciales,
 *      con marcas, inválidos);
 *   3. la derivación para los 64 subconjuntos de fases, en CONSTRUCCION con y sin
 *      borrador: qué pantallas quedan completadas y cuál es la actual;
 *   4. cada `progresoJson` guardado en la base: cómo se parsea y qué pantallas de
 *      Construcción da por completadas.
 *
 * Uso:
 *   npx tsx scripts/p42-llave-progreso.mts --salida=C:/tmp/p42-construccion/llave-f0.json
 */
import fs from 'fs'
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null

async function main() {
  const url = process.env.DATABASE_URL
  if (!url?.includes(DEV_BRANCH_HOST)) {
    console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
    process.exit(1)
  }

  const { FASE_IDS, ProgresoSchema } = await import('@/lib/leados/contracts')
  const { SHELL_CONSTRUCCION, HARD_CHECKS, parseProgreso } = await import('@/lib/leados/flow')
  const manual = await import('@/lib/leados/manual')
  const { prisma } = await import('@/lib/prisma')

  // ── 1 · Las listas ─────────────────────────────────────────────────────────
  const listas = {
    FASE_IDS: [...FASE_IDS],
    idsDelShell: SHELL_CONSTRUCCION.map((fase) => fase.id),
    PANTALLA_DE_FASE: manual.PANTALLA_DE_FASE,
    PANTALLAS_CONSTRUCCION: [...manual.PANTALLAS_CONSTRUCCION],
    PANTALLA_IDS: [...manual.PANTALLA_IDS],
    fasesPorPantalla: Object.fromEntries(
      manual.PANTALLA_IDS.map((id) => [id, [...manual.fasesDePantallaConstruccion(id)]]),
    ),
    nombresDeLosChecks: HARD_CHECKS.map((check) => check.nombre),
  }

  // ── 2 · Cómo se lee un blob ─────────────────────────────────────────────────
  const BLOBS: Record<string, unknown> = {
    vacio: {},
    nulo: null,
    mc1Entera: { completadas: ['estructura', 'personalizacion', 'assets'] },
    mc1Parcial: { completadas: ['estructura'] },
    mc2Entera: { completadas: ['cta', 'calidad', 'mobile'] },
    seisFases: { completadas: [...FASE_IDS] },
    conMarcas: {
      completadas: ['estructura', 'assets'],
      faseActual: 'personalizacion',
      marcadas: { estructura: '2026-09-01T12:00:00.000Z', assets: '2026-09-02T12:00:00.000Z' },
    },
    idInventado: { completadas: ['estructura', 'construir'] },
    desordenado: { completadas: ['mobile', 'estructura', 'assets'] },
  }
  const lecturas = Object.fromEntries(
    Object.entries(BLOBS).map(([nombre, blob]) => [
      nombre,
      { schema: ProgresoSchema.safeParse(blob).success, parseProgreso: parseProgreso(blob) },
    ]),
  )

  // ── 3 · La derivación, subconjunto por subconjunto ──────────────────────────
  const base = {
    stage: 'CONSTRUCCION' as const,
    status: 'PROSPECTO' as const,
    caliente: false,
    ficha: null,
    agenda: null,
    contactos: 0,
    postergadoVencido: false,
    hayRechazo: false,
    followUpCount: 0,
    followUpVencido: false,
    finalUrl: null,
    demoEnviada: false,
  }
  const derivacion: Record<string, unknown> = {}
  for (let mascara = 0; mascara < 2 ** FASE_IDS.length; mascara += 1) {
    const completadas = FASE_IDS.filter((_, i) => (mascara >> i) & 1)
    for (const draftUrl of [null, 'https://borrador.netlify.app']) {
      const posicion = manual.derivarPantalla({ ...base, draftUrl, progreso: { completadas } })
      derivacion[`${completadas.join('+') || '(ninguna)'}|${draftUrl ? 'con-borrador' : 'sin-borrador'}`] = {
        actual: posicion.actual,
        completadas: posicion.completadas,
        habilitadas: posicion.habilitadas,
      }
    }
  }

  // ── 4 · Lo guardado en la base ──────────────────────────────────────────────
  const dossiers = await prisma.osLeadDossier.findMany({
    where: { progresoJson: { not: { equals: null } } },
    select: { leadId: true, progresoJson: true },
    orderBy: { leadId: 'asc' },
  })
  await prisma.$disconnect()
  const guardados = dossiers.map((d) => {
    const progreso = parseProgreso(d.progresoJson)
    return {
      leadId: d.leadId,
      crudo: d.progresoJson,
      leido: progreso,
      pantallasCompletas: manual.PANTALLAS_CONSTRUCCION.filter((p) =>
        manual.fasesDePantallaConstruccion(p).every((f) => progreso.completadas.includes(f)),
      ),
    }
  })

  const salida = { listas, lecturas, derivacion, guardados }
  const destino = arg('salida')
  const texto = JSON.stringify(salida, null, 2)
  if (destino) fs.writeFileSync(destino, texto)
  const parciales = guardados.filter(
    (g) =>
      g.leido.completadas.some((f) => manual.PANTALLA_DE_FASE[f] === 'mc1') &&
      !g.pantallasCompletas.includes('mc1'),
  )
  console.log(
    `listas ok · ${Object.keys(lecturas).length} blobs · ${Object.keys(derivacion).length} derivaciones · ` +
      `${guardados.length} progresos guardados (${parciales.length} con «Construir» a medias)` +
      (destino ? ` → ${destino}` : ''),
  )
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
