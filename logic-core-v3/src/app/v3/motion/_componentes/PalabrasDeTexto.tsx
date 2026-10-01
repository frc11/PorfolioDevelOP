'use client'

import type { MotionValue } from 'motion/react'
import { Fragment } from 'react'

import type { NombreDeCurva } from '../../_lib/motion/curvas'
import { palabrasDe, textoNormalizado } from '../../_lib/motion/lineas'
import type { Fotograma } from '../../_lib/motion/patrones'
import { Pieza } from './Pieza'

/**
 * [INTERFAZ 1] T1 · EL DIVISOR DE PALABRAS — una etiqueta que entra palabra por palabra, cada una por su ventana.
 *
 * El hermano de `LineasDeTexto` para lo corto (una etiqueta, un rótulo): ahí la línea sería una sola pieza y no habría
 * escalonado. Las palabras se conocen sin medir nada —el texto ya viene partido—, así que no hay fase de medición: el
 * primer cuadro ya es el partido y no hay parpadeo.
 *
 * ── La misma protección de accesibilidad ─────────────────────────────────
 *
 *     <span class="relative block">                 ← la raíz (en bloque, contenido de frase: vale adentro de un <p>)
 *       <span class="sr-only" data-palabras-accesible>  el texto ENTERO, legible
 *       <span aria-hidden data-palabras-piezas>         las palabras, invisibles al lector
 *
 * ── La ventana de cada palabra ───────────────────────────────────────────
 *
 * `inline-block overflow-hidden` con la holgura de `LineasDeTexto` (`py-1 -my-1`: 4 px de cada lado que aportan cero al
 * layout) y `align-top`: un `inline-block` que recorta pone su línea de base en el borde de abajo de su caja y correría
 * la línea; arriba, la caja coincide con la de la línea. Los espacios quedan como texto entre las ventanas: el
 * interletrado y el corte de línea son los del texto entero.
 */
export interface PalabrasDeTextoProps {
  readonly texto: string
  readonly progreso: MotionValue<number>
  readonly claves: readonly Fotograma[]
  readonly curva: NombreDeCurva
  readonly duracionDeclarada: number
  readonly escalonado: number
  readonly className?: string
}

export function PalabrasDeTexto({
  texto,
  progreso,
  claves,
  curva,
  duracionDeclarada,
  escalonado,
  className,
}: PalabrasDeTextoProps): React.JSX.Element {
  const palabras = palabrasDe(texto)
  const spec = { claves, curva, cronograma: { duracionDeclarada, escalonado, cantidad: palabras.length } }
  return (
    <span className={`relative block ${className ?? ''}`}>
      <span className="sr-only" data-palabras-accesible="">
        {textoNormalizado(texto)}
      </span>
      <span aria-hidden="true" data-palabras-piezas="">
        {palabras.map((palabra, i) => (
          <Fragment key={`${palabra}-${i}`}>
            <span className="inline-block overflow-hidden py-1 -my-1 align-top">
              <Pieza spec={spec} indice={i} progreso={progreso} como="span" className="inline-block">
                {palabra}
              </Pieza>
            </span>
            {i < palabras.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </span>
  )
}
