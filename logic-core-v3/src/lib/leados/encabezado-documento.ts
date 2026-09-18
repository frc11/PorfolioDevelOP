/**
 * LeadOS · P40 — EL ENCABEZADO QUE EL PRODUCTO LEE.
 *
 * El documento de construcción que devuelve la vuelta 4 del Gem de diseño empieza
 * con seis líneas etiquetadas. El producto las lee para que las pantallas que
 * siguen no dependan de que el setter las transcriba. Es el primer lector de
 * texto pegado del repo: este archivo ES el contrato que el Gem tiene que
 * cumplir, y la tolerancia con la que se lo lee.
 *
 * ── EL CONTRATO (lo que el Gem tiene que escribir) ───────────────────────────
 *
 *   ANGULO: <qué le mostramos al dueño para que piense «esto es lo que necesito», en una línea>
 *   SECCIONES: <las secciones de la página, en orden, separadas por · >
 *   CTA: <el texto exacto del botón principal>
 *   TONO: <cómo escribe la demo, en una línea>
 *   PALETA: <neutro / acento / apoyo, con hex>
 *   TIPOGRAFIA: <títulos / cuerpo>
 *
 *   (una línea en blanco, y el resto del documento en texto libre)
 *
 * Una etiqueta por línea, en mayúsculas, seguida de dos puntos y del valor en la
 * misma línea. Las seis, en ese orden, al principio del documento.
 *
 * ── OBLIGATORIAS Y OPCIONALES ────────────────────────────────────────────────
 *
 * Obligatoria = si falta, vuelve el defecto que el documento viene a tapar:
 *   · SECCIONES — sin ellas la demo no se puede construir, y es el único dato del
 *     brief que el guardado exige.
 *   · PALETA y TIPOGRAFIA — sin ellas Claude Design elige colores y fuente por su
 *     cuenta, y por eso las demos salen parecidas.
 * Opcional = si falta, el bloque de construcción queda como el brief de hoy ya
 * lo permite: ANGULO (va al concepto, opcional), CTA (opcional) y TONO (el
 * bloque ya lleva cómo habla el negocio, desde la ficha).
 *
 * Que falte una obligatoria NO frena nada: el documento se guarda igual y viaja
 * entero. La lectura lo dice —qué falta y qué hacer— y el campo queda para que el
 * setter lo escriba. Frenar el guardado sería un gate nuevo, y no es de acá.
 *
 * ── LO QUE SE TOLERA (el Gem no escribe perfecto) ────────────────────────────
 *
 *   · mayúsculas o minúsculas, con o sin tilde: `Ángulo:`, `TIPOGRAFÍA:`;
 *   · adornos de formato alrededor de la etiqueta: `**PALETA:**`, `- CTA:`,
 *     `## TONO:`, `1. SECCIONES:`, sangría al principio de la línea;
 *   · espacios antes de los dos puntos y dos puntos de más (`CTA:: Reservá`);
 *     el valor puede tener sus propios dos puntos (`CTA: Reservá: tu lugar`);
 *   · dos nombres de uso común: `ÁNGULO WOW` y `LLAMADO A LA ACCIÓN`;
 *   · SECCIONES separadas por `·`, `•`, `|`, `;` o ` / `, o por comas si no hay
 *     ninguno de esos; y también en lista, una por renglón, si la línea
 *     `SECCIONES:` quedó sin valor;
 *   · el encabezado en otro lugar que la primera línea (si el setter pegó la
 *     respuesta entera, con la caza de huecos antes del documento), y en otro
 *     orden. Un encabezado son al menos DOS etiquetas del contrato seguidas: una
 *     sola suelta en el medio del texto no se toma por encabezado.
 *
 * ── LO QUE NO MATCHEA SE CONSERVA ────────────────────────────────────────────
 *
 * Este lector NUNCA reescribe el documento: lo que se guarda y lo que viaja a la
 * construcción es el texto tal cual se pegó. Lo que no encaja en el contrato no
 * se tira — se cuenta y se muestra:
 *   · `antes`: renglones con texto antes del encabezado (la caza de huecos, un
 *     saludo del Gem);
 *   · `otras`: líneas con forma de etiqueta que el contrato no define (`LOGO: …`);
 *   · `repetidas`: una etiqueta que vino dos veces — vale la primera.
 *
 * Sin React, sin Prisma: lógica pura, importable desde el cliente, el servidor y
 * las pruebas.
 */

export const ETIQUETAS = ['ANGULO', 'SECCIONES', 'CTA', 'TONO', 'PALETA', 'TIPOGRAFIA'] as const
export type Etiqueta = (typeof ETIQUETAS)[number]

export const OBLIGATORIAS = ['SECCIONES', 'PALETA', 'TIPOGRAFIA'] as const satisfies readonly Etiqueta[]
export type EtiquetaObligatoria = (typeof OBLIGATORIAS)[number]

const esObligatoria = (etiqueta: Etiqueta): etiqueta is EtiquetaObligatoria =>
  (OBLIGATORIAS as readonly Etiqueta[]).includes(etiqueta)

export type ValoresEncabezado = {
  ANGULO?: string
  SECCIONES?: string[]
  CTA?: string
  TONO?: string
  PALETA?: string
  TIPOGRAFIA?: string
}

/** Una línea que el lector no usó, con su número de renglón (desde 1). */
export type LineaConservada = { linea: number; texto: string }

export type LecturaEncabezado =
  | { estado: 'vacio' }
  | { estado: 'sin-encabezado'; renglones: number }
  | {
      estado: 'completo' | 'incompleto'
      valores: ValoresEncabezado
      faltanObligatorias: EtiquetaObligatoria[]
      faltanOpcionales: Etiqueta[]
      otras: LineaConservada[]
      repetidas: LineaConservada[]
      antes: number
    }

/** Nombres aceptados, ya normalizados (mayúsculas, sin tildes, espacios simples). */
const ALIAS: Record<string, Etiqueta> = {
  ANGULO: 'ANGULO',
  'ANGULO WOW': 'ANGULO',
  SECCIONES: 'SECCIONES',
  CTA: 'CTA',
  'LLAMADO A LA ACCION': 'CTA',
  TONO: 'TONO',
  PALETA: 'PALETA',
  TIPOGRAFIA: 'TIPOGRAFIA',
}

/** Viñetas, numeración y marcas de título al principio de la línea. */
const ADORNO_INICIAL = /^\s*(?:[-*•·>]+\s*|\d+[.)]\s+|#{1,6}\s*)?/
/** Marcas de énfasis de markdown. */
const ENFASIS = /[*_`]/g

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

type Partida = { nombre: string; valor: string }

/** Parte una línea en «nombre: valor» por el PRIMER dos puntos. `null` si no hay. */
function partir(linea: string): Partida | null {
  const indice = linea.search(/[:：]/)
  if (indice <= 0) return null
  const nombre = linea
    .slice(0, indice)
    .replace(ADORNO_INICIAL, '')
    .replace(ENFASIS, '')
    .trim()
  if (!nombre) return null
  const valor = linea
    .slice(indice + 1)
    .replace(/^[\s:：]+/, '') // dos puntos de más
    .replace(/^[*_]+\s*/, '') // el cierre del énfasis de la etiqueta (`**PALETA:** …`)
    .trim()
  return { nombre, valor }
}

function etiquetaDe(nombre: string): Etiqueta | null {
  const normal = sinTildes(nombre).toUpperCase().replace(/\s+/g, ' ').trim()
  return ALIAS[normal] ?? null
}

/** ¿Tiene forma de etiqueta (todo en mayúsculas, corta) aunque el contrato no la defina? */
function pareceEtiqueta(nombre: string): boolean {
  return /^[A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ ]{1,29}$/.test(nombre.trim())
}

/** Saca comillas o corchetes que envuelven el valor ENTERO. */
function desenvolver(valor: string): string {
  const pares: [string, string][] = [
    ['"', '"'],
    ['“', '”'],
    ['«', '»'],
    ['[', ']'],
  ]
  for (const [abre, cierra] of pares) {
    if (valor.length >= 2 && valor.startsWith(abre) && valor.endsWith(cierra)) {
      return valor.slice(abre.length, valor.length - cierra.length).trim()
    }
  }
  return valor
}

const ITEM_DE_LISTA = /^\s*(?:[-*•·]\s+|\d+[.)]\s+)/

function limpiarItem(item: string): string {
  return desenvolver(item.replace(ITEM_DE_LISTA, '').replace(ENFASIS, '').trim())
}

/**
 * Las secciones de una línea: por `·`, `•`, `|`, `;` o ` / `; por comas solo si
 * no hay otro. Los corchetes que envuelven la lista entera se sacan antes de
 * partir; las comillas, de cada sección (el Gem las pone por sección).
 */
export function partirSecciones(valor: string): string[] {
  const limpio = valor.trim()
  const sinCorchetes = /^\[(.*)\]$/.exec(limpio)?.[1]?.trim() ?? limpio
  let partes = sinCorchetes.split(/\s*[·•|;]\s*|\s+\/\s+/)
  if (partes.length === 1 && sinCorchetes.includes(',')) partes = sinCorchetes.split(',')
  return partes.map(limpiarItem).filter(Boolean)
}

type Renglon =
  | { tipo: 'etiqueta'; etiqueta: Etiqueta; valor: string }
  | { tipo: 'otra' }
  | { tipo: 'blanco' }
  | { tipo: 'item' }
  | { tipo: 'texto' }

function clasificar(linea: string): Renglon {
  if (!linea.trim()) return { tipo: 'blanco' }
  const partida = partir(linea)
  if (partida) {
    const etiqueta = etiquetaDe(partida.nombre)
    if (etiqueta) return { tipo: 'etiqueta', etiqueta, valor: partida.valor }
    if (pareceEtiqueta(partida.nombre)) return { tipo: 'otra' }
  }
  if (ITEM_DE_LISTA.test(linea)) return { tipo: 'item' }
  return { tipo: 'texto' }
}

/**
 * Hasta dónde llega un encabezado que empieza en `inicio`: mientras sigan
 * etiquetas del contrato, renglones en blanco, o ítems de una SECCIONES que quedó
 * sin valor en su línea. Una etiqueta que el contrato no define también entra,
 * pero solo PEGADA a las demás: después de un renglón en blanco ya es el cuerpo
 * del documento (`EL NEGOCIO: …`), no el encabezado. Devuelve el índice del
 * último renglón que pertenece al encabezado.
 */
function finDelEncabezado(renglones: Renglon[], inicio: number): number {
  let fin = inicio
  let listaAbierta = false
  let huboBlanco = false
  for (let i = inicio; i < renglones.length; i++) {
    const r = renglones[i]!
    if (r.tipo === 'blanco') {
      huboBlanco = true
      continue
    }
    if (r.tipo === 'etiqueta') {
      listaAbierta = r.etiqueta === 'SECCIONES' && r.valor === ''
    } else if (r.tipo === 'otra' && !huboBlanco) {
      listaAbierta = false
    } else if (r.tipo !== 'item' || !listaAbierta) {
      break
    }
    fin = i
    huboBlanco = false
  }
  return fin
}

function etiquetasDistintas(renglones: Renglon[], desde: number, hasta: number): number {
  const vistas = new Set<Etiqueta>()
  for (let i = desde; i <= hasta; i++) {
    const r = renglones[i]!
    if (r.tipo === 'etiqueta') vistas.add(r.etiqueta)
  }
  return vistas.size
}

/**
 * Lee el encabezado de un documento pegado. Nunca lanza: un texto sin encabezado
 * degrada a `sin-encabezado`, y uno vacío a `vacio`.
 */
export function leerEncabezado(texto: string | null | undefined): LecturaEncabezado {
  if (!texto?.trim()) return { estado: 'vacio' }

  const lineas = texto.replace(/\r\n?/g, '\n').split('\n')
  const renglones = lineas.map(clasificar)

  let inicio = -1
  let fin = -1
  for (let i = 0; i < renglones.length; i++) {
    if (renglones[i]!.tipo !== 'etiqueta') continue
    const hasta = finDelEncabezado(renglones, i)
    if (etiquetasDistintas(renglones, i, hasta) >= 2) {
      inicio = i
      fin = hasta
      break
    }
  }

  if (inicio === -1) {
    return { estado: 'sin-encabezado', renglones: lineas.filter((l) => l.trim()).length }
  }

  const textos: Partial<Record<Exclude<Etiqueta, 'SECCIONES'>, string>> = {}
  const secciones: string[] = []
  const vistas = new Set<Etiqueta>()
  const otras: LineaConservada[] = []
  const repetidas: LineaConservada[] = []
  let enListaDeSecciones = false

  for (let i = inicio; i <= fin; i++) {
    const r = renglones[i]!
    const original = lineas[i]!.trim()
    if (r.tipo === 'otra') {
      otras.push({ linea: i + 1, texto: original })
      enListaDeSecciones = false
      continue
    }
    if (r.tipo === 'item') {
      const item = enListaDeSecciones ? limpiarItem(lineas[i]!) : ''
      if (item) secciones.push(item)
      continue
    }
    if (r.tipo !== 'etiqueta') continue

    enListaDeSecciones = false
    if (vistas.has(r.etiqueta)) {
      repetidas.push({ linea: i + 1, texto: original })
      continue
    }
    vistas.add(r.etiqueta)

    if (r.etiqueta === 'SECCIONES') {
      if (r.valor === '') enListaDeSecciones = true
      else secciones.push(...partirSecciones(r.valor))
      continue
    }
    const valor = desenvolver(r.valor)
    if (valor) textos[r.etiqueta] = valor
  }

  const valores: ValoresEncabezado = {
    ...textos,
    ...(secciones.length > 0 ? { SECCIONES: secciones } : {}),
  }

  const presente = (e: Etiqueta) => (e === 'SECCIONES' ? Boolean(valores.SECCIONES?.length) : Boolean(valores[e]))
  const faltanObligatorias = OBLIGATORIAS.filter((e) => !presente(e))
  const faltanOpcionales = ETIQUETAS.filter((e) => !esObligatoria(e) && !presente(e))
  const antes = lineas.slice(0, inicio).filter((l) => l.trim()).length

  return {
    estado: faltanObligatorias.length === 0 ? 'completo' : 'incompleto',
    valores,
    faltanObligatorias,
    faltanOpcionales,
    otras,
    repetidas,
    antes,
  }
}
