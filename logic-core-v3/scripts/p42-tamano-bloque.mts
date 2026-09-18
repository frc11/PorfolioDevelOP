/**
 * P42 · CUÁNTO MIDE EL BLOQUE DE CONSTRUCCIÓN — solo lectura. Branch Neon dev.
 *
 * El supuesto S-30 («que Claude Design acepte prompt base + documento + piso en
 * un solo mensaje») no se puede verificar contra la herramienta: no tiene link.
 * Lo que sí se puede es medir lo que el setter va a pegar, en tres escenarios:
 *
 *   1. los briefs que existen en la base (cada lead con brief, con la MISMA
 *      función y los mismos datos que usa la pantalla);
 *   2. el documento de ejemplo del contrato (Barbería El Faro, 1.200 palabras
 *      aprox.), con una ficha completa;
 *   3. el techo teórico: cada campo del brief y de la ficha en su tope de
 *      validación. Ningún setter llega ahí; es la cota de lo que el producto
 *      deja guardar.
 *
 * Mide el bloque de siempre (`buildConstruccionBlock`, lo que hoy copian mc1, mc2
 * y la reentrada) y, si el módulo existe, el bloque de tres capas de mc1. Así el
 * mismo instrumento corre contra el código de partida y contra el nuevo.
 *
 * Unidades: caracteres (lo que cuenta un campo de texto), bytes UTF-8, palabras
 * (tokens separados por espacio) y renglones. No estima tokens de ningún modelo:
 * eso depende de la herramienta, que no se puede abrir.
 *
 * Uso:
 *   npx tsx scripts/p42-tamano-bloque.mts --salida=C:/tmp/p42-construccion/tamano-antes.json
 */
import fs from 'fs'
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'
import {
  CUERPO_DOCUMENTO,
  DOCUMENTO_COMPLETO,
  VALORES_ENCABEZADO,
  VUELTA_DECISIONES,
  VUELTA_LECTURA,
} from '../tests/helpers/documento-construccion-fixtures.ts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null

type Medida = { caracteres: number; bytes: number; palabras: number; renglones: number }

const medir = (texto: string): Medida => ({
  caracteres: [...texto].length,
  bytes: Buffer.byteLength(texto, 'utf8'),
  palabras: texto.split(/\s+/).filter(Boolean).length,
  renglones: texto.split('\n').length,
})

const resumen = (valores: number[]) => {
  const orden = [...valores].sort((a, b) => a - b)
  const al = (p: number) => orden[Math.min(orden.length - 1, Math.floor(p * (orden.length - 1)))] ?? 0
  return { n: orden.length, min: orden[0] ?? 0, mediana: al(0.5), p90: al(0.9), max: orden[orden.length - 1] ?? 0 }
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url?.includes(DEV_BRANCH_HOST)) {
    console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
    process.exit(1)
  }

  const { prisma } = await import('@/lib/prisma')
  const { parseBrief, parseFicha } = await import('@/lib/leados/flow')
  const { buildConstruccionBlock } = await import('@/lib/leados/copy-blocks')
  const { leerEncabezado } = await import('@/lib/leados/encabezado-documento')
  const { TEXTO_LIBRE_MAX, TEXTO_DOCUMENTO_MAX } = await import('@/lib/leados/contracts')

  // El bloque de tres capas existe desde P42. Contra el código de partida no está.
  type Armador = (
    lead: Parameters<typeof buildConstruccionBlock>[0],
    brief: Parameters<typeof buildConstruccionBlock>[1],
    ficha: Parameters<typeof buildConstruccionBlock>[2],
  ) => { texto: string; capas: readonly { id: string; texto: string }[] }
  let armarTresCapas: Armador | null = null
  try {
    const modulo = (await import('@/lib/leados/bloque-construccion')) as { armarBloqueConstruccion: Armador }
    armarTresCapas = modulo.armarBloqueConstruccion
  } catch {
    armarTresCapas = null
  }

  // ── 1 · Los briefs de la base ─────────────────────────────────────────────
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

  const filas: {
    leadId: string
    forma: string
    viejo: Medida
    tresCapas: Medida | null
  }[] = []
  for (const l of leads) {
    const brief = parseBrief(l.dossier?.briefJson ?? null)
    if (!brief) continue
    const lead = {
      businessName: l.businessName,
      industry: l.industry,
      zone: l.zone,
      instagramUrl: l.instagramUrl,
      currentWebUrl: l.currentWebUrl,
      googleMapsUrl: l.googleMapsUrl,
    }
    const ficha = parseFicha(l.dossier?.fichaJson ?? null)
    const forma = brief.documento
      ? `documento:${leerEncabezado(brief.documento).estado}`
      : brief.pegadoGem
        ? 'sin-documento:con-pegado-del-gem'
        : 'sin-documento'
    filas.push({
      leadId: l.id,
      forma,
      viejo: medir(buildConstruccionBlock(lead, brief, ficha)),
      tresCapas: armarTresCapas ? medir(armarTresCapas(lead, brief, ficha).texto) : null,
    })
  }

  const formas = filas.reduce<Record<string, number>>((acc, f) => ({ ...acc, [f.forma]: (acc[f.forma] ?? 0) + 1 }), {})
  const base = {
    briefs: filas.length,
    formas,
    viejo: {
      caracteres: resumen(filas.map((f) => f.viejo.caracteres)),
      palabras: resumen(filas.map((f) => f.viejo.palabras)),
    },
    tresCapas: armarTresCapas
      ? {
          caracteres: resumen(filas.map((f) => f.tresCapas!.caracteres)),
          palabras: resumen(filas.map((f) => f.tresCapas!.palabras)),
        }
      : null,
  }

  // ── 2 · El documento de ejemplo, con ficha completa ─────────────────────────
  const LEAD_EJEMPLO = {
    businessName: 'Barbería El Faro',
    industry: 'Barbería',
    zone: 'Yerba Buena, Tucumán',
    instagramUrl: 'https://instagram.com/barberiaelfaro',
    currentWebUrl: null,
    googleMapsUrl: 'https://maps.google.com/?cid=123456789',
  }
  const FICHA_EJEMPLO = {
    identidad: { notas: 'La cuenta la firma Marcos, el dueño, que aparece en las fotos.', igManejadoPor: 'DUENO' as const },
    presenciaDigital: 'Instagram activo, publica tres veces por semana. Sin web. Google Maps con 212 reseñas.',
    resenas:
      '★★★★★ "Marcos es un crack, te deja el corte como te gusta sin que se lo expliques dos veces." — Julián R.\n★★★★★ "El mejor degradé de Yerba Buena. Lo único: reservá antes porque se llena." — Santiago M.\n★★★★★ "Llevo a mi hijo desde los 4 años, ya es parte de la familia." — Pablo G.',
    contenidoReal: 'Logo: faro blanco sobre negro. Fotos de cortes con luz cálida. Flyers de Canva.',
    senalesOperativas: 'Martes a sábados de 10 a 20 h. Turnos por WhatsApp. Promo 2x1 padre e hijo martes y miércoles.',
    materiales: {
      resenasUrl: 'https://maps.google.com/?cid=123456789&reviews',
      imagenesUrl: 'https://instagram.com/barberiaelfaro',
      queVende: 'Corte clásico $9.000 · Corte y barba $12.500 · Barba $5.000 · Corte infantil $7.000',
      comoSePresenta: '"Barbería de barrio desde 2016. Te conocemos por el nombre." (bio de Instagram)',
    },
  }
  const BRIEF_EJEMPLO = {
    titulo: 'Barbería El Faro',
    concepto: VALORES_ENCABEZADO.ANGULO,
    secciones: [...VALORES_ENCABEZADO.SECCIONES],
    cta: VALORES_ENCABEZADO.CTA,
    tono: VALORES_ENCABEZADO.TONO,
    paleta: VALORES_ENCABEZADO.PALETA,
    tipografia: VALORES_ENCABEZADO.TIPOGRAFIA,
    documento: DOCUMENTO_COMPLETO,
    vueltas: { lectura: { respuesta: VUELTA_LECTURA }, decisiones: { respuesta: VUELTA_DECISIONES } },
  }
  const ejemploViejo = buildConstruccionBlock(LEAD_EJEMPLO, BRIEF_EJEMPLO, FICHA_EJEMPLO)
  const ejemploNuevo = armarTresCapas ? armarTresCapas(LEAD_EJEMPLO, BRIEF_EJEMPLO, FICHA_EJEMPLO) : null

  // El documento de ejemplo tiene ~780 palabras; el contrato del Gem pide de 800
  // a 1.200. Se lo lleva al TOPE con su propio texto (misma proporción de
  // caracteres por palabra), para medir el caso largo sin inventar otra prosa.
  const palabrasCuerpo = CUERPO_DOCUMENTO.split(/\s+/).filter(Boolean)
  const faltan = Math.max(0, 1200 - DOCUMENTO_COMPLETO.split(/\s+/).filter(Boolean).length)
  const relleno = Array.from({ length: faltan }, (_, i) => palabrasCuerpo[i % palabrasCuerpo.length]).join(' ')
  const DOCUMENTO_1200 = `${DOCUMENTO_COMPLETO}\n\n${relleno}`
  const brief1200 = { ...BRIEF_EJEMPLO, documento: DOCUMENTO_1200 }
  const nuevo1200 = armarTresCapas ? armarTresCapas(LEAD_EJEMPLO, brief1200, FICHA_EJEMPLO) : null

  const ejemplo = {
    documentoSolo: medir(DOCUMENTO_COMPLETO),
    viejo: medir(ejemploViejo),
    tresCapas: ejemploNuevo ? medir(ejemploNuevo.texto) : null,
    capas: ejemploNuevo ? Object.fromEntries(ejemploNuevo.capas.map((c) => [c.id, medir(c.texto)])) : null,
    documento1200: {
      documentoSolo: medir(DOCUMENTO_1200),
      viejo: medir(buildConstruccionBlock(LEAD_EJEMPLO, brief1200, FICHA_EJEMPLO)),
      tresCapas: nuevo1200 ? medir(nuevo1200.texto) : null,
    },
  }

  // ── 3 · El techo teórico: cada campo en su tope ─────────────────────────────
  const lleno = (n: number) => 'x'.repeat(n)
  const SECCIONES_TECHO = 12 // `secciones` no tiene tope en el contrato: se toma una docena
  const BRIEF_TECHO = {
    titulo: lleno(80),
    concepto: lleno(TEXTO_LIBRE_MAX),
    secciones: Array.from({ length: SECCIONES_TECHO }, (_, i) => `Sección ${i + 1}`),
    notasMarca: lleno(TEXTO_LIBRE_MAX),
    cta: lleno(TEXTO_LIBRE_MAX),
    tono: lleno(TEXTO_LIBRE_MAX),
    paleta: lleno(TEXTO_LIBRE_MAX),
    tipografia: lleno(TEXTO_LIBRE_MAX),
    documento: lleno(TEXTO_DOCUMENTO_MAX),
    vueltas: { huecos: { correccion: lleno(TEXTO_LIBRE_MAX) } },
  }
  const URL_TECHO = `https://${lleno(480)}.com`
  const FICHA_TECHO = {
    resenas: lleno(TEXTO_LIBRE_MAX),
    contenidoReal: lleno(TEXTO_LIBRE_MAX),
    senalesOperativas: lleno(TEXTO_LIBRE_MAX),
    materiales: {
      resenasUrl: URL_TECHO,
      imagenesUrl: URL_TECHO,
      otraRedUrl: URL_TECHO,
      queVende: lleno(TEXTO_LIBRE_MAX),
      comoSePresenta: lleno(TEXTO_LIBRE_MAX),
    },
  }
  const LEAD_TECHO = { ...LEAD_EJEMPLO, instagramUrl: URL_TECHO, currentWebUrl: URL_TECHO, googleMapsUrl: URL_TECHO }
  // Un escenario intermedio y más probable que el techo: el brief y la ficha de
  // ejemplo, con el documento estirado hasta su tope de validación.
  const briefDocumentoAlTope = {
    ...BRIEF_EJEMPLO,
    documento: `${DOCUMENTO_COMPLETO}\n\n${lleno(TEXTO_DOCUMENTO_MAX - DOCUMENTO_COMPLETO.length - 2)}`,
  }
  const techo = {
    viejo: medir(buildConstruccionBlock(LEAD_TECHO, BRIEF_TECHO, FICHA_TECHO)),
    tresCapas: armarTresCapas ? medir(armarTresCapas(LEAD_TECHO, BRIEF_TECHO, FICHA_TECHO).texto) : null,
    nota: `cada campo de texto en ${TEXTO_LIBRE_MAX}, el documento en ${TEXTO_DOCUMENTO_MAX}, ${SECCIONES_TECHO} secciones, direcciones de 500`,
    documentoAlTope: {
      viejo: medir(buildConstruccionBlock(LEAD_EJEMPLO, briefDocumentoAlTope, FICHA_EJEMPLO)),
      tresCapas: armarTresCapas ? medir(armarTresCapas(LEAD_EJEMPLO, briefDocumentoAlTope, FICHA_EJEMPLO).texto) : null,
      nota: `el ejemplo con el documento en ${TEXTO_DOCUMENTO_MAX} caracteres`,
    },
  }

  // El bloque de ejemplo que se mide, tal cual: el que se pega en el reporte.
  const volcar = arg('volcar')
  if (volcar && ejemploNuevo) {
    fs.writeFileSync(volcar, ejemploNuevo.texto)
    console.log(`bloque de ejemplo → ${volcar}`)
  }

  const foto = { medidoEn: new Date().toISOString(), tresCapasDisponible: armarTresCapas !== null, base, ejemplo, techo, filas }
  console.log(JSON.stringify({ base, ejemplo, techo }, null, 2))
  const destino = arg('salida')
  if (destino) {
    fs.writeFileSync(destino, JSON.stringify(foto, null, 2))
    console.log(`→ ${destino}`)
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
