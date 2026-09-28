'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'

import { entornoDeLaEscena, hayBanco } from '../entorno'
import { PULSO_VIVO, VIVO } from '../entorno/vivo'
import type { MoireHandle } from '../MoireScreen'
import { MOIRE_NEAR_RADIUS, fineCells, verticalRepeat } from '../probeMoire'
import type { ProbeRigStore } from '../probeStore'
import { DESAJUSTE_VIVO } from './parche'
import { M2, corrimientoDelPulso, desajusteEn, velocidadDeLaGruesa } from './variantes'

/**
 * [ESCENA 5] EL MOIRÉ VIVO — escribe, después del rig, lo que M1a, M2, M3 y M4 cambian de las dos
 * tramas (`variantes.ts` tiene los números). Sin la bandera no se monta y la cúpula queda como la
 * deja el rig. Con movimiento reducido no se mueve nada: la gruesa queda donde la dejó el rig (quieta).
 */

interface PropsDelMoire {
  readonly rig: ProbeRigStore
  readonly moireRef: RefObject<MoireHandle | null>
  readonly quieto: boolean
}

/** La fase acumulada de la gruesa, en celdas (sin envolver). */
export const MOIRE_EN_VIVO = { celdasBajadas: 0 }

type VentanaDelBanco = Window & { __moireVivo?: { velocidad: number; desajuste: number; faseFina: number } }

export function MoireVivo(props: PropsDelMoire) {
  if (!entornoDeLaEscena().moire) return null
  return <MoirePrendido {...props} />
}

function MoirePrendido({ rig, moireRef, quieto }: PropsDelMoire) {
  const memoria = useRef({ velocidadDelScroll: 0, progreso: Number.NaN, pulsosPasados: 0, ultimoPrincipal: -Infinity })

  useFrame((_, delta) => {
    const moire = moireRef.current
    const m = memoria.current
    if (moire === null || quieto) return
    const dt = Math.min(delta, 0.1)
    const progreso = rig.current.progress
    const cruda = Number.isNaN(m.progreso) || dt <= 0 ? 0 : (progreso - m.progreso) / dt
    m.progreso = progreso

    // M1a + M2: la gruesa baja con su propia fase; el scroll la acelera y vuelve con la inercia de E6.
    m.velocidadDelScroll += (Math.abs(cruda) - m.velocidadDelScroll) * (1 - Math.exp(-dt / M2.tauS))
    const velocidad = velocidadDeLaGruesa(m.velocidadDelScroll)
    MOIRE_EN_VIVO.celdasBajadas += dt * velocidad
    moire.drift.offset.y = MOIRE_EN_VIVO.celdasBajadas % 1

    // M3: cada principal corre la fina una celda; se acumula para no volver atrás.
    if (PULSO_VIVO.ultimoPrincipal !== m.ultimoPrincipal) {
      if (Number.isFinite(m.ultimoPrincipal)) m.pulsosPasados += 1
      m.ultimoPrincipal = PULSO_VIVO.ultimoPrincipal
    }
    moire.fina.offset.x = (m.pulsosPasados + corrimientoDelPulso(VIVO.uTiempo.value - m.ultimoPrincipal)) % 1

    // M4: el desajuste de cada tramo, mezclando los dos enteros que lo rodean, con la fase de M3.
    const desajuste = desajusteEn(progreso)
    const a = Math.floor(desajuste)
    const alto = moire.altoDeLaFina
    moire.fina.repeat.set(fineCells(a), verticalRepeat(MOIRE_NEAR_RADIUS, fineCells(a), alto))
    DESAJUSTE_VIVO.uRepeticionB.value.set(fineCells(a + 1), verticalRepeat(MOIRE_NEAR_RADIUS, fineCells(a + 1), alto))
    DESAJUSTE_VIVO.uCorrimientoB.value.copy(moire.fina.offset)
    DESAJUSTE_VIVO.uMezclaDelDesajuste.value = desajuste - a

    if (hayBanco()) (window as VentanaDelBanco).__moireVivo = { velocidad, desajuste, faseFina: moire.fina.offset.x }
  })

  return null
}
