'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'

import { entornoDeLaEscena } from '../entorno'
import type { MoireHandle } from '../MoireScreen'
import { perseguirAlPuntero } from '../modulacionDeLaPose'
import { punteroDeLaOrbita } from '../punteroDeLaOrbita'
import { corrimientoPorElMouse, disposicionDelMoire } from './fijo'

/**
 * [B8] LA RENDIJA QUE SIGUE AL MOUSE (`?moire=mouse`) — lo único del moiré que se mueve. Lee sólo el puntero de la órbita (el
 * último fuera de los controles fijos): ni la cámara, ni el progreso, ni el reloj. Lo persigue con el amortiguador del puntero de
 * la cámara y lo escribe como corrimiento de la textura de su capa, con tope (`fijo.ts`). En las otras variantes y con
 * movimiento reducido no se monta: la trama queda donde la arma `MoireScreen` (corrimiento cero).
 */
interface Props {
  readonly moireRef: RefObject<MoireHandle | null>
  readonly quieto: boolean
}

export function MoireDelMouse({ moireRef, quieto }: Props) {
  const capa = disposicionDelMoire(entornoDeLaEscena().moire).sigueAlMouse
  if (capa === null || quieto) return null
  return <RendijaDelMouse moireRef={moireRef} capa={capa} />
}

function RendijaDelMouse({ moireRef, capa }: { readonly moireRef: RefObject<MoireHandle | null>; readonly capa: 'gruesa' | 'fina' }) {
  const puntero = useRef({ x: 0, y: 0 })
  useFrame((state, delta) => {
    const moire = moireRef.current
    if (moire === null) return
    const p = punteroDeLaOrbita(state.pointer.x, state.pointer.y)
    perseguirAlPuntero(puntero.current, p.x, p.y, Math.min(delta, 0.1))
    const textura = moire[capa]
    // Las celdas por vuelta de la capa son su repetición a lo ancho (`MoireScreen`, `applyRepeat`).
    corrimientoPorElMouse(textura.offset, puntero.current, textura.repeat.x)
  })
  return null
}
