'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'

import { entornoDeLaEscena, type Escena4 } from '../entorno'
import { PULSO_VIVO, VIVO } from '../entorno/vivo'
import type { MoireHandle } from '../MoireScreen'
import { MOIRE_NEAR_BOTTOM, MOIRE_NEAR_RADIUS, MOIRE_NEAR_TOP, fineCells, verticalRepeat } from '../probeMoire'
import type { ProbeRigStore } from '../probeStore'
import { crearPuntero, type PunteroVivo } from '../peso/puntero'
import { M2, M5, MEMBRANA, corrimientoDelPulso, desajusteEn, velocidadDeLaGruesa } from './cupula'
import { CUPULA_VIVA } from './parche'

/**
 * [ESCENA 4] LA CÚPULA VIVA — escribe, después del rig, lo que la membrana y las variantes del moiré
 * cambian de las dos tramas. Sin la membrana y con el moiré de hoy no se monta: la cúpula queda como
 * la deja el rig.
 *
 * - La membrana: la onda nace con el pulso principal de E4 (`PULSO_VIVO.ultimoPrincipal`, leído) y la
 *   lente sigue al puntero fino.
 * - M1 y M2: la capa gruesa baja con su propia fase (pisa el `offset.y` que dejó el rig).
 * - M3, M4 y M5: la capa fina corre su fase o cambia su desajuste.
 *
 * Con movimiento reducido no se mueve nada de esto.
 */

interface PropsDeLaCupula {
  readonly rig: ProbeRigStore
  readonly moireRef: RefObject<MoireHandle | null>
  readonly quieto: boolean
}

export function CupulaViva(props: PropsDeLaCupula) {
  const e = entornoDeLaEscena().escena4
  if (!e.membrana && e.moire === 'hoy') return null
  return <CupulaPrendida {...props} escena4={e} />
}

interface Memoria {
  puntero: PunteroVivo | null
  faseGruesa: number
  velocidadDelScroll: number
  progreso: number
  pulsosPasados: number
  ultimoPrincipal: number
  cursorX: number
  lenteX: number
  lenteY: number
}

function CupulaPrendida({ rig, moireRef, quieto, escena4 }: PropsDeLaCupula & { readonly escena4: Escena4 }) {
  const memoria = useRef<Memoria>({ puntero: null, faseGruesa: 0, velocidadDelScroll: 0, progreso: Number.NaN, pulsosPasados: 0, ultimoPrincipal: -Infinity, cursorX: 0, lenteX: 9, lenteY: 9 })

  useEffect(() => {
    const m = memoria.current
    const puntero = crearPuntero()
    m.puntero = puntero
    return () => {
      puntero.soltar()
      m.puntero = null
    }
  }, [])

  useFrame((_, delta) => {
    const moire = moireRef.current
    const m = memoria.current
    if (moire === null) return
    const dt = Math.min(delta, 0.1)
    const t = VIVO.uTiempo.value
    const progreso = rig.current.progress
    const cruda = Number.isNaN(m.progreso) || dt <= 0 ? 0 : (progreso - m.progreso) / dt
    m.progreso = progreso
    const p = m.puntero?.leer() ?? null
    const hayCursor = p !== null && p.fino && p.adentro && !quieto
    const vivo = !quieto

    // La membrana: la onda del principal y la lente del cursor, en las dos capas.
    if (escena4.membrana) {
      const k = 1 - Math.exp(-dt / 0.08)
      if (hayCursor) {
        m.lenteX = m.lenteX > 5 ? p.x : m.lenteX + (p.x - m.lenteX) * k
        m.lenteY = m.lenteY > 5 ? p.y : m.lenteY + (p.y - m.lenteY) * k
      }
      for (const [capa, escala] of [[CUPULA_VIVA.gruesa, 0.5], [CUPULA_VIVA.fina, 1]] as const) {
        capa.uNacioLaOnda.value = PULSO_VIVO.ultimoPrincipal
        capa.uOnda.value = vivo ? MEMBRANA.onda.celdas * escala : 0
        capa.uLente.value = hayCursor ? MEMBRANA.lente.fuerza : 0
        capa.uCursorDeLaLente.value.set(m.lenteX, m.lenteY)
      }
    }

    if (!vivo) return
    const v = escena4.moire
    // M1 y M2: la gruesa baja con fase propia; M2 la acelera con el scroll y vuelve con la inercia de E6.
    if (v === 'M1a' || v === 'M1b' || v === 'M2') {
      m.velocidadDelScroll += (Math.abs(cruda) - m.velocidadDelScroll) * (1 - Math.exp(-dt / M2.tauS))
      m.faseGruesa = (m.faseGruesa + dt * velocidadDeLaGruesa(v, m.velocidadDelScroll)) % 1
      moire.drift.offset.y = m.faseGruesa
    }
    // M3: cada principal corre la fina una celda; se acumula para no volver atrás.
    if (v === 'M3') {
      if (PULSO_VIVO.ultimoPrincipal !== m.ultimoPrincipal) {
        if (Number.isFinite(m.ultimoPrincipal)) m.pulsosPasados += 1
        m.ultimoPrincipal = PULSO_VIVO.ultimoPrincipal
      }
      moire.fina.offset.x = (m.pulsosPasados + corrimientoDelPulso(t - m.ultimoPrincipal)) % 1
    }
    // M4: el desajuste de cada tramo, mezclando los dos enteros que lo rodean.
    if (v === 'M4') {
      const desajuste = desajusteEn(progreso)
      const a = Math.floor(desajuste)
      const alto = MOIRE_NEAR_TOP - MOIRE_NEAR_BOTTOM
      moire.fina.repeat.set(fineCells(a), verticalRepeat(MOIRE_NEAR_RADIUS, fineCells(a), alto))
      CUPULA_VIVA.fina.uRepeticionB.value.set(fineCells(a + 1), verticalRepeat(MOIRE_NEAR_RADIUS, fineCells(a + 1), alto))
      CUPULA_VIVA.fina.uCorrimientoB.value.copy(moire.fina.offset)
      CUPULA_VIVA.fina.uMezclaDelDesajuste.value = desajuste - a
    }
    // M5: el cursor corre la fase de la fina, media celda para cada lado.
    if (v === 'M5') {
      const objetivo = hayCursor ? p.x * M5.celdasPorLado : 0
      m.cursorX += (objetivo - m.cursorX) * (1 - Math.exp(-dt / M5.tauS))
      moire.fina.offset.x = m.cursorX
    }
  })

  return null
}
