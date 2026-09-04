'use client'

import { useMotionValueEvent, useTransform, type MotionValue } from 'motion/react'
import { useState } from 'react'

import { SERVICIOS } from '../_contrato/acento'
import { tramoDeSecuencia } from '../_contrato/secuencia'
import { asentar } from './asentamiento'
import { CabeceraDeServicios } from './CabeceraDeServicios'
import { ContenidoDeServicio } from './ContenidoDeServicio'
import { CLASE_DEL_STICKY, CLASE_DE_LA_PILA, clasesDeCapa, formaDeCapa } from './geometria'

/**
 * LA SECUENCIA — un progreso, cinco canales, un solo `sticky`.
 *
 * ── Dos números derivados, no un objeto ───────────────────────────────────
 *
 * `indice` y `local` salen de dos `useTransform` separados sobre el MISMO
 * progreso, y no de uno solo que devuelva `{ indice, local }`. La razón es la
 * mecánica de `MotionValue`: solo avisa a sus suscriptores cuando el valor
 * CAMBIA (`updateAndNotify`: `if (this.current !== this.prev)`), y un objeto
 * nuevo por cuadro nunca es igual al anterior — así que avisaría siempre. Con
 * dos números, `indice` notifica DOS veces en todo el recorrido y es el único
 * que toca estado de React; `local` es el que corre, y no dispara ni un render.
 *
 * Esa es toda la diferencia entre una secuencia y un `setState` por cuadro.
 *
 * ── EL ASENTAMIENTO: cada servicio ATERRIZA y se queda quieto (B2 · frente C) ──
 *
 * `local` ya no es el progreso pelado del tramo: pasa por `asentar`, que lo
 * satura en la mitad del tramo. La armada de los tres canales ocupa esa primera
 * mitad y la segunda es **el servicio terminado, quieto y legible**.
 *
 * Antes no lo estaba nunca, y está medido: las ventanas de P2, P3 y P4 cierran
 * todas en `local = 1`, que es el píxel exacto donde la secuencia cambia de
 * servicio. A 1920×1080, en el primer tramo, la palabra 33 de 33 se terminaba
 * de encender a 20 px del reemplazo. El censo de acontecimientos leía la
 * secuencia entera como **UN** aterrizaje de 2.040 px con 131 piezas — porque
 * nada se detenía nunca.
 *
 * De dónde sale la mitad —del paso y del umbral de fusión del censo, no de un
 * gusto— y por qué esto NO cambia un valor de ningún patrón: `asentamiento.ts`.
 *
 * ── Por qué el tramo activo SÍ es estado de React ─────────────────────────
 *
 * Porque cambia el ÁRBOL, no un estilo: otro nombre, otro rubro, otro párrafo,
 * otros once ítems, otro pedido de video y otro valor de `data-servicio`. Nada
 * de eso se puede escribir desde un `MotionValue`, que solo sabe empujar `style`
 * al DOM. Y no es caro: son dos renders en 200svh de scroll.
 *
 * ── LOS TRES SERVICIOS ESTÁN SIEMPRE EN EL ÁRBOL, Y SE VE UNO (SITIO-S11) ──
 *
 * Hasta S10 este componente renderizaba `SERVICIOS[indice]`: **uno por vez**.
 * Visualmente era correcto y así fue diseñado. Para un lector de pantalla los
 * otros dos NO EXISTÍAN, y `s10-acceso` lo midió sobre el documento entero:
 * el árbol pasaba de **26 encabezados a 24** y de **43 marcadores anunciados a
 * 33** al pasar de la rama quieta a la animada. Los que faltaban eran los de
 * esta sección, y quien navega por encabezados sin scrollear no alcanzaba dos
 * tercios de ella. Era el hallazgo 3, gravedad alta, con esta sección de dueña.
 *
 * Ahora la pila monta los TRES y la secuencia elige cuál se PINTA
 * (`clasesDeCapa`, en `geometria.ts`, con las cinco formas de esconder que NO
 * sirven enumeradas ahí). **Lo que se ve es idéntico**: un servicio a la vez,
 * el del tramo activo, cambiando en el mismo punto del recorrido. El mecanismo
 * tampoco cambió — sigue habiendo un `sticky` largo, UN progreso y los cinco
 * canales colgando de él. Lo único que cambió es de dónde sale el que se ve:
 * antes del montaje, ahora de la pintura.
 *
 * ── El progreso lo recibe SÓLO la capa vigente, y no es un detalle ────────
 *
 * Las otras dos reciben `null`, o sea su rama quieta: cero transformadas, cero
 * `will-change` y cero suscripciones al `MotionValue`. Por eso la sección sigue
 * promoviendo **14 capas de composición y no 42** —lo afirma `s6-servicios`
 * §2— y por eso montar tres no es tres veces el costo de animar uno.
 *
 * ── Un acento por cuadro, con tres `[data-servicio]` ──────────────────────
 *
 * El atributo bajó del `sticky` a cada capa: son tres, hermanos, en el orden de
 * la secuencia. La regla de la voz única de la paleta —un acento por contexto,
 * nunca los tres— **no se perdió, se midió mejor**: dos de las tres capas están
 * apagadas con `sr-only`, o sea recortadas a un píxel y fuera del flujo, así que
 * en la pantalla nunca hay más de un acento vigente. El instrumento dejó de
 * contar ocurrencias del atributo (que era una aproximación buena mientras
 * hubiera una sola capa) y ahora cuenta **capas pintadas**, que es lo que la
 * regla siempre quiso decir.
 *
 * ── Por qué `PanelDeSecuencia` se exporta ─────────────────────────────────
 *
 * Para que el instrumento pueda renderizar los TRES tramos sin inventar un
 * atributo de forzado en el producto. `activo` es una propiedad porque el
 * estado está izado un nivel más arriba, que es donde vive el `MotionValue` que
 * lo mueve; que además sirva para sondear los tres tramos es una consecuencia
 * de haberlo puesto donde va, no una concesión al instrumento.
 */

/** Los tramos son los servicios. No hay un cuarto. */
export const CANTIDAD_DE_TRAMOS = SERVICIOS.length

export interface PanelDeSecuenciaProps {
  /** El tramo activo, de 0 a `CANTIDAD_DE_TRAMOS − 1`. */
  readonly activo: number
  /** El progreso DENTRO del tramo, o `null` cuando no hay coreografía. */
  readonly progreso: MotionValue<number> | null
}

export function PanelDeSecuencia({ activo, progreso }: PanelDeSecuenciaProps): React.JSX.Element {
  // Acotado y no validado con una excepción: el índice viene de un
  // `MotionValue` que ya está acotado por `tramoDeSecuencia`, y una sección que
  // tira en el render por un borde de coma flotante es peor que una que muestra
  // el último tramo.
  const indice = Math.min(Math.max(activo, 0), CANTIDAD_DE_TRAMOS - 1)

  return (
    <div className={CLASE_DEL_STICKY}>
      <CabeceraDeServicios />
      <div className={CLASE_DE_LA_PILA}>
        {SERVICIOS.map((servicio, i) => (
          <div
            key={servicio.id}
            data-servicio={servicio.id}
            // Las dos mitades de la misma decisión: `data-capa` es lo que la
            // capa DICE ser y la clase es lo que HACE. `capasDeServicio` las
            // cruza y no acepta que se contradigan. El orden en el que salgan
            // al marcado es indiferente: el instrumento lee la etiqueta entera.
            data-capa={formaDeCapa(i === indice)}
            className={clasesDeCapa(i === indice)}
          >
            <ContenidoDeServicio
              servicio={servicio}
              // Sólo la capa que se ve consume el progreso. Ver la nota de
              // arriba: las otras dos se montan en su rama quieta.
              progreso={i === indice ? progreso : null}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export interface ServiciosEnSecuenciaProps {
  /** El progreso del PIN, 0 cuando se clava y 1 cuando se suelta. */
  readonly progreso: MotionValue<number>
}

export function ServiciosEnSecuencia({
  progreso,
}: ServiciosEnSecuenciaProps): React.JSX.Element {
  const indice = useTransform(progreso, (p) => tramoDeSecuencia(p, CANTIDAD_DE_TRAMOS).indice)
  // ⚠️ **`asentar` se aplica ACÁ y en ningún otro lado, y es la condición de que
  // la secuencia siga siendo UNA.** Los cinco canales cuelgan de este único
  // número: remapearlo una vez los mueve a los cinco a la vez. Remapear canal
  // por canal daría cinco relojes que se ven parecidos y no lo son — que es
  // exactamente el control positivo que `s6-servicios` §8 ya corre.
  const local = useTransform(progreso, (p) =>
    asentar(tramoDeSecuencia(p, CANTIDAD_DE_TRAMOS).local),
  )
  const [activo, setActivo] = useState(0)

  useMotionValueEvent(indice, 'change', setActivo)

  return <PanelDeSecuencia activo={activo} progreso={local} />
}
