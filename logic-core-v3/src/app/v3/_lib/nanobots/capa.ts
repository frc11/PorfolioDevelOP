import { FISICA_DEL_ENJAMBRE, resorteDelEnjambre } from './enjambre'

/**
 * [B4] EL TRUCO DE PROFUNDIDAD, EN NÚMEROS — puro. En Servicios los nanobots arrancan DETRÁS del título «Nuestros servicios» y
 * terminan DELANTE del panel de Desarrollo web, que cierra por debajo de ellos. El lienzo es uno solo, así que el cambio es de capa
 * (su `z-index`), instantáneo: para que no se vea el salto, ocurre en un cuadro en que NINGÚN nanobot está sobre el título ni sobre el
 * panel. Acá se calcula ese cuadro desde la geometría y la física del traspaso (la misma del sombreador), sin mirar la GPU:
 *
 *   · `cajaDelEnjambre(avance)`: la caja que contiene, con seguridad, a todos los nanobots en ese avance del traspaso. Cada uno sale con
 *     su retraso (hasta el 40 %), viaja con el resorte (que se pasa un 10 %) y se desparrama a mitad de camino; la caja toma los
 *     extremos de los cuatro (los dos lugares, el resorte en el rango de los retrasos y la dispersión entera).
 *   · `cambioDeCapa(...)`: el primer avance en que esa caja ya no toca ninguna caja del título (con margen), y desde cuándo puede
 *     entrar el panel para que su borde no haya alcanzado al enjambre en ese avance. Como todo es función del avance, la vuelta (al
 *     subir) pasa por el mismo cuadro con la misma geometría: el cambio inverso es igual de invisible.
 *
 * El banco lo comprueba cuadro a cuadro leyendo los píxeles del lienzo (`__capaDeLosNanobots`, `scripts-carga/servicios-capa.ts`).
 */

export interface Caja {
  readonly izquierda: number
  readonly arriba: number
  readonly derecha: number
  readonly abajo: number
}

/** Dónde va un símbolo: su centro (px del escenario) y cuántos px mide una unidad del símbolo; `extension`, su radio en unidades. */
export interface Lugar {
  readonly x: number
  readonly y: number
  readonly unidad: number
  readonly extension: number
}

/** Lo que se mueve cada nanobot por su cuenta, encima de su lugar (el flotar, en unidades del símbolo). */
export const VIVO_UNIDADES = 0.06

/** El radio en pantalla de un símbolo, en unidades: el punto más lejano, con la perspectiva del sombreador (`cerca`, × 0,82). */
export function extensionDelSimbolo(datos: Float32Array): number {
  let r = 0
  for (let i = 0; i < datos.length; i += 4) r = Math.max(r, Math.hypot(datos[i], datos[i + 1], datos[i + 2]))
  return (r * 0.82 * 3) / (3 - Math.min(r, 2.5)) + VIVO_UNIDADES
}

/**
 * En este avance del traspaso, los nanobots van por su propio avance (cada uno con su retraso): el resorte en ese rango (su mínimo y
 * su máximo) y cuánto se desparraman como mucho (`sin(π·u)`, que vuelve a cero al llegar).
 */
export function rangoDelResorte(avance: number): { readonly min: number; readonly max: number; readonly desparramo: number } {
  const R = FISICA_DEL_ENJAMBRE.retraso
  const desde = Math.min(1, Math.max(0, (avance - R) / (1 - R)))
  const hasta = Math.min(1, Math.max(0, avance / (1 - R)))
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let desparramo = 0
  for (let i = 0; i <= 64; i += 1) {
    const u = desde + ((hasta - desde) * i) / 64
    const e = resorteDelEnjambre(u)
    min = Math.min(min, e)
    max = Math.max(max, e)
    desparramo = Math.max(desparramo, Math.sin(Math.PI * u))
  }
  // El muestreo no puede perderse el pico: si el rango cruza la mitad, el desparramo es entero.
  if (desde <= 0.5 && hasta >= 0.5) desparramo = 1
  return { min, max, desparramo }
}

/** La caja segura de todos los nanobots en un avance del traspaso de `desde` a `hacia`. */
export function cajaDelEnjambre(avance: number, desde: Lugar, hacia: Lugar): Caja {
  const { min, max, desparramo } = rangoDelResorte(avance)
  const dispersion = FISICA_DEL_ENJAMBRE.dispersion * desparramo * Math.max(desde.unidad, hacia.unidad)
  const eje = (a: number, ra: number, b: number, rb: number): [number, number] => {
    const valores: number[] = []
    for (const xa of [a - ra, a + ra]) for (const xb of [b - rb, b + rb]) for (const e of [min, max]) valores.push(xa + (xb - xa) * e)
    return [Math.min(...valores) - dispersion, Math.max(...valores) + dispersion]
  }
  const [izquierda, derecha] = eje(desde.x, desde.extension * desde.unidad, hacia.x, hacia.extension * hacia.unidad)
  const [arriba, abajo] = eje(desde.y, desde.extension * desde.unidad, hacia.y, hacia.extension * hacia.unidad)
  return { izquierda, arriba, derecha, abajo }
}

export const seTocan = (a: Caja, b: Caja): boolean => a.izquierda < b.derecha && b.izquierda < a.derecha && a.arriba < b.abajo && b.arriba < a.abajo

export const conMargen = (c: Caja, m: number): Caja => ({ izquierda: c.izquierda - m, arriba: c.arriba - m, derecha: c.derecha + m, abajo: c.abajo + m })

/** El margen alrededor del título (px): el cambio no ocurre ni cerca del contorno. */
export const MARGEN_DEL_TITULO_PX = 12

/**
 * El primer avance (0…1) en que el enjambre ya salió del título, y hasta dónde puede haber llegado el borde del panel (px desde la
 * izquierda del escenario) en ese avance sin tocarlo. `null` si el enjambre no sale nunca del título (el destino lo pisa): la
 * composición está mal y el banco lo marca.
 */
export function cambioDeCapa(desde: Lugar, hacia: Lugar, titulo: readonly Caja[]): { readonly avance: number; readonly bordeDelPanel: number } | null {
  const cajas = titulo.map((c) => conMargen(c, MARGEN_DEL_TITULO_PX))
  for (let i = 0; i <= 400; i += 1) {
    const avance = i / 400
    const caja = cajaDelEnjambre(avance, desde, hacia)
    if (cajas.some((c) => seTocan(caja, c))) continue
    // Que el título quede libre desde acá hasta el final (no un hueco de un cuadro en medio del viaje).
    let libre = true
    for (let j = i; j <= 400 && libre; j += 8) libre = !cajas.some((c) => seTocan(cajaDelEnjambre(j / 400, desde, hacia), c))
    if (libre) return { avance, bordeDelPanel: caja.izquierda - MARGEN_DEL_TITULO_PX }
  }
  return null
}
