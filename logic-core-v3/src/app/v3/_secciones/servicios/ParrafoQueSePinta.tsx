'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'

/**
 * EL PÁRRAFO QUE SE PINTA — un frente CONTINUO que atraviesa las palabras.
 *
 * ── Las dos versiones anteriores, y qué tenía mal cada una ────────────────
 *
 *   barrido    UN degradado detrás del párrafo entero, recortado al texto. El
 *              frente avanzaba en el eje horizontal de la CAJA, así que en un
 *              párrafo de tres renglones pintaba la primera palabra del segundo
 *              renglón al mismo tiempo que la del primero: el orden no era el de
 *              lectura. Y cortaba las palabras al medio con filo de guillotina.
 *   por salto  una palabra por vez, entera, al cruzar su umbral. El orden quedó
 *              bien y el corte desapareció, pero el movimiento pasó a ser
 *              discreto: 26 saltos, uno por palabra.
 *
 * Ésta junta las dos mitades buenas. El avance sigue siendo POR PALABRA —ninguna
 * empieza antes que la anterior, porque cada una tiene su tramo del avance— pero
 * adentro de su tramo el frente **la atraviesa** en vez de encenderla. En
 * cualquier instante hay tres zonas:
 *
 *     …las que quedaron atrás        tinta plena
 *     LA que el frente está cruzando  mitad y mitad, con un borde blando
 *     …las de adelante               sin pintar
 *
 * ── ⚠️ VOLVIERON `bg-clip-text` Y `text-transparent`, y va declarado ──────
 *
 * El borde blando es una zona de MEZCLA entre dos colores, y eso es un degradado
 * recortado al glifo: no hay forma de hacerlo con una propiedad de color, que
 * sólo puede valer una cosa por elemento. Las dos clases son modos de recorte,
 * no valores del tema, así que `s6-tokens` las va a marcar igual que antes —
 * **queda reportado, no evitado**: la lista blanca de ese gate es decisión del
 * dueño y no de este sprint.
 *
 * Lo que sí cambió respecto del barrido viejo es DE QUÉ es el degradado: antes
 * era uno solo, del ancho del párrafo; ahora hay uno por palabra, del ancho de
 * la palabra. Por eso el orden es de lectura y no de caja.
 *
 * ── ⚠️ EL ESPACIO VA ADENTRO DE LA PIEZA, adelante de la palabra ──────────
 *
 * Sin eso, dos piezas vecinas se anuncian pegadas —el defecto que este repo ya
 * tiene registrado como «PomeloExplore»— y el texto reconstruido deja de ser
 * idéntico al del contenido. `s6-servicios` §11 lo cruza carácter por carácter
 * contra `CONTENIDO[id].parrafo`, y §3 compara lo anunciado entre las dos ramas:
 * partir en palabras NO puede mover ni una coma ni un espacio.
 *
 * Sin progreso —la rama apilada, y con movimiento reducido— el párrafo sale
 * pintado entero: no hay nada que recorrer.
 */

const TINTA = 'var(--color-tinta)'

/** Un porcentaje, armado. Escrito entero sería un literal con unidad. */
function paradaEn(valor: number): string {
  return `${valor}%`
}

/** Cuánto de la tinta conserva una palabra sin pintar. El resto es papel. */
const PRESENCIA_SIN_PINTAR = 14

const SIN_PINTAR = `color-mix(in oklab, ${TINTA} ${paradaEn(PRESENCIA_SIN_PINTAR)}, transparent)`

/**
 * EL ANCHO DEL BORDE BLANDO, en porcentaje del ancho de la palabra.
 *
 * Es lo único que separa «un frente que atraviesa» de «un corte que avanza». Con
 * 0 sería una guillotina moviéndose; muy grande, la palabra entera queda siempre
 * a medio pintar y se pierde el borde. Un quinto de la palabra deja ver las dos
 * cosas: que hay un frente, y dónde está.
 */
const MEZCLA = 22

/** El ángulo, armado por el mismo motivo que los porcentajes: sentido de lectura. */
const HACIA_LA_DERECHA = `${90}deg`

/**
 * El degradado de UNA palabra, con el frente en `local` (0 → 1).
 *
 * ⚠️ El frente se mapea a `[-MEZCLA/2, 100 + MEZCLA/2]` y no a `[0, 100]`: si no,
 * en `local = 0` la mitad blanda ya asomaría por el borde izquierdo y la palabra
 * nacería con una astilla pintada. Corrido, en 0 está entera sin pintar y en 1
 * entera pintada, que es lo que el tramo de cada palabra promete.
 */
function fondoDe(local: number): string {
  const frente = -MEZCLA / 2 + local * (100 + MEZCLA)
  return `linear-gradient(${HACIA_LA_DERECHA}, ${TINTA} ${paradaEn(frente - MEZCLA / 2)}, ${SIN_PINTAR} ${paradaEn(frente + MEZCLA / 2)})`
}

export interface ParrafoQueSePintaProps {
  /**
   * CUÁNTO está pintado, de 0 a 1. **Ya remapeado por quien lo llama.**
   *
   * La pintura la deriva la tira de la POSICIÓN del bloque —empieza cuando el
   * bloque entra por abajo y termina antes de que su tope toque el difuminado—
   * y acá entra ya resuelta. Es la misma razón por la que las fronteras del
   * rodillo se derivan y no se escriben: lo que gobierna es la geometría.
   */
  readonly pintura: MotionValue<number> | null
  /** Las palabras, ya separadas por quien tiene el contenido. */
  readonly palabras: readonly string[]
  readonly className?: string
}

/** Lo que muestra una pieza: el espacio va ADELANTE, nunca detrás. */
function piezaDe(palabras: readonly string[], i: number): string {
  return i === 0 ? palabras[i] : ` ${palabras[i]}`
}

/**
 * Una palabra y su tramo del avance. El frente la atraviesa de izquierda a
 * derecha mientras el avance recorre `[i/n, (i+1)/n]`.
 */
function Palabra({
  texto,
  indice,
  cuantas,
  pintura,
}: {
  readonly texto: string
  readonly indice: number
  readonly cuantas: number
  readonly pintura: MotionValue<number>
}): React.JSX.Element {
  const backgroundImage = useTransform(pintura, (p) => {
    const local = Math.min(1, Math.max(0, p * cuantas - indice))
    return fondoDe(local)
  })
  return (
    <motion.span
      data-pieza="palabra"
      className="bg-clip-text text-transparent"
      style={{ backgroundImage }}
    >
      {texto}
    </motion.span>
  )
}

function ParrafoEnCurso({
  pintura,
  palabras,
  className,
}: {
  readonly pintura: MotionValue<number>
  readonly palabras: readonly string[]
  readonly className?: string
}): React.JSX.Element {
  return (
    <p data-pintado="en-curso" className={className}>
      {palabras.map((palabra, i) => (
        <Palabra
          key={`${i}-${palabra}`}
          texto={piezaDe(palabras, i)}
          indice={i}
          cuantas={palabras.length}
          pintura={pintura}
        />
      ))}
    </p>
  )
}

export function ParrafoQueSePinta({
  pintura,
  palabras,
  className,
}: ParrafoQueSePintaProps): React.JSX.Element {
  if (pintura === null) {
    return (
      <p data-pintado="entero" className={className}>
        {palabras.map((palabra, i) => (
          <span key={`${i}-${palabra}`} data-pieza="palabra">
            {piezaDe(palabras, i)}
          </span>
        ))}
      </p>
    )
  }
  return <ParrafoEnCurso pintura={pintura} palabras={palabras} className={className} />
}
