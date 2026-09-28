'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

import { hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { suscribirAlDiaDelFinal } from '../nocheDisparada'
import { BARRIDO_DEL_DIA, DIA_DESDE_AFUERA, frenteEn, hayDiaDesdeAfuera } from './desdeAfuera'

/**
 * [ESCENA 6] 6g · EL BARRIDO DEL DÍA — cuando la compuerta de la variante prende el día
 * (`desdeAfuera.ts`), corre el frente de afuera hacia el logo en `DIA_DESDE_AFUERA.duracionS`. Si la
 * compuerta se apaga en el medio (se volvió a subir), el barrido se corta: la noche vuelve escondida.
 */

type VentanaDelBanco = Window & { __diaDelBanco?: { barrido: () => { activo: boolean; frente: number; desde: number } } }

export function DiaDesdeAfuera() {
  if (!hayDiaDesdeAfuera()) return null
  return <Barrido />
}

function Barrido() {
  const memoria = useRef({ desde: Number.NaN, activo: false })

  useEffect(
    () =>
      suscribirAlDiaDelFinal((activo) => {
        const m = memoria.current
        m.activo = activo
        m.desde = activo ? VIVO.uTiempo.value : Number.NaN
      }),
    [],
  )

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__diaDelBanco = { barrido: () => ({ activo: memoria.current.activo, frente: BARRIDO_DEL_DIA.uFrenteDelDia.value, desde: memoria.current.desde }) }
    return () => {
      delete ventana.__diaDelBanco
    }
  }, [])

  useFrame(() => {
    const m = memoria.current
    const s = VIVO.uTiempo.value - m.desde
    const barriendo = m.activo && s >= 0 && s < DIA_DESDE_AFUERA.duracionS
    barrer(barriendo, barriendo ? frenteEn(s) : 1e4)
  })

  return null
}

function barrer(activo: boolean, frente: number): void {
  BARRIDO_DEL_DIA.uBarridoDelDia.value = activo ? 1 : 0
  BARRIDO_DEL_DIA.uFrenteDelDia.value = frente
}
