/**
 * EL CRONOGRAMA — el escalonado, y las dos trampas de duración.
 *
 * ── Trampa A: la duración declarada no es la aplicada ──────────────────────
 *
 * SCROLL.md §9.5: cuando un tween lleva `stagger`, GSAP lo convierte en un
 * envoltorio con una copia por target, y la duración total es la del último
 * hijo:
 *
 *     duraciónAplicada = duraciónDeclarada + escalonado · (targets − 1)
 *
 * El ejemplo medido es P8: 2 s declarados, 32 targets, `stagger` 0,2 → **8,2 s
 * aplicados**. "El número que se escribe es 2, el que se lee en el objeto es
 * 8,2." Si SCROLL.md da dos números para lo mismo, vale el aplicado.
 *
 * ── Trampa B: el `ease` del envoltorio dice `none` y miente ────────────────
 *
 * SCROLL.md §9.5: en 235 de los 278 tweens autorales el `_ease` resuelto del
 * envoltorio dice `none` mientras la curva real vive en `vars.ease` y en los
 * hijos. "Quien lea `_ease` en vez de `vars.ease` concluye que el sitio entero
 * es lineal. No lo es."
 *
 * Acá esa trampa **no se puede cometer**, y no por disciplina: este módulo
 * calcula el progreso LOCAL de cada hijo y no aplica ninguna curva. La curva la
 * aplica el hijo, sobre su propio progreso local. No existe un objeto
 * "envoltorio" con un easing propio que alguien pueda leer por error.
 * `__tests__/cronograma.invariant.ts` lo afirma comprobando que el avance del
 * conjunto ES lineal en el progreso —la propiedad que hace verdadero el `none`
 * del envoltorio— y que aun así cada hijo llega curvado.
 *
 * ── Los dos modos ──────────────────────────────────────────────────────────
 *
 * En la referencia TODO está atado al scroll (291 de 291 con `scrub`), y ahí los
 * segundos no existen: el `scrub` mapea la duración total del tween sobre el
 * rango de scroll del disparador. Lo único que sobrevive de la duración
 * declarada es su PROPORCIÓN contra el total.
 *
 *   · `atado-al-scroll` — el progreso lo da el scroll. Un hijo ocupa la ventana
 *     `[i·escalonado, i·escalonado + duración] / total` del rango. Los segundos
 *     declarados no se aplican: se aplican sus proporciones.
 *   · `tiempo-real` — el progreso lo da el reloj. La duración declarada se
 *     aplica tal cual, en segundos, y el escalonado es un `delay` real.
 *
 * Las dos formas comparten `ventanaDeHijo`: es la misma partición del tiempo,
 * medida en proporciones o en segundos. Que compartan la partición es lo que
 * hace que el modo no cambie la coreografía, solo quién la empuja.
 */

/** Los dos modos. No hay un tercero. */
export type ModoDeAvance = 'atado-al-scroll' | 'tiempo-real'

export interface Cronograma {
  /** Segundos declarados por tween, tal como los escribió el autor. */
  readonly duracionDeclarada: number
  /** Segundos entre el arranque de un hijo y el del siguiente. */
  readonly escalonado: number
  /** Cuántos hijos. 1 = sin escalonado efectivo. */
  readonly cantidad: number
}

/**
 * La duración total, con el desparramo del escalonado sumado.
 * Es la trampa A, escrita como una línea.
 */
export function duracionAplicada(c: Cronograma): number {
  return c.duracionDeclarada + c.escalonado * Math.max(0, c.cantidad - 1)
}

export interface Ventana {
  /** Cuándo arranca el hijo, en proporción del total (0 a 1). */
  readonly desde: number
  /** Cuándo termina, en proporción del total (0 a 1). */
  readonly hasta: number
  /** Cuándo arranca, en segundos. Es el `delay` del modo `tiempo-real`. */
  readonly desdeSegundos: number
  /** Cuánto dura, en segundos. Es la duración declarada, siempre. */
  readonly duracionSegundos: number
}

/**
 * La ventana de un hijo dentro del conjunto.
 *
 * Devuelve las dos lecturas —proporción y segundos— porque son la misma cuenta
 * y separarlas invitaría a que una se desviara de la otra.
 */
export function ventanaDeHijo(indice: number, c: Cronograma): Ventana {
  const total = duracionAplicada(c)
  const desdeSegundos = indice * c.escalonado
  const hastaSegundos = desdeSegundos + c.duracionDeclarada
  return {
    desde: total > 0 ? desdeSegundos / total : 0,
    hasta: total > 0 ? hastaSegundos / total : 1,
    desdeSegundos,
    duracionSegundos: c.duracionDeclarada,
  }
}

/**
 * El progreso LOCAL de un hijo, dado el progreso global del conjunto.
 *
 * Sin curva: la curva es del hijo y se aplica después. Acotado a `[0, 1]` en los
 * dos extremos, que es lo que lo hace exactamente reversible — al retroceder se
 * reproduce al revés y en los bordes se queda quieto.
 */
export function progresoDeHijo(progresoGlobal: number, indice: number, c: Cronograma): number {
  const v = ventanaDeHijo(indice, c)
  const ancho = v.hasta - v.desde
  if (ancho <= 0) return progresoGlobal >= v.hasta ? 1 : 0
  const local = (progresoGlobal - v.desde) / ancho
  if (local < 0) return 0
  if (local > 1) return 1
  return local
}

/**
 * La transición de `motion/react` para el modo `tiempo-real`: la duración
 * declarada se aplica en segundos y el escalonado es un `delay`.
 *
 * Es la diferencia entre los dos modos, en un objeto: acá los segundos son
 * segundos; en `atado-al-scroll` los mismos números solo sobreviven como la
 * proporción `duracionDeclarada / duracionAplicada`.
 */
export interface TransicionEnTiempoReal {
  readonly delay: number
  readonly duration: number
}

export function transicionEnTiempoReal(indice: number, c: Cronograma): TransicionEnTiempoReal {
  const v = ventanaDeHijo(indice, c)
  return { delay: v.desdeSegundos, duration: v.duracionSegundos }
}

/**
 * Qué proporción del recorrido ocupa un solo hijo. Es lo ÚNICO que sobrevive de
 * la duración declarada cuando el avance lo da el scroll.
 *
 * Para P8 vale 2 / 8,2 = 0,2439: cada pieza consume menos de un cuarto del
 * recorrido y las 32 se reparten el resto en cascada.
 */
export function proporcionDeUnHijo(c: Cronograma): number {
  const total = duracionAplicada(c)
  return total > 0 ? c.duracionDeclarada / total : 1
}

/**
 * El avance agregado del conjunto: el promedio de los progresos locales SIN
 * curvar. Es lineal en el progreso global cuando la cantidad es 1, y es la
 * cantidad que hace verdadero —y a la vez engañoso— el `none` del envoltorio.
 * Lo usa el invariante para exhibir la trampa B.
 */
export function avanceDelConjunto(progresoGlobal: number, c: Cronograma): number {
  if (c.cantidad <= 0) return 0
  let suma = 0
  for (let i = 0; i < c.cantidad; i++) suma += progresoDeHijo(progresoGlobal, i, c)
  return suma / c.cantidad
}
