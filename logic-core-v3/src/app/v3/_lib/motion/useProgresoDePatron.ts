'use client'

import { useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, type RefObject } from 'react'

import {
  progresoEnRango,
  rangoDeScroll,
  type CajaMedida,
  type ParDeAnclas,
  type RangoDeScroll,
} from './anclas'
import { useEpocaDeMedicion } from './epoca'

/**
 * EL MOTOR DE PROGRESO — de píxeles de scroll a un 0→1 por patrón.
 *
 * Es la pieza que hace que los nueve patrones sean UN sistema: todos consumen
 * este `MotionValue` y ninguno toca el scroll por su cuenta.
 *
 * ── Cero `setState` por cuadro, y cero `setState` a secas ──────────────────
 *
 * Este hook no tiene estado de React. La caja medida vive en un `ref` y el aviso
 * de que cambió viaja por un `MotionValue` (`version`), no por un render. Dos
 * consecuencias:
 *
 *   · Ni el scroll ni una remedición disparan un render de React. Lo único que
 *     cambia es un valor de motion, y quien lo consume escribe al DOM.
 *   · No hay `setState` dentro de un efecto, así que no aparece
 *     `react-hooks/set-state-in-effect`. Es el mismo criterio con el que S1
 *     escribió `useAnchoMinimo` sobre `useSyncExternalStore` en vez de
 *     `useState` + `useEffect`.
 *
 * ── Por qué `scrollY` y no `scrollYProgress` ───────────────────────────────
 *
 * Dos razones, y las dos importan.
 *
 * La primera es de exactitud: `useScroll({ target, offset })` no puede expresar
 * cuatro de las nueve anclas medidas (ver `anclas.ts`). Con `scrollY` —píxeles
 * crudos— el ancla se resuelve con la fórmula completa.
 *
 * La segunda es de camino de ejecución. `useScroll` marca `scrollYProgress` como
 * ACELERABLE cuando el `offset` mapea a un rango con nombre de ViewTimeline, y
 * ahí `motion` promueve en silencio a cualquier consumidor que derive ese valor
 * hacia `transform`/`opacity`/`filter`/`clipPath` a una animación nativa de
 * WAAPI atada al **contenedor de scroll ancestro más cercano** — no a la
 * ventana. Este sistema pone `overflow: hidden` en cada línea de texto; ese
 * camino se congelaría sin un solo error en consola, y solo en los navegadores
 * que soportan ViewTimeline. Además bifurcaría la física entre consumidores del
 * mismo valor.
 *
 * `values.scrollY` es un `MotionValue` plano: `canAccelerateScroll` solo marca
 * `scrollXProgress`/`scrollYProgress`. Derivando de él, todos los consumidores
 * corren por el mismo camino de JS, determinista.
 *
 * ── Lo que hace innecesario un `IntersectionObserver` ──────────────────────
 *
 * `progresoEnRango` acota a `[0, 1]`, y un `MotionValue` solo avisa a sus
 * suscriptores cuando el valor CAMBIA (`updateAndNotify`:
 * `if (this.current !== this.prev)`). Un patrón fuera de su rango devuelve
 * siempre el mismo 0 o el mismo 1, así que no propaga: ni sus curvas, ni la
 * composición de su `transform`, ni la escritura al DOM. La pausa fuera de
 * pantalla ya está, y sin un oyente más por instancia.
 */

export interface OpcionesDelMotor {
  /**
   * El elemento que se MIDE. Lo crea el componente y nunca se transforma.
   *
   * ⚠ El `ref` entra y no sale. Devolverlo adentro del objeto del motor era lo
   * natural y está prohibido: leer una propiedad que contiene un `ref` durante
   * el render dispara `react-hooks/refs`, porque desde afuera no se distingue de
   * leer su `.current`. Con el `ref` creado en el componente y pasado hacia
   * adentro, el hook lo usa donde corresponde —en un efecto— y el componente lo
   * pone en su `div` sin leer nada.
   */
  /**
   * ⚠ **`HTMLElement` y no `HTMLDivElement` desde B1, y es un ensanche de tipo,
   * no de comportamiento.** El motor sólo le pide `getBoundingClientRect()`, que
   * es de `Element`. Lo que el tipo angosto impedía era legítimo y hacía falta:
   * un bloque adentro de un hijo `sticky` no se mueve, así que su patrón se
   * consume antes de que la sección llegue a cuadro, y la salida es medir la
   * `<section>` —`anclaje: 'seccion'` del contrato de secciones—. Una `<section>`
   * es `HTMLElement` y no `HTMLDivElement`; el tipo viejo obligaba a mentirle con
   * una aserción. Un `div` sigue entrando, porque lo extiende.
   */
  readonly ref: RefObject<HTMLElement | null>
  /** El par de anclas del patrón. */
  readonly anclas: ParDeAnclas
  /**
   * El `scrub` del patrón: `true` sin inercia, un número = segundos que tarda el
   * cabezal en alcanzar al scroll. `null` fuerza sin inercia (perilla del demo).
   */
  readonly inerciaSegundos: number | null
}

/**
 * Inercia nominal del seguidor cuando el patrón no declara una. El valor no se
 * usa mientras `inerciaSegundos` sea `null` —se devuelve el progreso crudo— pero
 * el seguidor se construye igual, porque los hooks no pueden ser condicionales.
 * Su costo es una interpolación por cuadro sobre un valor que nadie lee.
 */
const INERCIA_NOMINAL_S = 1

export function useProgresoDePatron({
  ref,
  anclas,
  inerciaSegundos,
}: OpcionesDelMotor): MotionValue<number> {
  const rango = useRef<RangoDeScroll | null>(null)
  const foto = useEpocaDeMedicion()

  const { scrollY } = useScroll()

  /**
   * El aviso de "hay rango nuevo". Es un `MotionValue` y no un estado porque el
   * consumidor de un rango nuevo no es React: es la cadena de transformadas.
   */
  const version = useMotionValue(0)

  useEffect(() => {
    const elemento = ref.current
    // `foto.alto === 0` es el corte de servidor o una pestaña oculta: medir ahí
    // devuelve ceros, y un cero no es una medición chica, es una medición falsa.
    if (elemento === null || foto.alto === 0) return

    const caja = elemento.getBoundingClientRect()
    const medida: CajaMedida = {
      topDoc: caja.top + window.scrollY,
      alto: caja.height,
    }
    rango.current = rangoDeScroll(anclas, medida, foto.alto)
    version.set(version.get() + 1)
  }, [ref, foto, anclas, version])

  const crudo = useTransform<number, number>([scrollY, version], ([y]) => {
    const r = rango.current
    return r === null ? 0 : progresoEnRango(y, r)
  })

  /**
   * El seguidor con inercia: el análogo del `scrub` numérico de la referencia,
   * que es el tiempo que tarda el cabezal en alcanzar la posición del scroll.
   *
   * ⚠ DECIDIDO, no medido: GSAP implementa el `scrub` como un tween re-apuntado
   * en cada evento de scroll; acá es un resorte sin rebote con la misma duración
   * de asentamiento. Misma familia de comportamiento, no la misma matemática.
   * `bounce: 0` es obligatorio: un rebote haría que el progreso pase de 1 y
   * vuelva, y el sistema dejaría de ser exactamente reversible.
   */
  const suave = useSpring(crudo, {
    duration: inerciaSegundos ?? INERCIA_NOMINAL_S,
    bounce: 0,
  })

  return inerciaSegundos === null ? crudo : suave
}
