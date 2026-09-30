'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

import { hayBanco } from '../entorno'
import { AIRE } from '../polvo/parche'
import { ADAPTATIVA, dprDelEscalon, dprPendiente, estadoAdaptativoInicial, pasoAdaptativo } from './adaptativa'

/**
 * [CALIDAD 1] B11 · LA CALIDAD ADAPTATIVA, APLICADA — la cuenta está en `adaptativa.ts`. Corre sólo mientras la
 * escena dibuja (el lazo de r3f); en cada cuadro acerca la fracción de motas encendidas a la del escalón con un fundido
 * de `FUNDIDO_DE_MOTAS_S` (el shader del polvo las apaga de a una, al azar y parejo), y fija el dpr del lienzo cuando
 * el escalón lo cambia y el scroll lleva `scrollQuietoMs` quieto (redimensionar congela el hilo: con la página quieta
 * no se ve como un tirón del scroll). Con banco arranca apagada: los bancos miden configuraciones fijas; se prende a
 * pedido.
 */
const FUNDIDO_DE_MOTAS_S = 0.8

type VentanaDelBanco = Window & {
  __calidadDelBanco?: {
    estado: () => { readonly escalon: number; readonly aplicado: number; readonly media: number; readonly refresco: number; readonly motas: number; readonly dpr: number }
    activa: (v: boolean) => void
  }
}

export function CalidadAdaptativa({ dpr }: { readonly dpr: [number, number] }) {
  const setDpr = useThree((s) => s.setDpr)
  const gl = useThree((s) => s.gl)
  const memoria = useRef({ e: estadoAdaptativoInicial(), activa: !hayBanco(), aplicado: 0, ultimoScroll: Number.NEGATIVE_INFINITY })

  useEffect(() => {
    const alScroll = (): void => {
      memoria.current.ultimoScroll = performance.now()
    }
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', alScroll)
    }
  }, [])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__calidadDelBanco = {
      estado: () => ({ escalon: memoria.current.e.escalon, aplicado: memoria.current.aplicado, media: memoria.current.e.media, refresco: memoria.current.e.refresco, motas: AIRE.uFraccionDeMotas.value, dpr: gl.getPixelRatio() }),
      activa: (v) => {
        memoria.current.activa = v
      },
    }
    return () => {
      delete ventana.__calidadDelBanco
    }
  }, [gl])

  useFrame((_state, delta) => {
    const m = memoria.current
    pasoAdaptativo(m.e, delta * 1000, m.activa, dprPendiente(m.e.escalon, m.aplicado))
    if (m.e.escalon !== m.aplicado) {
      const cambiaElDpr = dprPendiente(m.e.escalon, m.aplicado)
      if (!cambiaElDpr || performance.now() - m.ultimoScroll >= ADAPTATIVA.scrollQuietoMs) {
        if (cambiaElDpr) setDpr(m.e.escalon === 0 ? dpr : dprDelEscalon(m.e.escalon, dpr[1], window.devicePixelRatio))
        m.aplicado = m.e.escalon
      }
    }
    acercarLasMotas(ADAPTATIVA.escalones[m.e.escalon].motas, delta)
  })
  return null
}

function acercarLasMotas(objetivo: number, delta: number): void {
  const u = AIRE.uFraccionDeMotas
  u.value += (objetivo - u.value) * (1 - Math.exp(-Math.min(delta, 0.1) / FUNDIDO_DE_MOTAS_S))
}
