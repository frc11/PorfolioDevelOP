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

/** Cuántas idas y vueltas por combinación. */
export const IDAS_Y_VUELTAS = 3

/**
 * Todas: cada entrada con cada salida, con y sin hover, lenta y rápida (las de un salto, una sola vez). [F2] La rueda rápida (el
 * deslizamiento con inercia del trackpad) vuelve: ya no saltea el Portfolio, queda atrapada en la entrada.
 */
export function combinaciones(): Combinacion[] {
  const salida: Combinacion[] = []
  for (const entrada of ENTRADAS) {
    const velocidades: readonly Velocidad[] = SON_UN_SALTO.has(entrada) ? ['lenta'] : ['lenta', 'rapida']
    for (const s of SALIDAS) for (const hover of [false, true]) for (const velocidad of velocidades) salida.push({ entrada, salida: s, hover, velocidad })
  }
  return salida
}

/**
 * [F2] LA RÁFAGA EN LA MATRIZ (reemplaza a la de A2.3, que salteaba el Portfolio): una ráfaga que entra al tramo (bajando desde la
 * aproximación, subiendo desde la cola) queda ATRAPADA: el Portfolio entra entero y aterriza en El Garage (subiendo, en «la tuya»), y otra
 * ráfaga mientras entra se descarta. Con el panel adentro, una ráfaga avanza UN proyecto (bajando desde El Garage, a Esquina; subiendo
 * desde Banú, a Esquina). Con muescas (cinco en 200 ms) y con el trackpad (el deslizamiento con inercia), con y sin hover.
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

/** [F2] Dónde tiene que quedar cada ráfaga: entrando, en el primero del sentido; adentro, en el de al lado del de partida. */
export function pasoDeLaRafaga(r: Rafaga, desde: number): number {
  switch (r) {
    case 'entrar-bajando':
      return 0
    case 'entrar-subiendo':
      return 3
    case 'adentro-bajando':
      return desde + 1
    case 'adentro-subiendo':
      return desde - 1
  }
}

type CuadroDelOrden = { readonly barra: boolean; readonly panel: boolean; readonly paso: number }

/** [F2] ¿La píldora se corrió sin que entrara el panel? Cada tramo de cuadros con la barra corrida tiene que tener el panel adentro. */
export function pildoraSinPanel(cuadros: readonly CuadroDelOrden[]): boolean {
  let tramo: boolean | null = null
  for (const c of cuadros) {
    if (c.barra && tramo === null) tramo = c.panel
    else if (c.barra && c.panel) tramo = true
    else if (!c.barra && tramo !== null) {
      if (!tramo) return true
      tramo = null
    }
  }
  return tramo === false
}

export type ViolacionDeLaRafaga = 'no-aterrizo' | 'recorrio-de-mas' | 'pildora-sin-panel'

/**
 * [F2] Lo que la ráfaga no puede hacer, de lo grabado cuadro a cuadro: no quedar donde tiene que (`final`, el paso en reposo), pasar por
 * un paso que no es el de partida ni el de destino, o correr la píldora sin que entre el panel.
 */
export function violacionesDeLaRafaga(r: Rafaga, cuadros: readonly CuadroDelOrden[], desde: number, final: number): ViolacionDeLaRafaga[] {
  const v: ViolacionDeLaRafaga[] = []
  const destino = pasoDeLaRafaga(r, desde)
  if (final !== destino) v.push('no-aterrizo')
  if (cuadros.some((c) => c.paso !== desde && c.paso !== destino)) v.push('recorrio-de-mas')
  if (pildoraSinPanel(cuadros)) v.push('pildora-sin-panel')
  return v
}

// ─── [F1/F2] La entrada con la rueda, de punta a punta ────────────────────

/** Cómo se mueve la rueda en `entrada.ts`: de a una muesca, en ráfagas de cinco muescas o con el deslizamiento del trackpad. */
export type GestoDeLaEntrada = 'muescas' | 'rafaga' | 'trackpad'

/** Un cambio grabado (rAF, sólo cuando algo cambia): cuándo (ms), el scroll y lo que se ve. `gesto`: un gesto arrancó en ese momento. */
export interface CuadroDeLaEntrada {
  readonly t: number
  readonly y: number
  readonly paso: number
  readonly panel: boolean
  readonly barra: boolean
  readonly encabezado: boolean
  readonly gesto?: true
}

export type ViolacionDeLaEntrada = 'no-aparecio' | 'no-aterrizo-en-el-primero' | 'salteo-proyectos' | 'proyecto-sin-panel' | 'mas-de-uno-por-gesto' | 'pildora-sin-panel' | 'no-paso'

/**
 * [F2] Lo que la entrada con la rueda no puede hacer: el Portfolio se ve SIEMPRE (el panel entra, aterriza en El Garage bajando o en
 * «la tuya» subiendo), recorre los cuatro en orden con el panel adentro, avanza a lo sumo UNO por gesto (los cambios de paso entre dos
 * gestos) y la píldora no se corre sin que entre el panel (cada tramo con la barra corrida tiene el panel adentro en algún cuadro).
 */
export function violacionesDeLaEntrada(cuadros: readonly CuadroDeLaEntrada[], sentido: 'bajando' | 'subiendo'): ViolacionDeLaEntrada[] {
  const v: ViolacionDeLaEntrada[] = []
  const orden = sentido === 'bajando' ? [-1, 0, 1, 2, 3, 4] : [4, 3, 2, 1, 0, -1]
  const conPanel = cuadros.filter((c) => c.panel)
  if (conPanel.length === 0) v.push('no-aparecio')
  else if (conPanel[0]?.paso !== orden[1]) v.push('no-aterrizo-en-el-primero')
  const pasos = cuadros.map((c) => c.paso).filter((p, i, a) => i === 0 || p !== a[i - 1])
  const desde = orden.indexOf(pasos[0] ?? Number.NaN)
  if (desde < 0 || pasos.some((p, i) => orden.indexOf(p) !== desde + i)) v.push('salteo-proyectos')
  if (pasos[pasos.length - 1] !== orden[orden.length - 1]) v.push('no-paso')
  if ([0, 1, 2, 3].some((i) => !cuadros.some((c) => c.paso === i && c.panel))) v.push('proyecto-sin-panel')
  let cambios = 0
  for (let i = 1; i < cuadros.length; i++) {
    const c = cuadros[i]
    if (c === undefined) continue
    if (c.gesto === true) cambios = 0
    if (c.paso !== cuadros[i - 1]?.paso) cambios += 1
    if (cambios > 1) {
      v.push('mas-de-uno-por-gesto')
      break
    }
  }
  if (pildoraSinPanel(cuadros)) v.push('pildora-sin-panel')
  return v
}

/** Para el informe: los pasos en orden, con «+» si el panel estuvo adentro en ése. */
export function resumenDeLaEntrada(cuadros: readonly CuadroDeLaEntrada[]): string {
  const pasos = cuadros.map((c) => c.paso).filter((p, i, a) => i === 0 || p !== a[i - 1])
  return pasos.map((p) => `${String(p)}${cuadros.some((c) => c.paso === p && c.panel) ? '+' : ''}`).join(' → ')
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
