'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { EN_VIVO } from '../final/recorridoDelFinal'
import { KEY_AZIMUTH_DEG, KEY_ELEVATION_DEG, KEY_FOLLOW_AZIMUTH_OFFSET_DEG } from '../probeLighting'
import { CRISTAL, amplitudDelCristal, amplitudPorDonde } from './cristal'
import { crearElFondo, dibujarElFondo, soltarElFondo, type FondoDelCristal } from './fondo'
import { armarElMuro, celdasDelMuro } from './muro'
import { armarElVidrio, uniformesDelVidrio } from './vidrio'

/** Las celdas del muro (siempre las mismas: la semilla). */
const CELDAS = celdasDelMuro()

/**
 * [PULIDO 20] R2 · EL CRISTAL EN LA ESCENA (`cristal.ts`, `muro.ts`, `vidrio.ts`, `fondo.ts`). Siempre, salvo `?cristal=no` o `?fondo=moire`
 * (el moiré solo) y con movimiento reducido; apagado en el túnel de Trabajos y en Tu panel (con un fundido) y con la cámara del final.
 * Cada cuadro: la cámara de ESTE cuadro (el rig la mueve sin actualizar su matriz: el cristal de PULIDO 19 la leía del cuadro anterior y
 * vibraba), la luz de la sala y el fondo (sólo si se ve). [PULIDO 23] U1 · el muro continuo, sin máscaras: ni las cajas del texto ni el
 * rectángulo del logo (lo tapa la profundidad). Va al final del escenario: todo ya se movió.
 */
interface Props {
  readonly quieto: boolean
  /** [PULIDO 23] U1 · ya no se usa (era el rectángulo del logo): queda en la firma del escenario. */
  readonly logoGroupRef: React.RefObject<THREE.Group | null>
}

type VentanaDelBanco = Window & { __cristalDelBanco?: { estado: () => { amplitud: number; porDonde: number; celdas: number }; apagar: (apagado: boolean) => void } }

interface Memoria {
  readonly bandas: Float32Array
  bandasEn: number
  porDonde: number
  apagado: boolean
  aparece: number
}

const suave = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * (3 - 2 * u)
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

const NEGRO = new THREE.Color(0, 0, 0)

export function CristalDeLaEscena({ quieto }: Props): React.JSX.Element | null {
  const pruebas = entornoDeLaEscena().pruebas
  if (pruebas['sin-cristal'] === 'si' || quieto) return null
  return <CristalPrendido />
}

function CristalPrendido(): React.JSX.Element {
  const grupo = useRef<THREE.Group>(null)
  const uniformes = useRef(uniformesDelVidrio())
  const armado = useRef<{ readonly malla: THREE.Mesh; readonly fondo: FondoDelCristal } | null>(null)
  const memoria = useRef<Memoria>({ bandas: new Float32Array(CRISTAL.donde.apagadas.length * 2).fill(Number.NaN), bandasEn: Number.NEGATIVE_INFINITY, porDonde: 1, apagado: false, aparece: 0 })
  useEffect(() => {
    const g = grupo.current
    if (g === null) return undefined
    const u = uniformes.current
    // [PULIDO 24] V1 · `?vitral-filo=si`: el filo oscuro, muy fino, entre las celdas (para comparar; por defecto, sin línea).
    u.uVitralFilo.value = new URLSearchParams(window.location.search).get('vitral-filo') === 'si' ? 1 : 0
    const malla = armarElVidrio(armarElMuro(CELDAS), u, CELDAS.length)
    const fondo = crearElFondo()
    armado.current = { malla, fondo }
    g.add(malla)
    const ventana = window as VentanaDelBanco
    if (hayBanco()) {
      ventana.__cristalDelBanco = {
        estado: () => ({ amplitud: u.uAmplitud.value, porDonde: memoria.current.porDonde, celdas: CELDAS.length }),
        apagar: (apagado) => {
          memoria.current.apagado = apagado
        },
      }
    }
    return () => {
      armado.current = null
      g.remove(malla)
      malla.geometry.dispose()
      if (malla.material instanceof THREE.Material) malla.material.dispose()
      soltarElFondo(fondo)
      delete ventana.__cristalDelBanco
    }
  }, [])
  useFrame((state, delta) => {
    const a = armado.current
    if (a === null) return
    const m = memoria.current
    const u = uniformes.current
    const { malla, fondo } = a
    // Aparece al montarse; después, la amplitud por dónde está la página y por el final.
    m.aparece = Math.min(1, m.aparece + Math.max(0, delta) / CRISTAL.movimiento.aparecenS)
    m.porDonde = porDondeVa(m, performance.now())
    const amplitud = m.apagado ? 0 : amplitudDelCristal(m.porDonde, EN_VIVO.camara) * suave(m.aparece)
    u.uAmplitud.value = amplitud
    malla.visible = amplitud > 0.002
    if (!malla.visible) return
    // La cámara de ESTE cuadro (su matriz, al día) y la luz principal de la sala (sigue el azimut de la cámara con su corrimiento).
    const cam = state.camera
    cam.updateMatrixWorld()
    u.uCamara.value.setFromMatrixPosition(cam.matrixWorld)
    const az = Math.atan2(u.uCamara.value.x, u.uCamara.value.z) + THREE.MathUtils.degToRad(KEY_AZIMUTH_DEG + KEY_FOLLOW_AZIMUTH_OFFSET_DEG)
    const el = THREE.MathUtils.degToRad(KEY_ELEVATION_DEG)
    u.uLuz.value.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az))
    u.uNoche.value = VIVO.uNoche.value
    // El fondo que refracta: sólo lo de atrás (el cielo, el domo, la trama, la fábrica), con la cámara de este cuadro y su margen
    // ([PULIDO 24] V1): el vidrio lo lee con esa vista.
    u.uFondo.value = dibujarElFondo(fondo, state.gl, state.scene, cam, state.scene.fog?.color ?? NEGRO)
    u.uVista.value.copy(fondo.vista)
  })
  return <group ref={grupo} name="cristal" />
}
