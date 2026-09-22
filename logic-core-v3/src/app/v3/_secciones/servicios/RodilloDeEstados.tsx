'use client'

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect } from 'react'

import { SERVICIOS } from '../_contrato/acento'
import {
  CLASE_DE_LA_CAJA_DEL_RODILLO,
  CLASE_DE_LA_RANURA,
  CURVA_DEL_DISPARO,
  DURACION_DEL_DISPARO,
} from './geometria'
import { RotuloDeLaIntro, RotuloDeServicio } from './RotuloDeServicio'

/**
 * EL RODILLO — cuatro estados, y se DISPARA al cruzar una frontera.
 *
 *     0   00 · Nuestros servicios    lo que viene, con la misma anatomía
 *     1   01 · Desarrollo web
 *     2   02 · Software a medida
 *     3   03 · Integraciones de IA y Automatizaciones
 *
 * ── ⚠️ DISPARA, NO SE BARRE — y esto deshace a propósito una garantía ─────
 *
 * Hasta acá la rotación era `useTransform(progreso, …)`: colgaba del scroll, así
 * que **sólo se movía mientras el dedo se movía**. Frenar a mitad de camino
 * dejaba el rodillo a mitad de camino. Eso es un scrub, no un rodillo.
 *
 * Ahora cruzar una frontera DISPARA una animación por TIEMPO, que corre sola
 * hasta posarse aunque la persona frene. El costo declarado: este archivo deja
 * de ser una función pura del progreso.
 *
 * **Lo que NO se pierde, y es la mitad que importa:** la tira sigue siendo
 * continua y lineal, y **el estado del rodillo no la toca**. Todo lo que este
 * componente necesita —el objetivo, la posición, la animación— vive en
 * `MotionValue`s de acá adentro; no hay un `useState` que suba, así que un
 * cambio de estado no re-renderiza ni a la tira ni al panel. `s6-servicios`
 * afirma esa separación leyendo el fuente: la máquina del rodillo tiene que
 * estar en este archivo y en ninguno de los dos de la derecha.
 *
 * ── No encola: va al más nuevo desde donde esté ───────────────────────────
 *
 * `animate()` sobre el MISMO `MotionValue` interrumpe lo que estuviera
 * corriendo y arranca del valor ACTUAL. Así que cruzar dos fronteras de un saque
 * no reproduce dos rotaciones: va al estado más nuevo desde donde quedó. Y
 * scrolleando hacia arriba es la misma animación con el objetivo más bajo.
 *
 * ── ⚠️ EL TRASLADO ES UN PORCENTAJE DE SU PROPIA CAJA ─────────────────────
 *
 * Cuatro ranuras del alto de la caja, una tira del 400 %, y `-estado · 25 %`. Un
 * porcentaje de la propia caja **no necesita medir nada**: se resuelve en el
 * primer render, en el servidor incluso, así que la pieza nace en su lugar. Con
 * una medida que llega después del primer render, el estado entrante no tiene
 * estado «de antes» —la medida vale cero, la transformada vale cero— y se pinta
 * UN CUADRO en reposo antes de saltar. Es una lección ya pagada acá.
 *
 * Las cadenas se arman (`${n}%`) y no se escriben: enteras serían literales con
 * unidad y el escáner de tokens de la sección los rechaza, con razón.
 *
 * ── Por qué TODO el rodillo va `aria-hidden` ──────────────────────────────
 *
 * Porque es la copia VISUAL. Lo que se anuncia vive en la tira de la derecha,
 * adentro del bloque de cada servicio, que es el único orden que coincide con el
 * de la rama apilada. Si el rodillo anunciara, la rama pinneada diría los tres
 * rótulos juntos y después los tres contenidos, y las tres afirmaciones de
 * igualdad de texto entre ramas —`s6-servicios` §3, `s6-render` §3 y
 * `s10-acceso` §7— se pondrían en rojo por ORDEN, sin que falte una palabra.
 */

/** Los cuatro estados. El 0 es el titular de la sección; los otros, servicios. */
export const CANTIDAD_DE_ESTADOS = SERVICIOS.length + 1

/** El alto de una ranura, en porcentaje de la tira. Armado, no escrito. */
const ALTO_DE_RANURA = `${100 / CANTIDAD_DE_ESTADOS}%`

/** El alto de la tira, en porcentaje de la caja. Cuatro ranuras, una por estado. */
const ALTO_DE_LA_TIRA = `${CANTIDAD_DE_ESTADOS * 100}%`

/** En qué estado toca estar, según cuántas fronteras quedaron atrás. */
function estadoSegun(progreso: number, fronteras: readonly number[]): number {
  let n = 0
  for (const frontera of fronteras) {
    if (progreso > frontera) n += 1
  }
  return n
}

export interface RodilloDeEstadosProps {
  /** El progreso del pin, crudo. Este componente lo lee; nadie más lo remapea. */
  readonly progreso: MotionValue<number>
  /** Dónde está cada frontera, derivada del tope medido de cada bloque. */
  readonly fronteras: readonly number[]
}

export function RodilloDeEstados({
  progreso,
  fronteras,
}: RodilloDeEstadosProps): React.JSX.Element {
  const objetivo = useTransform(progreso, (p) => estadoSegun(p, fronteras))
  const posicion = useMotionValue(0)
  const y = useTransform(posicion, (v) => `${(-v * 100) / CANTIDAD_DE_ESTADOS}%`)

  // El disparo. `animate` sobre el mismo valor interrumpe lo anterior y sale del
  // valor actual, que es justo «no encola, va al más nuevo desde donde esté».
  useMotionValueEvent(objetivo, 'change', (destino) => {
    animate(posicion, destino, { duration: DURACION_DEL_DISPARO, ease: [...CURVA_DEL_DISPARO] })
  })

  // Al montar, el rodillo se posa donde el scroll ya esté: entrar a la sección
  // por un ancla o recargar a mitad del pin no puede dejarlo en el estado 0.
  useEffect(() => {
    posicion.set(objetivo.get())
  }, [posicion, objetivo])

  return (
    <div aria-hidden="true" data-rodillo="estados" className={CLASE_DE_LA_CAJA_DEL_RODILLO}>
      <motion.div
        className="flex w-full flex-col will-change-transform"
        style={{ height: ALTO_DE_LA_TIRA, y }}
      >
        <div data-estado="intro" className={CLASE_DE_LA_RANURA} style={{ height: ALTO_DE_RANURA }}>
          <RotuloDeLaIntro />
        </div>
        {SERVICIOS.map((servicio) => (
          <div
            key={servicio.id}
            data-servicio={servicio.id}
            data-estado="servicio"
            className={CLASE_DE_LA_RANURA}
            style={{ height: ALTO_DE_RANURA }}
          >
            <RotuloDeServicio servicio={servicio} decorativo />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
