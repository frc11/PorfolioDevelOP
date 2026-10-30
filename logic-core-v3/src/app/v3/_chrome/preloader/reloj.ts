import type { Animacion } from './animaciones'

/**
 * [C2-81] EL RELOJ DEL PRELOADER — una animación maestra sin objetivo (un `KeyframeEffect` sobre `null`) en la línea de tiempo del
 * documento. Su `currentTime` es el tiempo de la línea (`linea.ts`) y todas las animaciones del preloader se alinean con ella
 * (`animar`, `alinear`): el texto, la salida y el botón con sus ondas corren en el compositor con el mismo origen, y lo que decide el hilo principal (la
 * etapa, el freno, la salida) lee el mismo reloj. Con la pestaña oculta la capa lo pausa a él y a todas (`pausarConLaPestana`): quien
 * vuelve ve la secuencia entera.
 */

/** Lo más que dura el reloj (ms): el tope del preloader y un margen. */
const DURACION_DEL_RELOJ_MS = 120_000

export function crearElReloj(): Animation {
  const reloj = new Animation(new KeyframeEffect(null, [], { duration: DURACION_DEL_RELOJ_MS, fill: 'forwards' }), document.timeline)
  reloj.play()
  return reloj
}

const numero = (v: CSSNumberish | null): number | null => (typeof v === 'number' ? v : null)

/** El tiempo del reloj (ms): el de la línea. */
export const tiempoDelReloj = (reloj: Animation): number => numero(reloj.currentTime) ?? 0

/** Pone `animacion` con su origen en `origen` ms del reloj: con el mismo arranque si el reloj corre, quieta en su lugar si está en pausa. */
export function alinear(animacion: Animation, reloj: Animation, origen: number): void {
  const inicio = numero(reloj.startTime)
  if (reloj.playState === 'paused' || inicio === null) {
    if (reloj.playState === 'paused') animacion.pause()
    animacion.currentTime = tiempoDelReloj(reloj) - origen
    return
  }
  if (animacion.playState === 'paused') animacion.play()
  animacion.startTime = inicio + origen
}

/** Anima `el` con `a` (sólo `opacity` y `transform`), alineada con el reloj desde `origen`. */
export function animar(el: Element, a: Animacion, reloj: Animation, origen: number): Animation {
  const animacion = el.animate(a.cuadros as Keyframe[], { duration: a.duracion, delay: a.demora, fill: a.relleno, iterations: a.iteraciones ?? 1 })
  alinear(animacion, reloj, origen)
  return animacion
}

/**
 * Con la pestaña oculta, pausa el reloj y todo lo que corre en `raiz`; al volver, los retoma juntos (desde donde quedaron). Devuelve
 * cómo dejar de escuchar.
 */
export function pausarConLaPestana(raiz: () => Element | null, reloj: () => Animation | null): () => void {
  let pausadas: Animation[] = []
  const alCambiar = (): void => {
    const r = reloj()
    const el = raiz()
    if (r === null || el === null) return
    if (document.visibilityState === 'hidden') {
      if (r.playState !== 'running') return
      pausadas = [r, ...el.getAnimations({ subtree: true }).filter((a) => a.playState === 'running')]
      for (const a of pausadas) a.pause()
    } else {
      for (const a of pausadas) a.play()
      pausadas = []
    }
  }
  document.addEventListener('visibilitychange', alCambiar)
  return () => document.removeEventListener('visibilitychange', alCambiar)
}
