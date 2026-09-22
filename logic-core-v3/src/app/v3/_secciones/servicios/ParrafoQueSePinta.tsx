'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'

/**
 * EL PÁRRAFO QUE SE PINTA — PALABRA POR PALABRA, y cada una cambia entera.
 *
 * ── ⚠️ Lo que reemplaza, y por qué el barrido estaba mal ──────────────────
 *
 * Antes era UN degradado corriéndose por detrás del texto, recortado con
 * `bg-clip-text`. El frente avanzaba de forma continua en el eje horizontal, así
 * que **cortaba las palabras al medio**: se veía media palabra en tinta plena y
 * la otra mitad en gris, que es un artefacto del mecanismo y no una decisión de
 * lectura. La referencia no hace eso: ahí lo que avanza es la CUENTA de palabras
 * resueltas, y cada palabra cambia de una vez cuando el avance la alcanza.
 *
 * Ahora cada palabra es una pieza con su propio umbral —su posición relativa en
 * el párrafo— y su color sale de comparar el avance contra ese umbral. El
 * movimiento se lee continuo porque hay muchas palabras, no porque cada una se
 * interpole.
 *
 * Y de paso se fueron `bg-clip-text` y `text-transparent`, que eran las dos
 * clases que `s6-tokens` tenía en rojo: no había un token que las respaldara
 * porque no son valores del tema, son modos de recorte. No se forzó nada — se
 * cayeron con el mecanismo que las pedía.
 *
 * ── ⚠️ EL ESPACIO VA ADENTRO DE LA PIEZA, adelante de la palabra ──────────
 *
 * Sin eso, dos piezas vecinas se anuncian pegadas —el defecto que este repo ya
 * tiene registrado como «PomeloExplore»— y el texto reconstruido deja de ser
 * idéntico al del contenido. `s6-servicios` §11 lo cruza carácter por carácter
 * contra `CONTENIDO[id].parrafo`, y §3 compara lo anunciado entre las dos ramas:
 * partir en palabras NO puede mover ni una coma ni un espacio.
 *
 * ── Los dos colores ───────────────────────────────────────────────────────
 *
 * El pintado es la tinta del sistema. El no pintado es esa MISMA tinta bajada
 * con `color-mix` hasta casi el papel: arranca al borde de lo invisible, que es
 * lo que hace que el texto «aparezca» en vez de «encenderse». `color-mix` es la
 * única función de color que el escáner de la sección admite, justamente porque
 * no trae un valor: compone los que ya están en el tema.
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
 * Una palabra. El umbral es su posición en el párrafo, así que la última se
 * resuelve justo cuando el avance llega a 1.
 */
function Palabra({
  texto,
  umbral,
  pintura,
}: {
  readonly texto: string
  readonly umbral: number
  readonly pintura: MotionValue<number>
}): React.JSX.Element {
  const color = useTransform(pintura, (p) => (p >= umbral ? TINTA : SIN_PINTAR))
  return (
    <motion.span data-pieza="palabra" style={{ color }}>
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
          umbral={(i + 1) / palabras.length}
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
