'use client'

import type { MotionValue } from 'motion/react'
import { Fragment } from 'react'

import type { NombreDeCurva } from '../../_lib/motion/curvas'
import { textoDeLineas, textoNormalizado } from '../../_lib/motion/lineas'
import type { Fotograma } from '../../_lib/motion/patrones'
import { useLineasMedidas } from '../../_lib/motion/useLineasMedidas'
import { Pieza } from './Pieza'

/**
 * EL DIVISOR DE LÍNEAS — texto partido en líneas visuales, sin romper el texto.
 *
 * Es la mitad visible de `useLineasMedidas`. La otra mitad —cuándo medir, cómo
 * agrupar, por qué hay dos fases— está ahí, documentada.
 *
 * ── La protección de accesibilidad, que es la razón de esta forma ──────────
 *
 *     <div>                                    ← el contenedor, `position: relative`
 *       <span class="sr-only" data-lineas-accesible>  el texto ENTERO, legible
 *       <span aria-hidden data-lineas-piezas>         las líneas, invisibles al lector
 *
 * El lector de pantalla lee una sola cosa: la frase completa, en su orden, sin
 * que el corte visual —que depende del ancho de la ventana— cambie lo que se
 * anuncia. Las piezas quedan afuera de su árbol.
 *
 * Los dos atributos `data-` no son decoración: son por dónde agarra la
 * comprobación. `lineas.invariant.tsx` renderiza ESTE componente a HTML y exige
 * las dos mitades, y corre el mismo predicado contra una versión sin protección
 * —que tiene que fallar— para que el verde no pueda ser por vacío.
 *
 * ── El recorte, y los 4 px de holgura ──────────────────────────────────────
 *
 * Cada línea va en un contenedor con `overflow: hidden`: el patrón la sube desde
 * abajo y tiene que quedar recortada mientras llega. Con el interlineado de
 * títulos del sistema (1,09) la caja de línea es MÁS BAJA que el área de la
 * fuente, así que un recorte exacto se comería las colas de la g y la p.
 *
 * La holgura son `py-1` (un token, 4 px) más `-my-1` del mismo tamaño: el borde
 * de recorte baja 4 px y sube 4, y el aporte al layout queda en cero exacto
 * —padding +4 y margen −4 en el mismo elemento—. En un contenedor flex los
 * márgenes no colapsan, así que la cuenta vale también entre líneas vecinas.
 * El costo declarado: durante el recorrido se ven 4 px de la línea que entra
 * antes del borde. Es el mismo compromiso que hace cualquier divisor de líneas.
 */

export interface LineasDeTextoProps {
  readonly texto: string
  /** El progreso del patrón. Cada línea deriva el suyo del escalonado. */
  readonly progreso: MotionValue<number>
  readonly claves: readonly Fotograma[]
  readonly curva: NombreDeCurva
  readonly duracionDeclarada: number
  readonly escalonado: number
  /** Las clases de tipografía del bloque. Sin ellas la medición no vale. */
  readonly className?: string
}

export function LineasDeTexto({
  texto,
  progreso,
  claves,
  curva,
  duracionDeclarada,
  escalonado,
  className,
}: LineasDeTextoProps): React.JSX.Element {
  const { palabras, lineas, midiendo, refContenedor, guardarPalabra } = useLineasMedidas(texto)
  const textos = textoDeLineas(palabras, lineas)

  const spec = {
    claves,
    curva,
    cronograma: { duracionDeclarada, escalonado, cantidad: lineas.length },
  }

  return (
    <div ref={refContenedor} className={`relative ${className ?? ''}`}>
      {/* El texto accesible. Es lo ÚNICO que anuncia un lector de pantalla. */}
      <span className="sr-only" data-lineas-accesible="">
        {textoNormalizado(texto)}
      </span>

      {/* UN SOLO envoltorio para las dos fases. La protección —`aria-hidden` y
          la marca— se escribe una vez: si estuviera duplicada en las dos ramas,
          una podría desviarse de la otra sin que nada lo note, y la comprobación
          solo puede renderizar una de las dos sin navegador. */}
      <span
        aria-hidden="true"
        data-lineas-piezas=""
        className={midiendo ? 'invisible block' : 'flex flex-col'}
      >
        {midiendo
          ? // Fase de medición: flujo plano, como un párrafo cualquiera. Es el
            // reflujo REAL del navegador y es lo único que se puede medir.
            // `invisible` conserva el layout y evita el cuadro sin partir.
            palabras.map((palabra, i) => (
              <Fragment key={`${palabra}-${i}`}>
                <span ref={guardarPalabra(i)}>{palabra}</span>{' '}
              </Fragment>
            ))
          : textos.map((linea, i) => (
              <span key={`${linea}-${i}`} className="block overflow-hidden py-1 -my-1">
                <Pieza spec={spec} indice={i} progreso={progreso} como="span" className="block">
                  {linea}
                </Pieza>
              </span>
            ))}
      </span>
    </div>
  )
}
