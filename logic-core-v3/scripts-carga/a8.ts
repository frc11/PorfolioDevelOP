/**
 * [B1.2d] A8 · LA MATRIZ DEL PORTFOLIO, PURA — las combinaciones que corre el arnés (`matriz.ts`) y la cuenta del invariante sobre una
 * foto de la página en reposo (§14, A8): si el scroll está adentro del tramo, el panel está a la vista y en un estado válido; si está
 * afuera, no está; sin estados colgados (un vuelo, un orden sin asentar) y con la píldora de la barra en su lugar. s76 prueba la cuenta
 * con su control. Sin Playwright.
 */

import { izquierdaCorrida } from '../src/app/v3/_chrome/barra/corrimiento'

/**
 * Cómo se entra al Portfolio. La barra de scroll del sitio está oculta (`globals.css`, «Ghost Mode»): su arrastre se reproduce por lo
 * que produce, el scroll nativo sin rueda ni teclas.
 */
export const ENTRADAS = ['rueda-desde-arriba', 'rueda-desde-demos', 'pagina-abajo', 'pagina-arriba', 'flechas', 'barra-de-scroll', 'hash-trabajos', 'hash-portfolio', 'barra-de-navegacion'] as const
export type Entrada = (typeof ENTRADAS)[number]

/** Cómo se sale: hacia Demos, hacia arriba o con el clic afuera (A11). */
export const SALIDAS = ['demos', 'arriba', 'clic-afuera'] as const
export type Salida = (typeof SALIDAS)[number]

export type Velocidad = 'lenta' | 'rapida'

export interface Combinacion {
  readonly entrada: Entrada
  readonly salida: Salida
  /** El puntero sobre el panel (los lomos) durante todo el recorrido, o sobre la columna. */
  readonly hover: boolean
  readonly velocidad: Velocidad
}

/** Las entradas que son un salto (el hash, el menú): la velocidad no les cambia nada, van una vez. */
const SON_UN_SALTO: ReadonlySet<Entrada> = new Set<Entrada>(['hash-trabajos', 'hash-portfolio', 'barra-de-navegacion'])

/**
 * [B1.2d] A2.3 · Las entradas con la rueda van sólo lentas (de a una muesca): la rápida (el deslizamiento con inercia del trackpad) ES una
 * ráfaga y ya no entra: saltea el Portfolio. Sus combinaciones pasan a las de la ráfaga (`combinacionesDeRafaga`).
 */
const SON_DE_LA_RUEDA: ReadonlySet<Entrada> = new Set<Entrada>(['rueda-desde-arriba', 'rueda-desde-demos'])

/** Cuántas idas y vueltas por combinación. */
export const IDAS_Y_VUELTAS = 3

/** Todas: cada entrada con cada salida, con y sin hover, lenta y rápida (las de un salto, una sola vez). */
export function combinaciones(): Combinacion[] {
  const salida: Combinacion[] = []
  for (const entrada of ENTRADAS) {
    const velocidades: readonly Velocidad[] = SON_UN_SALTO.has(entrada) || SON_DE_LA_RUEDA.has(entrada) ? ['lenta'] : ['lenta', 'rapida']
    for (const s of SALIDAS) for (const hover of [false, true]) for (const velocidad of velocidades) salida.push({ entrada, salida: s, hover, velocidad })
  }
  return salida
}

/**
 * [B1.2d] A2.3 · LA RÁFAGA EN LA MATRIZ: entrar con una ráfaga (bajando desde la aproximación, subiendo desde la cola) saltea el Portfolio
 * entero; con el panel adentro, una ráfaga sale (bajando a Demos, subiendo hacia arriba) sin recorrer los proyectos que faltan. Con
 * muescas (cinco en 200 ms) y con el trackpad (el deslizamiento con inercia), con y sin hover.
 */
export const RAFAGAS = ['entrar-bajando', 'entrar-subiendo', 'adentro-bajando', 'adentro-subiendo'] as const
export type Rafaga = (typeof RAFAGAS)[number]
export const GESTOS_DE_RAFAGA = ['muescas', 'trackpad'] as const
export type GestoDeRafaga = (typeof GESTOS_DE_RAFAGA)[number]

export interface CombinacionDeRafaga {
  readonly rafaga: Rafaga
  readonly gesto: GestoDeRafaga
  readonly hover: boolean
}

export function combinacionesDeRafaga(): CombinacionDeRafaga[] {
  const salida: CombinacionDeRafaga[] = []
  for (const rafaga of RAFAGAS) for (const gesto of GESTOS_DE_RAFAGA) for (const hover of [false, true]) salida.push({ rafaga, gesto, hover })
  return salida
}

/**
 * Lo que la ráfaga no puede hacer, de lo grabado cuadro a cuadro durante el gesto: entrar (la píldora se corrió o el panel entró) cuando
 * la ráfaga entraba al tramo, o recorrer los proyectos (más de UNO además del de partida: la primera muesca ya dio su paso cuando la
 * ráfaga se reconoce).
 */
export function violacionesDeLaRafaga(r: Rafaga, cuadros: readonly { readonly barra: boolean; readonly panel: boolean; readonly paso: number }[], desde: number): ('entro-con-la-rafaga' | 'recorrio-de-mas')[] {
  const v: ('entro-con-la-rafaga' | 'recorrio-de-mas')[] = []
  if (r.startsWith('entrar') && cuadros.some((c) => c.barra || c.panel)) v.push('entro-con-la-rafaga')
  const visitados = new Set(cuadros.map((c) => c.paso).filter((p) => p >= 0 && p <= 3 && p !== desde))
  if (r.startsWith('adentro') && visitados.size > 1) v.push('recorrio-de-mas')
  return v
}

/** De qué lado del pin arranca cada entrada: desde arriba (la aproximación) o desde Demos. */
export const desdeDemos = (e: Entrada): boolean => e === 'rueda-desde-demos' || e === 'pagina-arriba'

/** La foto de la página en reposo que toma el arnés (todo en px de la ventana). */
export interface FotoDelPortfolio {
  readonly ancho: number
  /** Si se asentó (sin vuelo, el orden quieto, el scroll quieto) antes del tope de espera. */
  readonly quieta: boolean
  readonly paso: number
  readonly panelAdentro: boolean
  readonly ordenQuieto: boolean
  readonly enVuelo: boolean
  readonly barra: boolean
  /** El borde izquierdo del panel ahora y el de su lugar (en el layout, sin la transformada). */
  readonly panelIzq: number
  readonly bordeDelPanel: number
  readonly eje: number
  readonly finDelSonido: number
  readonly pastilla: { readonly l: number; readonly r: number }
  /** Si la píldora tiene su posición escrita en línea (corrida o corriéndose). */
  readonly pastillaEnLinea: boolean
  /** Las fallas del Portfolio que ve el diagnóstico de la carga (`portfolio-*`). */
  readonly fallas: readonly string[]
}

export type Violacion = 'no-se-asento' | 'vuelo-colgado' | 'orden-sin-asentar' | 'no-entro' | 'no-salio' | 'panel-fuera-de-lugar' | 'barra-fuera-de-lugar' | 'diagnostico'

/** La tolerancia de las cajas (px). */
const UN_PX = 1

/** Lo que viola la foto (vacío: bien). `esperado`: adentro del tramo (después de entrar) o afuera (después de salir). */
export function violaciones(f: FotoDelPortfolio, esperado: 'adentro' | 'afuera'): Violacion[] {
  const v: Violacion[] = []
  const adentro = f.paso >= 0 && f.paso <= 3
  if (!f.quieta) v.push('no-se-asento')
  if (f.enVuelo) v.push('vuelo-colgado')
  if (!f.ordenQuieto) v.push('orden-sin-asentar')
  if (esperado === 'adentro' && !adentro) v.push('no-entro')
  if (esperado === 'afuera' && adentro) v.push('no-salio')
  const panelBien = adentro ? f.panelAdentro && Math.abs(f.panelIzq - f.bordeDelPanel) <= UN_PX : !f.panelAdentro && f.panelIzq >= f.ancho - UN_PX
  if (!panelBien) v.push('panel-fuera-de-lugar')
  if (f.ancho >= 1024) {
    const anchoDeLaPastilla = f.pastilla.r - f.pastilla.l
    const barraBien = adentro
      ? f.barra && f.pastillaEnLinea && Math.abs(f.pastilla.l - izquierdaCorrida({ eje: f.eje, borde: f.bordeDelPanel }, anchoDeLaPastilla, f.finDelSonido)) <= UN_PX
      : !f.barra && !f.pastillaEnLinea && Math.abs((f.pastilla.l + f.pastilla.r) / 2 - f.ancho / 2) <= UN_PX
    if (!barraBien) v.push('barra-fuera-de-lugar')
  }
  if (f.fallas.length > 0) v.push('diagnostico')
  return v
}
