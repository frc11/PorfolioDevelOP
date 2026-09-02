/**
 * LO QUE SE MUEVE CUANDO SE MUEVE LA ESCALA — el titular del Hero, las líneas
 * de cada bloque y la tinta de cada sección.
 *
 * Tercer archivo de la banda por la regla de las 300 líneas del repo, y el
 * corte es por tema y por dependencia: `s3-banda.ts` sólo lee la HOJA —resuelve
 * tokens contra un ancho y no monta nada—, mientras esto necesita el MARCADO
 * DEL SERVIDOR y la geometría del Hero. Mezclarlos habría hecho que una tabla
 * de `clamp()` dependiera de que el home entero renderice.
 *
 * ── Qué contesta cada pieza, y qué NO ─────────────────────────────────────
 *
 *   · **`titularDelHero`** — la fracción de la ventana que ocupa el titular.
 *     Es la cifra que la instrucción de V3-C pide como «el número que el ojo
 *     lee como chico», y la única que cae sola cuando la ventana crece y la
 *     tipografía no.
 *   · **`lineasPorBloque`** — cuántas líneas ocupa cada bloque con `data-nivel`.
 *     Es lo que el divisor de P1 anima, una por una.
 *   · **`tintaPorSeccion`** — la suma de cajas de línea de cada sección. Es un
 *     PISO —ignora rellenos y separaciones— y sirve para contestar si un alto
 *     declarado en `secciones.ts` queda corto, sin tocar esa tabla.
 *
 * ⚠ Ninguna de las tres es una medición de navegador: las tres salen del modelo
 * de composición de `s10-avance.ts`, con sus tres supuestos declarados allá
 * —instancia por defecto de la variable, sin kerning, corte por palabra—. Los
 * tres empujan para el mismo lado, así que **lo que se reporta es un PISO**.
 */

import { GEOMETRIA, TIPOGRAFIA_DEL_TITULAR } from '../../_secciones/hero/Hero'
import { CONTENIDO as HERO } from '../../_secciones/hero/contenido'
import { SECCIONES } from '../secciones'
import { NIVELES_TIPOGRAFICOS, type Nivel } from '../tipografia'
import { FLUIDOS } from './s3-banda'
import { anchoDeTexto, lineasDeTexto } from './s10-avance'
import { marcadoDelHome } from './s10-banco'
import { BREAKPOINTS, anchoDeContenido, tokenPx } from './s10-css'
import { CHIVO, altoDeTinta, tokenDeCaja, tracking } from './s10-mobile'
import { atributo, nodosDe } from './s10-recorrido'

/**
 * LA MEDIDA DEL TITULAR DEL HERO a un ancho — derivada de los componentes que
 * la producen, no escrita.
 *
 * `Envoltorio` (a sangre, relleno lateral FIJO, contenido topado en
 * `--container-tope`) → `Grilla columnas="lateral"` (140px fijos + una fluida,
 * y colapsa abajo de `tablet`) → `Grilla columnas={5}` (que **no existe** abajo
 * de `escritorio`) → el bloque de `GEOMETRIA.columnasDeLaMedida` de 5.
 *
 * ⚠ Supuesto declarado: la canaleta es la del modo `conmutado`, que es el
 * defecto de `Grilla` y el que las dos grillas del Hero usan.
 */
export function medidaDelTitular(ancho: number): number {
  const contenido = anchoDeContenido(ancho)
  if (ancho < BREAKPOINTS.tablet) return contenido
  const canal = tokenPx(
    ancho >= BREAKPOINTS.escritorio ? '--grilla-canal-amplio' : '--grilla-canal-compacto',
    0,
  )
  const fluida = contenido - tokenPx('--columna-lateral', 0) - canal
  if (ancho < BREAKPOINTS.escritorio) return fluida
  const columna = (fluida - (GEOMETRIA.columnasTotales - 1) * canal) / GEOMETRIA.columnasTotales
  const n = GEOMETRIA.columnasDeLaMedida
  return n * columna + (n - 1) * canal
}

export interface TitularMedido {
  readonly ancho: number
  /** El tamaño del nivel del titular a ese ancho. */
  readonly tamano: number
  /** El ancho del bloque que lo contiene. */
  readonly medida: number
  /** Lo que mediría el titular EN UNA SOLA LÍNEA, con la métrica de Chivo. */
  readonly tinta: number
  /** La tinta como fracción de la ventana. **El número que el ojo lee.** */
  readonly fraccion: number
  /** En cuántas líneas corta dentro de su medida. Es lo que P1 anima. */
  readonly lineas: number
}

/**
 * EL NÚMERO QUE EL OJO LEE COMO «CHICO».
 *
 * `tinta / ancho` es la fracción de la ventana que el titular ocuparía en una
 * sola línea. Con el mismo texto y la misma familia es proporcional al tamaño
 * del nivel, así que **es exactamente la cifra que cae cuando la ventana crece
 * y la tipografía no**. Va acompañada de la medida y de las líneas porque las
 * tres se mueven juntas y una sola de ellas no se puede juzgar.
 *
 * Los tres supuestos del modelo de composición son los de `s10-avance.ts`:
 * instancia por defecto de la variable, sin kerning, corte por palabra. Los
 * tres empujan para el mismo lado, así que la tinta es un PISO.
 */
export function titularDelHero(ancho: number): TitularMedido {
  const nivel = nivelDelTitular()
  const tamano = tokenPx(`--text-fluido-${nivel}`, ancho)
  const medida = medidaDelTitular(ancho)
  const em = tracking(NIVELES_TIPOGRAFICOS[nivel].interletrado)
  const tinta = anchoDeTexto(CHIVO, HERO.titular, tamano, em)
  return {
    ancho,
    tamano,
    medida,
    tinta,
    fraccion: tinta / ancho,
    lineas: lineasDeTexto(CHIVO, HERO.titular, medida, tamano, em),
  }
}

/**
 * El nivel del titular, LEÍDO de la constante que el Hero renderiza.
 *
 * `TIPOGRAFIA_DEL_TITULAR` es la cadena de clases que el componente pasa a
 * `TextoPorLineas`. Sacar el nivel de ahí —en vez de escribir `titulo-xl`—
 * significa que el día que el Hero cambie de nivel esta medición lo sigue sola.
 */
export function nivelDelTitular(): Nivel {
  const clases = TIPOGRAFIA_DEL_TITULAR.split(/\s+/)
  const encontrado = FLUIDOS.find((n) =>
    clases.includes(NIVELES_TIPOGRAFICOS[n].claseFluida ?? ''),
  )
  if (encontrado === undefined) {
    throw new Error(`el titular del Hero no usa ninguna clase fluida: ${TIPOGRAFIA_DEL_TITULAR}`)
  }
  return encontrado
}

export interface BloqueDeTexto {
  readonly seccion: string
  readonly nivel: Nivel
  readonly lineas: number
}

/**
 * CUÁNTAS LÍNEAS OCUPA CADA BLOQUE DE TEXTO — lo que el divisor de P1 anima.
 *
 * El divisor de líneas del sistema de motion **mide** dónde corta cada línea en
 * el navegador y anima una por una (`_lib/motion/lineas.ts`). Acá no hay
 * navegador, así que la cuenta sale del modelo de composición: es la misma que
 * `altoDeTinta` usa por dentro, y **se le pide a esa función en vez de
 * reescribirla** — corriéndola sobre UN solo índice y dividiendo por la caja de
 * línea de ese nivel. Cero lógica duplicada y cero refactor de la plomería del
 * frente de mobile, que en este momento comparten otros lanes.
 *
 * Las cajas de medio (`aspect-ratio`) quedan afuera: no tienen `data-nivel`.
 */
export function lineasPorBloque(ancho: number, rama: 'quieta' | 'animada' = 'animada'): BloqueDeTexto[] {
  const html = marcadoDelHome(rama)
  const salida: BloqueDeTexto[] = []
  for (const n of nodosDe(html)) {
    const nivel = atributo(n, 'data-nivel')
    if (nivel === null || !(nivel in NIVELES_TIPOGRAFICOS)) continue
    const definicion = NIVELES_TIPOGRAFICOS[nivel as Nivel]
    const tamano = tokenPx(tokenDeCaja(nivel as Nivel, atributo(n, 'class') ?? ''), ancho)
    const caja = tamano * tokenPx(`--leading-${definicion.interlineado}`, ancho)
    const alto = altoDeTinta(html, n.indice, n.indice, ancho)
    salida.push({ seccion: n.seccion ?? '(sin sección)', nivel: nivel as Nivel, lineas: alto / caja })
  }
  return salida
}

export interface TintaDeSeccion {
  readonly seccion: string
  /** La suma de cajas de línea y cajas de medio de la sección. Es un PISO. */
  readonly px: number
}

/**
 * LO QUE SE MUEVE SOLO cuando la escala se mueve: la tinta de cada sección.
 *
 * Cambiar el tamaño del texto cambia cuántas líneas ocupa cada bloque, y con
 * eso el alto de la sección y cuánto sobra adentro de una caja pinneada. Se
 * mide con el MISMO modelo que el frente de mobile (`s10-mobile.altoDeTinta`),
 * con sus tres supuestos declarados allá — es un PISO, no un alto real.
 *
 * ⚠ Abajo del ancla esta función tiene que dar EXACTAMENTE lo mismo antes y
 * después de V3-C, porque abajo del ancla ningún token se movió. Que dé lo
 * mismo es la comprobación; que dé distinto arriba es el efecto.
 */
export function tintaPorSeccion(ancho: number, rama: 'quieta' | 'animada' = 'animada'): TintaDeSeccion[] {
  const html = marcadoDelHome(rama)
  const nodos = nodosDe(html)
  return SECCIONES.map((s) => {
    // El tramo de índices de la sección, y no su subárbol: `data-seccion-id` lo
    // lleva un descendiente del `<section>`, así que buscar el contenedor por
    // etiqueta devolvería `null` como nombre y sumaría la sección equivocada.
    const propios = nodos.filter((n) => n.seccion === s.id)
    if (propios.length === 0) return { seccion: s.id, px: 0 }
    const desde = Math.min(...propios.map((n) => n.indice))
    const hasta = Math.max(...propios.map((n) => n.indice))
    return { seccion: s.id, px: altoDeTinta(html, desde, hasta, ancho) }
  })
}
