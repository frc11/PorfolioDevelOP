'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'

import type { MoireHandle } from '../MoireScreen'
import { perseguirAlPuntero } from '../modulacionDeLaPose'
import { punteroDeLaOrbita } from '../punteroDeLaOrbita'
import { hayEntradaDeAfuera, laEntradaDelMoire } from './entrada'
import { corrimientoPorElMouse } from './fijo'

/**
 * [B8] LA RENDIJA QUE SIGUE AL MOUSE — lo único del moiré que se mueve. Lee sólo el puntero de la órbita (el último fuera de los
 * controles fijos): ni la cámara, ni el progreso, ni el reloj. Lo persigue con el amortiguador del puntero de la cámara y lo
 * escribe como corrimiento de la textura de la capa, con tope (`fijo.ts`). [C2-31m] Es el moiré del producto (era `?moire=mouse`),
 * y la posición puede venir de afuera con el mismo rango (`entrada.ts`, la inclinación del teléfono). Con movimiento reducido el
 * mouse no la mueve (la trama queda donde la arma `MoireScreen`); una entrada de afuera, sí.
 */
interface Props {
  readonly moireRef: RefObject<MoireHandle | null>
  readonly quieto: boolean
}

export function MoireDelMouse({ moireRef, quieto }: Props) {
  const puntero = useRef({ x: 0, y: 0 })
  useFrame((state, delta) => {
    const moire = moireRef.current
    if (moire === null || (quieto && !hayEntradaDeAfuera())) return
    const p = laEntradaDelMoire(punteroDeLaOrbita(state.pointer.x, state.pointer.y))
    perseguirAlPuntero(puntero.current, p.x, p.y, Math.min(delta, 0.1))
    // Las celdas por vuelta de la capa son su repetición a lo ancho (`MoireScreen`, `applyRepeat`).
    corrimientoPorElMouse(moire.gruesa.offset, puntero.current, moire.gruesa.repeat.x)
  })
  return null
}
