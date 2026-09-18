/**
 * LeadOS · P42 — EL BLOQUE DE «CONSTRUIR»: lo único que el setter le pega a
 * Claude Design.
 *
 * Tres capas en un solo texto, en este orden:
 *
 *   1 · INSTRUCCIONES    fija     — `PROMPT_BASE` (`prompt-construccion.ts`)
 *   2 · EL DOCUMENTO     variable — el bloque de construcción que produjo el brief
 *                                   (`buildConstruccionBlock`, entero y sin tocar),
 *                                   con un aviso adelante cuando al documento le
 *                                   falta algo
 *   3 · PISO DE CALIDAD  fija     — `PISO_DE_CALIDAD` (`prompt-construccion.ts`)
 *
 * El texto que se copia es la suma exacta de las tres (`texto`), y cada capa
 * lleva su rótulo adentro: la pantalla muestra ese mismo texto, entero.
 *
 * ── Por qué la capa 2 es `buildConstruccionBlock` y no solo el documento ─────
 * Porque es lo que el brief produjo, con o sin documento del Gem: las decisiones
 * que el setter confirmó (secciones, CTA, tono, paleta, tipografía), el material
 * real de la ficha (reseñas, qué vende, de dónde bajar el logo) y, al final, el
 * documento de la vuelta 4 tal cual se pegó. Un brief viejo no tiene documento y
 * sigue armando su bloque. Y ese builder tiene otros dos consumidores —«Refinar»
 * (mc2) y «Correcciones» (mr)— que siguen recibiendo exactamente lo mismo: por eso
 * no se lo modifica, se lo envuelve.
 *
 * ── El encabezado ────────────────────────────────────────────────────────────
 * El contrato del documento (`encabezado-documento.ts`) exige SECCIONES, PALETA y
 * TIPOGRAFIA al principio. Si el documento trae el encabezado entero, no hay nada
 * que avisar: sus campos viajan dos veces, como decisiones del brief (el lector
 * los completó al pegarlo) y adentro del documento. Si no lo trae, le falta una
 * línea, o el brief no tiene documento, el bloque se arma igual y LO DICE —a la
 * herramienta, adentro de la capa 2, y al setter, en la pantalla—: qué falta y,
 * cuando la decisión no está en ningún lado, que la tome por el camino
 * conservador y la declare. Nunca frena nada.
 *
 * Puro: sin React ni Prisma, importable desde el cliente, el servidor y las pruebas.
 */
import type { Brief, Ficha } from '@/lib/leados/contracts'
import { buildConstruccionBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import {
  leerEncabezado,
  OBLIGATORIAS,
  type EtiquetaObligatoria,
  type LecturaEncabezado,
} from '@/lib/leados/encabezado-documento'
import {
  PISO_DE_CALIDAD,
  PROMPT_BASE,
  ROTULOS_DE_CAPAS,
  SEPARADOR_DE_CAPAS,
} from '@/lib/leados/prompt-construccion'

export type CapaId = 'promptBase' | 'documento' | 'piso'

export type CapaBloque = {
  id: CapaId
  /** La primera línea de la capa, adentro del texto que se copia. */
  rotulo: string
  cuerpo: string
  /** `rotulo` + línea en blanco + `cuerpo`: lo que la capa aporta al texto. */
  texto: string
  /** Fija = la pone el producto y es igual para todo lead. */
  fija: boolean
}

export type EstadoDelDocumento =
  | { tipo: 'completo' }
  | { tipo: 'incompleto'; faltanEnEncabezado: EtiquetaObligatoria[] }
  | { tipo: 'sin-encabezado' }
  | { tipo: 'sin-documento' }

export type BloqueConstruccion = {
  /** Lo que se copia: las tres capas, en orden, separadas por una línea en blanco. */
  texto: string
  capas: readonly [CapaBloque, CapaBloque, CapaBloque]
  documento: EstadoDelDocumento
  /** Las decisiones obligatorias que no están ni en el brief ni en el encabezado. */
  decisionesFaltantes: EtiquetaObligatoria[]
  /** El aviso que viaja adentro de la capa 2, para la herramienta. `null` si no falta nada. */
  aviso: string | null
}

const NOMBRE_DE_LA_DECISION: Record<EtiquetaObligatoria, string> = {
  SECCIONES: 'las secciones',
  PALETA: 'la paleta',
  TIPOGRAFIA: 'la tipografía',
}

/** «a», «a y b», «a, b y c». */
function enumerar(partes: readonly string[]): string {
  if (partes.length <= 1) return partes.join('')
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`
}

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

/** Singular solo para UNA decisión que no sea «las secciones». */
const esSingular = (etiquetas: readonly EtiquetaObligatoria[]) =>
  etiquetas.length === 1 && etiquetas[0] !== 'SECCIONES'

/** ¿La decisión está cargada en el brief (lo que el setter confirmó)? */
function estaEnElBrief(brief: Brief, etiqueta: EtiquetaObligatoria): boolean {
  switch (etiqueta) {
    case 'SECCIONES':
      return brief.secciones.length > 0
    case 'PALETA':
      return Boolean(brief.paleta?.trim())
    case 'TIPOGRAFIA':
      return Boolean(brief.tipografia?.trim())
  }
}

/** ¿El encabezado del documento trae la decisión? */
function estaEnElEncabezado(lectura: LecturaEncabezado, etiqueta: EtiquetaObligatoria): boolean {
  if (lectura.estado !== 'completo' && lectura.estado !== 'incompleto') return false
  const valor = lectura.valores[etiqueta]
  return Array.isArray(valor) ? valor.length > 0 : Boolean(valor?.trim())
}

/** Qué trae el documento del brief, leído con el lector del contrato. */
export function estadoDelDocumento(brief: Pick<Brief, 'documento'>): EstadoDelDocumento {
  const lectura = leerEncabezado(brief.documento)
  switch (lectura.estado) {
    case 'vacio':
      return { tipo: 'sin-documento' }
    case 'sin-encabezado':
      return { tipo: 'sin-encabezado' }
    case 'incompleto':
      return { tipo: 'incompleto', faltanEnEncabezado: [...lectura.faltanObligatorias] }
    case 'completo':
      return { tipo: 'completo' }
  }
}

/** El aviso para la herramienta: qué le falta al documento y qué hacer con eso. */
function avisoDelDocumento(
  estado: EstadoDelDocumento,
  brief: Brief,
  faltantes: readonly EtiquetaObligatoria[],
): string | null {
  const frases: string[] = []

  if (estado.tipo === 'sin-documento') {
    frases.push(
      'Este brief no trae el documento de construcción del Gem de diseño, con su encabezado de decisiones. Construí con las decisiones y el material que siguen.',
    )
  }
  if (estado.tipo === 'sin-encabezado') {
    frases.push(
      'El documento de construcción del Gem de diseño no trae el encabezado de decisiones (las líneas SECCIONES, PALETA y TIPOGRAFIA del principio). Las decisiones que valen son las que siguen.',
    )
  }
  if (estado.tipo === 'incompleto') {
    const lineas = estado.faltanEnEncabezado
    frases.push(
      `Al encabezado del documento de construcción ${lineas.length === 1 ? 'le falta la línea' : 'le faltan las líneas'} ${enumerar(lineas)}.`,
    )
    const cubiertas = lineas.filter((etiqueta) => estaEnElBrief(brief, etiqueta))
    if (cubiertas.length > 0) {
      const singular = esSingular(cubiertas)
      frases.push(
        `${capitalizar(enumerar(cubiertas.map((e) => NOMBRE_DE_LA_DECISION[e])))} ${singular ? 'está' : 'están'} entre las decisiones que siguen: ${singular ? 'vale esa' : 'valen esas'}.`,
      )
    }
  }
  if (faltantes.length > 0) {
    const singular = esSingular(faltantes)
    frases.push(
      `Entre las decisiones no ${singular ? 'está' : 'están'} ${enumerar(faltantes.map((e) => NOMBRE_DE_LA_DECISION[e]))}: ${singular ? 'elegila' : 'elegilas'} por el camino más conservador, respetando el piso de calidad, y ${singular ? 'anotala' : 'anotalas'} al final, entre las decisiones que tomaste vos.`,
    )
  }

  return frases.length > 0 ? ['AVISO SOBRE ESTE DOCUMENTO', ...frases].join('\n') : null
}

function capa(id: CapaId, rotulo: string, cuerpo: string, fija: boolean): CapaBloque {
  return { id, rotulo, cuerpo, fija, texto: `${rotulo}${SEPARADOR_DE_CAPAS}${cuerpo}` }
}

/** El bloque de «Construir»: las tres capas y lo que se sabe del documento. */
export function armarBloqueConstruccion(
  lead: CopyBlockLead,
  brief: Brief,
  ficha: Ficha | null,
): BloqueConstruccion {
  const documento = estadoDelDocumento(brief)
  const lectura = leerEncabezado(brief.documento)
  const decisionesFaltantes = OBLIGATORIAS.filter(
    (etiqueta) => !estaEnElBrief(brief, etiqueta) && !estaEnElEncabezado(lectura, etiqueta),
  )
  const aviso = avisoDelDocumento(documento, brief, decisionesFaltantes)
  const deSiempre = buildConstruccionBlock(lead, brief, ficha)

  const capas = [
    capa('promptBase', ROTULOS_DE_CAPAS.promptBase, PROMPT_BASE, true),
    capa('documento', ROTULOS_DE_CAPAS.documento, aviso ? `${aviso}${SEPARADOR_DE_CAPAS}${deSiempre}` : deSiempre, false),
    capa('piso', ROTULOS_DE_CAPAS.piso, PISO_DE_CALIDAD, true),
  ] as const

  return {
    texto: capas.map((c) => c.texto).join(SEPARADOR_DE_CAPAS),
    capas,
    documento,
    decisionesFaltantes,
    aviso,
  }
}

/**
 * Lo mismo, dicho al setter: que el bloque se arma igual y qué va a decidir sola
 * la herramienta. `null` cuando el documento trae el encabezado entero.
 */
export function avisoParaElSetter(bloque: Pick<BloqueConstruccion, 'documento' | 'decisionesFaltantes'>): string | null {
  const { documento: estado, decisionesFaltantes } = bloque
  if (estado.tipo === 'completo') return null
  const cola =
    decisionesFaltantes.length > 0
      ? `, y le avisa a Claude Design que decida solo ${enumerar(decisionesFaltantes.map((e) => NOMBRE_DE_LA_DECISION[e]))}.`
      : ', y se lo avisa a Claude Design.'
  switch (estado.tipo) {
    case 'sin-documento':
      return `Este brief no trae el documento del Gem de diseño. El bloque se arma igual, con lo que guardaste en el brief${cola}`
    case 'sin-encabezado':
      return `El documento del Gem no trae el encabezado de decisiones. El bloque va igual, entero${cola}`
    case 'incompleto':
      return `Al encabezado del documento le ${estado.faltanEnEncabezado.length === 1 ? 'falta' : 'faltan'} ${enumerar(estado.faltanEnEncabezado)}. El bloque va igual${cola}`
  }
}
