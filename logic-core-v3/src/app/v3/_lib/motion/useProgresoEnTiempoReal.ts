'use client'

import { animate, useInView, useMotionValue, type MotionValue } from 'motion/react'
import { useEffect, type RefObject } from 'react'

/**
 * EL SEGUNDO MODO — el progreso lo da el reloj, no el scroll.
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 *
 * En la referencia las 291 instancias están atadas al scroll, y ahí **los
 * segundos no existen**: el `scrub` reparte la duración total del tween sobre el
 * rango de scroll del disparador, así que de la duración declarada sobrevive su
 * PROPORCIÓN y no su magnitud. Un tween de 2 s puede tardar diez segundos de
 * reloj o dos décimas: depende de cuán rápido se scrollee.
 *
 * Para una entrada de carga eso no sirve —no hay scroll que consumir— y por eso
 * el sistema soporta el otro modo, donde la duración declarada se aplica tal
 * cual.
 *
 * ── La diferencia entre los dos modos es exactamente una línea ─────────────
 *
 * Nada más cambia. La partición del cronograma, el escalonado, las curvas y la
 * traducción son las mismas funciones puras, con los mismos números. Lo único
 * distinto es de dónde sale el 0→1:
 *
 *     atado-al-scroll   progreso = (scrollY − inicio) / (fin − inicio)
 *     tiempo-real       progreso = animate(0 → 1, duracionAplicada segundos)
 *
 * Y de ahí sale la consecuencia que hay que reportar: en `tiempo-real` la pieza
 * `i` arranca a los `i · escalonado` SEGUNDOS y dura `duracionDeclarada`
 * SEGUNDOS; en `atado-al-scroll` arranca en la fracción `i · escalonado / total`
 * del recorrido y ocupa `duracionDeclarada / total` de ese recorrido. Las dos
 * cuentas salen del mismo `ventanaDeHijo`.
 *
 * ── El disparo, y por qué acá sí ───────────────────────────────────────────
 *
 * Este modo necesita un disparador: sin scroll que lo empuje, algo tiene que
 * decir "ahora". Es un `IntersectionObserver` (`useInView`), y es la ÚNICA parte
 * del sistema que dispara algo — los nueve patrones atados al scroll no tienen
 * un solo callback, igual que la referencia. Se re-dispara al volver a entrar
 * (`once: false`) para que en la ruta de demostración se pueda ver más de una vez
 * sin recargar.
 */

/** La curva del avance del conjunto es lineal, siempre. La curva de cada pieza
 *  la aplica la pieza, sobre su progreso local — igual que en el otro modo. */
const AVANCE_LINEAL = (t: number): number => t

export interface OpcionesDeTiempoReal {
  /** El elemento cuya entrada a pantalla dispara el avance. */
  readonly ref: RefObject<Element | null>
  /** La duración TOTAL, con el desparramo del escalonado ya sumado. */
  readonly duracionTotal: number
  /** Qué proporción del elemento tiene que estar visible para disparar. */
  readonly umbral: number
  /** Si el modo está activo. En `false` el valor se queda quieto en 0. */
  readonly activo: boolean
}

export function useProgresoEnTiempoReal({
  ref,
  duracionTotal,
  umbral,
  activo,
}: OpcionesDeTiempoReal): MotionValue<number> {
  const progreso = useMotionValue(0)
  const enPantalla = useInView(ref, { amount: umbral })

  useEffect(() => {
    if (!activo) {
      progreso.set(0)
      return
    }
    // Al salir de pantalla vuelve a cero de golpe: el modo es una ENTRADA, y una
    // entrada que se desarma con una animación de salida sería otra cosa.
    if (!enPantalla) {
      progreso.set(0)
      return
    }
    const controles = animate(progreso, 1, {
      duration: duracionTotal,
      ease: AVANCE_LINEAL,
    })
    return () => {
      controles.stop()
    }
  }, [activo, enPantalla, duracionTotal, progreso])

  return progreso
}
