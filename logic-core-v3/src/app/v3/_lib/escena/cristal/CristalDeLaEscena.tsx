'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { TEXTO_EN_PANTALLA, cajasDelTexto } from '../energia/textoEnPantalla'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { EN_VIVO } from '../final/recorridoDelFinal'
import { PEDIDOS_DEL_PASE } from '../pase/pase'
import { KEY_AZIMUTH_DEG, KEY_ELEVATION_DEG, KEY_FOLLOW_AZIMUTH_OFFSET_DEG } from '../probeLighting'
import { CRISTAL, amplitudDelCristal, amplitudPorDonde } from './cristal'
import { armarElCristal, cuadroDelCristal, uniformesDelCristal, type DelCuadroAlCristal } from './vidrio'

/**
 * [PULIDO 19] Q3 · EL CRISTAL EN LA ESCENA: la capa de vidrio facetado de fondo, siempre (`?cristal=no` la apaga: el banco la mide por
 * diferencia). Pide al pase compartido la profundidad (al montarse) y el color del cuadro (por cuadro, mientras se ve), lee las cajas
 * del texto (ahí, apenas) y dónde está la página (apagada en el túnel de Trabajos y en Tu panel, con un fundido; se va con la cámara
 * del final). La luz del brillo es la principal de la sala (sigue el azimut de la cámara con su corrimiento). Con movimiento reducido,
 * nada (es movimiento: las facetas derivan y los brillos corren con la cámara).
 */
interface Props {
  readonly quieto: boolean
}

type VentanaDelBanco = Window & { __cristalDelBanco?: { estado: () => { amplitud: number; porDonde: number }; apagar: (apagado: boolean) => void } }

interface Memoria {
  readonly bandas: Float32Array
  bandasEn: number
  textosEn: number
  porDonde: number
  apagado: boolean
}

/** Dónde está la página: las bandas de las secciones apagadas (cada medio segundo) y la amplitud por el medio de la pantalla. */
function porDondeVa(m: Memoria, ahora: number): number {
  const S = CRISTAL.donde.apagadas
  if (ahora - m.bandasEn > 500) {
    m.bandasEn = ahora
    for (let k = 0; k < S.length; k += 1) {
      const el = document.getElementById(S[k])
      if (el === null) {
        m.bandas[k * 2] = Number.NaN
        m.bandas[k * 2 + 1] = Number.NaN
        continue
      }
      const r = el.getBoundingClientRect()
      m.bandas[k * 2] = r.top + window.scrollY
      m.bandas[k * 2 + 1] = r.bottom + window.scrollY
    }
  }
  return amplitudPorDonde(window.scrollY + window.innerHeight / 2, window.innerHeight, m.bandas, S.length)
}

export function CristalDeLaEscena({ quieto }: Props): React.JSX.Element | null {
  const pruebas = entornoDeLaEscena().pruebas
  if (pruebas['sin-cristal'] === 'si' || quieto) return null
  return <CristalPrendido prisma={pruebas['espejo-prisma'] === 'si'} />
}

function CristalPrendido({ prisma }: { readonly prisma: boolean }): React.JSX.Element {
  const grupo = useRef<THREE.Group>(null)
  const uniformes = useRef(uniformesDelCristal())
  const memoria = useRef<Memoria>({ bandas: new Float32Array(CRISTAL.donde.apagadas.length * 2).fill(Number.NaN), bandasEn: Number.NEGATIVE_INFINITY, textosEn: Number.NEGATIVE_INFINITY, porDonde: 1, apagado: false })
  const cuadro = useRef<DelCuadroAlCristal>({ camara: new THREE.PerspectiveCamera(), resolucion: new THREE.Vector2(1, 1), pixel: 1, tiempo: 0, noche: 0, amplitud: 0, luzAzimut: 0, luzElevacion: THREE.MathUtils.degToRad(KEY_ELEVATION_DEG) })
  useEffect(() => {
    const g = grupo.current
    if (g === null) return undefined
    const u = uniformes.current
    u.uPrisma.value = prisma ? 1 : 0
    const malla = armarElCristal(u)
    g.add(malla)
    PEDIDOS_DEL_PASE.profundidad += 1
    const ventana = window as VentanaDelBanco
    if (hayBanco()) {
      ventana.__cristalDelBanco = {
        estado: () => ({ amplitud: u.uAmplitud.value, porDonde: memoria.current.porDonde }),
        apagar: (apagado) => {
          memoria.current.apagado = apagado
        },
      }
    }
    return () => {
      PEDIDOS_DEL_PASE.profundidad -= 1
      g.remove(malla)
      malla.geometry.dispose()
      if (malla.material instanceof THREE.Material) malla.material.dispose()
      delete ventana.__cristalDelBanco
    }
  }, [prisma])
  useFrame((state) => {
    const m = memoria.current
    const u = uniformes.current
    const ahora = performance.now()
    // Las cajas del texto (ahí, apenas), cada tanto: las mismas que lee el plasma.
    if (ahora - m.textosEn > TEXTO_EN_PANTALLA.cadaMs) {
      m.textosEn = ahora
      u.uCuantosTextos.value = cajasDelTexto(u.uTextos.value, state.size.width, state.size.height)
    }
    m.porDonde = porDondeVa(m, ahora)
    const f = cuadro.current
    f.camara = state.camera
    state.gl.getDrawingBufferSize(f.resolucion)
    f.pixel = state.gl.getPixelRatio()
    f.tiempo = VIVO.uTiempo.value
    f.noche = VIVO.uNoche.value
    f.amplitud = m.apagado ? 0 : amplitudDelCristal(m.porDonde, EN_VIVO.camara)
    // La luz principal de la sala sigue el azimut de la cámara con su corrimiento (`probeLighting.ts`).
    f.luzAzimut = Math.atan2(state.camera.position.x, state.camera.position.z) + THREE.MathUtils.degToRad(KEY_AZIMUTH_DEG + KEY_FOLLOW_AZIMUTH_OFFSET_DEG)
    cuadroDelCristal(u, f)
    if (f.amplitud > 0.002) PEDIDOS_DEL_PASE.colorEsteCuadro = true
  })
  return <group ref={grupo} name="cristal" />
}
