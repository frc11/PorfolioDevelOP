/**
 * EL MODELO DE TINTA Y SUPERFICIE — qué color queda arriba de qué color, en las
 * ocho secciones.
 *
 * Tercer archivo del frente por la regla de las 300 líneas, y el corte no es de
 * conveniencia: `s10-acceso.ts` LEE MARCADO —no sabe qué es un hex— y este
 * archivo resuelve COLOR —no sabe qué es un lector de pantalla—.
 *
 * ⚠ **Ningún hex se escribe acá: todos se LEEN de `theme-develop.css`** con el
 * resolvedor del banco. Es la única forma de que la tabla del reporte se mueva
 * si alguien cambia un token, en vez de quedar publicada con el valor de ayer.
 * El único literal de color está en el control positivo, que necesita un valor
 * fabricado por definición.
 *
 * ── LA ASIMETRÍA QUE ESTE ARCHIVO EXISTE PARA VER ──────────────────────────
 *
 * `[data-seccion="invertida"]` redefine unos tokens y hereda otros, y **cuál es
 * cuál cambia con el tema**: por eso ningún hex se resuelve acá sin preguntar
 * antes en qué sección cae. Hasta SITIO-S10 el bloque invertido redefinía
 * `--color-fondo`, `--color-tinta`, los dos bordes y la superficie translúcida,
 * y **NO** `--color-tinta-media` ni `--color-tinta-tenue`: una utilidad
 * `text-tinta-media` escrita adentro de una sección invertida pintaba el MISMO
 * gris medio que sobre el papel, ahora sobre #0E0E0E. Eso no lo ve un
 * componente que se verificó solo, porque el componente no sabe en qué sección
 * lo van a montar — sólo se ve recorriendo las ocho juntas, que es el encargo.
 *
 * ⚠️ **SITIO-S11 REDEFINIÓ LAS DOS, y este modelo tuvo que seguir la cascada.**
 * `tintaDeClases` devolvía el hex CLARO de media y tenue en las dos ramas, y era
 * lo correcto mientras el tema no las diera vuelta. Ahora las da vuelta, y
 * seguir devolviendo el claro no sería conservador: sería medir una hoja que ya
 * no existe y publicar un fallo de AA que el navegador no comete. El modelo
 * pregunta por `valorInvertido()` igual que ya hacía con `--color-tinta`, así
 * que la asimetría se sigue VIENDO donde está.
 */

import { TEMA, valorDeToken } from './s10-css'
import { atributo, nodosDe, textoDe, type Nodo } from './s10-recorrido'

/** Los umbrales de WCAG 2.x para texto normal. */
export const AA = 4.5
export const AAA = 7

/** El bloque de la sección invertida, aislado del resto del tema. */
const BLOQUE_INVERTIDO: string =
  /\[data-seccion="invertida"\]\s*\{([\s\S]*?)\n\}/.exec(TEMA)?.[1] ?? ''

/**
 * El valor de un token DENTRO de la sección invertida, con su herencia.
 *
 * Si el bloque no lo redefine, devuelve el del tema claro — que es exactamente
 * lo que hace la cascada, y exactamente el defecto que hay que poder ver.
 */
export function valorInvertido(nombre: string): string {
  const propio = new RegExp(`(?:^|[;{\\s])${nombre}\\s*:\\s*([^;]+);`).exec(BLOQUE_INVERTIDO)
  return propio === null ? valorDeToken(nombre) : propio[1].trim()
}

/** Si el bloque invertido REDEFINE el token, o lo hereda del tema claro. */
export function loRedefineLaInvertida(nombre: string): boolean {
  return new RegExp(`(?:^|[;{\\s])${nombre}\\s*:`).test(BLOQUE_INVERTIDO)
}

const hex = (valor: string): string => /#[0-9A-Fa-f]{6}/.exec(valor)?.[0].toUpperCase() ?? ''

/** Los colores del sistema, leídos del tema. Ni uno escrito acá. */
export const COLOR = {
  papel: hex(valorDeToken('--color-fondo')),
  oscuro: hex(valorInvertido('--color-fondo')),
  tintaClara: hex(valorDeToken('--color-tinta')),
  tintaInvertida: hex(valorInvertido('--color-tinta')),
  media: hex(valorDeToken('--color-tinta-media')),
  tenue: hex(valorDeToken('--color-tinta-tenue')),
  mediaInvertida: hex(valorInvertido('--color-tinta-media')),
  tenueInvertida: hex(valorInvertido('--color-tinta-tenue')),
  acentoWeb: hex(valorDeToken('--color-acento-web')),
  acentoIa: hex(valorDeToken('--color-acento-ia-automatizacion')),
  acentoSoftware: hex(valorDeToken('--color-acento-software')),
} as const

/** El alfa de `opacity-casi`, leído del tema. */
export const ALFA_CASI = Number.parseFloat(valorDeToken('--opacity-casi'))

/**
 * Compone un color con alfa sobre un fondo, a 8 bits, ANTES de medir.
 *
 * Es la misma función que `s6-contraste.invariant.ts` usa, y se repite acá por
 * una razón declarada: aquélla es privada de ese archivo y este frente no puede
 * modificarlo para exportarla. Se anota como duplicación conocida.
 */
export function componer(color: string, fondo: string, alfa: number): string {
  const canal = (h: string, i: number): number => Number.parseInt(h.slice(1 + i * 2, 3 + i * 2), 16)
  const mezcla = (i: number): number => Math.round(alfa * canal(color, i) + (1 - alfa) * canal(fondo, i))
  return `#${[0, 1, 2].map((i) => mezcla(i).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

// ── La superficie de cada sección, leída del marcado ────────────────────────

export interface SuperficieDeSeccion {
  readonly id: string
  /** El modo declarado en `_lib/secciones.ts`, tal como sale al marcado. */
  readonly modo: string
  readonly invertida: boolean
  /** El hex de fondo, o `null` si el fondo es la ESCENA y no un token. */
  readonly fondo: string | null
}

/**
 * Las ocho superficies, **derivadas del marcado** y no de la tabla.
 *
 * `data-superficie` y `data-seccion` los emite el propio panel, así que si
 * alguien cambia el recorrido en `secciones.ts` esta lista se mueve sola. Leer
 * la tabla sería una segunda fuente de la misma verdad.
 */
export function superficiesDelDocumento(html: string): SuperficieDeSeccion[] {
  return nodosDe(html)
    .filter((n) => atributo(n, 'data-superficie') !== null)
    .map((n) => {
      const modo = atributo(n, 'data-superficie') ?? ''
      const invertida = atributo(n, 'data-seccion') === 'invertida'
      return {
        id: atributo(n, 'id') ?? '',
        modo,
        invertida,
        fondo: modo === 'papel-transparente' ? null : invertida ? COLOR.oscuro : COLOR.papel,
      }
    })
}

// ── La tinta de cada caja de texto ──────────────────────────────────────────

export interface Tinta {
  /** El token que la nombra, para poder señalar el arreglo. */
  readonly token: string
  readonly hex: string
  readonly alfa: number
}

/**
 * La tinta EFECTIVA de un elemento: la utilidad que declara, resuelta contra el
 * contexto de la sección.
 *
 * **Las TRES tintas se resuelven por contexto**, no sólo la primaria: cada una
 * pregunta si el bloque invertido la redefine y usa el valor que la cascada
 * dejaría vigente ahí. Hasta SITIO-S10 media y tenue devolvían el mismo hex en
 * las dos ramas, y no era un descuido de esta función: era lo que la cascada
 * hacía, y era el hallazgo. S11 dio vuelta las dos en el tema, así que ahora la
 * cascada dice otra cosa y esta función dice lo mismo que ella.
 */
export function tintaDeClases(clases: string, invertida: boolean, acento: string): Tinta {
  const lista = clases.split(/\s+/)
  const base = invertida ? COLOR.tintaInvertida : COLOR.tintaClara
  const alfa = lista.includes('opacity-casi') ? ALFA_CASI : 1
  if (lista.includes('text-tinta-media'))
    return { token: '--color-tinta-media', hex: invertida ? COLOR.mediaInvertida : COLOR.media, alfa }
  if (lista.includes('text-tinta-tenue'))
    return { token: '--color-tinta-tenue', hex: invertida ? COLOR.tenueInvertida : COLOR.tenue, alfa }
  if (lista.includes('text-acento')) return { token: '--color-acento', hex: acento, alfa }
  return { token: '--color-tinta', hex: base, alfa }
}

/** Las utilidades de tinta que este modelo reconoce. Un padrón, no una regex. */
export const UTILIDADES_DE_TINTA: readonly string[] = [
  'text-tinta',
  'text-tinta-media',
  'text-tinta-tenue',
  'text-acento',
  'opacity-casi',
]

const ACENTO_POR_SERVICIO: Readonly<Record<string, string>> = {
  web: COLOR.acentoWeb,
  'ia-automatizacion': COLOR.acentoIa,
  software: COLOR.acentoSoftware,
}

/** El acento vigente para un nodo: el del `[data-servicio]` que lo contiene. */
export function acentoQueRige(nodos: readonly Nodo[], nodo: Nodo): string {
  let vigente = COLOR.acentoWeb // el defecto de `@theme`: la home no declara atributo
  for (const candidato of nodos) {
    const servicio = atributo(candidato, 'data-servicio')
    if (servicio === null) continue
    if (candidato.desde > nodo.desde || candidato.hasta < nodo.hasta) continue
    vigente = ACENTO_POR_SERVICIO[servicio] ?? vigente
  }
  return vigente
}

export interface CajaDeColor {
  readonly seccion: string
  readonly modo: string
  readonly etiqueta: string
  /** El nivel tipográfico, o `(sin nivel)` cuando el elemento no lo declara. */
  readonly nivel: string
  readonly tinta: Tinta
  /** La tinta ya compuesta sobre su fondo. Igual al hex si el alfa es 1. */
  readonly pintado: string
  readonly fondo: string | null
  /** `null` cuando el fondo es la escena: ahí no hay un token contra el que medir. */
  readonly razon: number | null
  readonly texto: string
}

/**
 * TODA caja de texto del documento con su razón de contraste.
 *
 * ⚠ **Recorre todos los elementos, no sólo los que llevan `data-nivel`.** El
 * primer barrido de este frente miró las cajas de tipografía y se perdió el
 * `<p>` de ayuda del formulario del Cierre, que no declara nivel y **es el peor
 * caso del sitio**. Un instrumento que mira sólo lo que el sistema marcó no ve
 * lo que el sistema no marcó, que es justo donde vive un defecto.
 */
export function cajasDeColor(html: string): CajaDeColor[] {
  const nodos = nodosDe(html)
  const superficies = new Map(superficiesDelDocumento(html).map((s) => [s.id, s]))
  const salida: CajaDeColor[] = []

  for (const nodo of nodos) {
    if (nodo.seccion === null) continue
    const texto = textoDe(html, nodo).trim()
    if (texto === '') continue
    const clases = atributo(nodo, 'class') ?? ''
    const declara = clases.split(/\s+/).some((c) => UTILIDADES_DE_TINTA.includes(c))
    // Sólo los que DECLARAN una tinta, más las hojas, que heredan la de arriba.
    const esHoja = !html.slice(nodo.desde, nodo.hasta).includes('<')
    if (!declara && !esHoja) continue

    const superficie = superficies.get(nodo.seccion)
    if (superficie === undefined) continue
    const tinta = tintaDeClases(
      declara ? clases : heredada(html, nodos, nodo),
      superficie.invertida,
      acentoQueRige(nodos, nodo),
    )
    const fondo = superficie.fondo
    const pintado = fondo === null ? tinta.hex : componer(tinta.hex, fondo, tinta.alfa)
    salida.push({
      seccion: nodo.seccion,
      modo: superficie.modo,
      etiqueta: nodo.etiqueta,
      nivel: atributo(nodo, 'data-nivel') ?? '(sin nivel)',
      tinta,
      pintado,
      fondo,
      razon: fondo === null ? null : razon(pintado, fondo),
      texto: texto.slice(0, 60),
    })
  }
  return salida
}

/** Las clases de tinta que un nodo HEREDA del ancestro más cercano que declara. */
function heredada(html: string, nodos: readonly Nodo[], nodo: Nodo): string {
  let mejor = ''
  let luz = Number.POSITIVE_INFINITY
  for (const candidato of nodos) {
    if (candidato.desde > nodo.desde || candidato.hasta < nodo.hasta) continue
    const clases = atributo(candidato, 'class') ?? ''
    if (!clases.split(/\s+/).some((c) => UTILIDADES_DE_TINTA.includes(c))) continue
    const ancho = candidato.hasta - candidato.desde
    if (ancho < luz) {
      luz = ancho
      mejor = clases
    }
  }
  return mejor
}

/** Razón de contraste WCAG 2.x. Misma fórmula que `afirmar.ts`, sin importarla
 *  para que este modelo se pueda controlar contra el arnés y no consigo mismo. */
export function razon(colorA: string, colorB: string): number {
  const luminancia = (color: string): number => {
    const n = Number.parseInt(color.slice(1), 16)
    const canal = (c: number): number => {
      const s = c / 255
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255)
  }
  const a = luminancia(colorA)
  const b = luminancia(colorB)
  return a > b ? (a + 0.05) / (b + 0.05) : (b + 0.05) / (a + 0.05)
}

/**
 * LO QUE MIDIÓ OTRO INSTRUMENTO — las dos secciones transparentes.
 *
 * No se vuelve a calcular acá y no se puede: su fondo es la escena, que es un
 * gradiente y no un token. SITIO-S9 lo midió con su propio instrumento y sus
 * dos cifras se CITAN, con la atribución adentro del dato para que no se
 * puedan copiar sin ella.
 */
export const CONTRASTE_CONTRA_LA_ESCENA: readonly {
  readonly seccion: string
  readonly razon: number
  readonly instrumento: string
}[] = [
  { seccion: 'hero', razon: 9.73, instrumento: 'SITIO-S9 — la tinta sobre la escena en el Hero' },
  { seccion: 'por-que-develop', razon: 6.07, instrumento: 'SITIO-S9 — el diferencial, el peor punto del recorrido' },
]
