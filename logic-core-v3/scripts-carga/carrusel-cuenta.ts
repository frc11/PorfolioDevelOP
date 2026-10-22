/**
 * [B1.2e] LA CUENTA DEL CARRUSEL, PURA — lo que el banco (`carrusel.ts`) decide sobre lo que midió en el sitio: que el carrusel no ocupa la
 * pantalla, que el dedo vertical mueve la página (no hay trampa), que nunca queda un tramo largo sin nada a la vista, y que rota cada 10 s de a
 * una (dando la vuelta), se queda quieto cuando tiene que estar en pausa y vuelve a empezar el reloj en cada cambio. s76 la prueba con su
 * control. Sin Playwright.
 */

export const CRITERIOS_DEL_CARRUSEL = {
  /** Lo que cuenta como «se ve» (la fracción visible por la opacidad efectiva). */
  umbral: 0.08,
  /** El carrusel no ocupa la pantalla: su alto sobre el del cuadro, como mucho. */
  altoMaximo: 0.85,
  /** Un arrastre vertical del dedo mueve la página al menos esta fracción de lo arrastrado (sin trampa, el navegador la mueve entera). */
  scrollMinimo: 0.8,
  /** El tramo de scroll más largo sin nada a la vista con la sección en el cuadro (pantallas): el respiro antes de Demos, no un hueco. */
  vacioPantallas: 1,
  /** Lo que dura cada tarjeta (ms) y la tolerancia al medirlo en el sitio (los cuadros y el sondeo cada 100 ms). */
  duracionMs: 10_000,
  toleranciaMs: 700,
} as const

/** Una muestra del recorrido (rAF): el scroll y lo que se ve de cada pieza. */
export interface MuestraDelRecorrido {
  readonly y: number
  /** La sección del Portfolio ocupa el cuadro (más de la mitad de su alto). */
  readonly enCuadro: boolean
  readonly titulo: number
  readonly carrusel: number
  readonly laTuya: number
  readonly demos: number
}

/** El tramo de scroll más largo (en pantallas de `alto`) con la sección en el cuadro y nada a la vista, en una pasada (y que crece o baja). */
export function vacioMaximo(muestras: readonly MuestraDelRecorrido[], alto: number): number {
  const u = CRITERIOS_DEL_CARRUSEL.umbral
  let desde: number | null = null
  let peor = 0
  for (const m of muestras) {
    const vacio = m.enCuadro && m.titulo < u && m.carrusel < u && m.laTuya < u && m.demos < u
    if (vacio) {
      desde ??= m.y
      peor = Math.max(peor, Math.abs(m.y - desde))
    } else desde = null
  }
  return alto > 0 ? peor / alto : 0
}

/** Si un arrastre del dedo de `arrastre` px movió la página `movio` px en el mismo sentido y casi entero: no quedó atrapado. */
export const arrastreLibre = (arrastre: number, movio: number): boolean =>
  arrastre !== 0 && Math.sign(movio) === Math.sign(arrastre) && Math.abs(movio) >= CRITERIOS_DEL_CARRUSEL.scrollMinimo * Math.abs(arrastre)

/** Si el carrusel deja ver la escena alrededor: su alto contra el del cuadro. */
export const noOcupaLaPantalla = (altoDelCarrusel: number, altoDelCuadro: number): boolean =>
  altoDelCarrusel > 0 && altoDelCuadro > 0 && altoDelCarrusel <= CRITERIOS_DEL_CARRUSEL.altoMaximo * altoDelCuadro

/** Una muestra del reloj: cuándo (ms) y en qué tarjeta estaba. */
export interface MuestraDelReloj {
  readonly t: number
  readonly indice: number
}

/** Los cambios de tarjeta de una serie: cuándo y de cuál a cuál. */
export function cambiosDelIndice(serie: readonly MuestraDelReloj[]): { readonly t: number; readonly de: number; readonly a: number }[] {
  const salida: { readonly t: number; readonly de: number; readonly a: number }[] = []
  for (let i = 1; i < serie.length; i++) {
    const antes = serie[i - 1]
    const ahora = serie[i]
    if (antes !== undefined && ahora !== undefined && ahora.indice !== antes.indice) salida.push({ t: ahora.t, de: antes.indice, a: ahora.indice })
  }
  return salida
}

/**
 * Si una serie rota sola como tiene que rotar: al menos dos cambios, cada uno a la siguiente (dando la vuelta: después de la última, la
 * primera) y, entre cambio y cambio, la duración de una tarjeta con su tolerancia. Devuelve también los intervalos medidos.
 */
export function rotaSola(serie: readonly MuestraDelReloj[], cantidad: number, duracionMs: number = CRITERIOS_DEL_CARRUSEL.duracionMs): { readonly ok: boolean; readonly intervalos: readonly number[] } {
  const cambios = cambiosDelIndice(serie)
  const intervalos = cambios.slice(1).map((c, i) => c.t - (cambios[i]?.t ?? c.t))
  const deAUna = cambios.every((c) => c.a === (c.de + 1) % cantidad)
  const aTiempo = intervalos.every((ms) => Math.abs(ms - duracionMs) <= CRITERIOS_DEL_CARRUSEL.toleranciaMs)
  return { ok: cambios.length >= 2 && deAUna && aTiempo, intervalos }
}

/** Si en la serie no cambió nada (en pausa). */
export const quieto = (serie: readonly MuestraDelReloj[]): boolean => serie.length > 1 && cambiosDelIndice(serie).length === 0

/**
 * El reloj vuelve a empezar en cada cambio: después de un cambio a mano en `aMano` (ms), el siguiente cambio solo llega una duración entera
 * después de ESE cambio (no del anterior). `serie` arranca después del cambio a mano.
 */
export function reinicioDelReloj(serie: readonly MuestraDelReloj[], aMano: number, duracionMs: number = CRITERIOS_DEL_CARRUSEL.duracionMs): { readonly ok: boolean; readonly despues: number | null } {
  const siguiente = cambiosDelIndice(serie)[0]
  const despues = siguiente === undefined ? null : siguiente.t - aMano
  return { ok: despues !== null && Math.abs(despues - duracionMs) <= CRITERIOS_DEL_CARRUSEL.toleranciaMs, despues }
}
