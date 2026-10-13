'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { cajasDelTexto, TEXTO_EN_PANTALLA } from '../energia/textoEnPantalla'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { EN_VIVO } from '../final/recorridoDelFinal'
import { KEY_AZIMUTH_DEG, KEY_ELEVATION_DEG, KEY_FOLLOW_AZIMUTH_OFFSET_DEG } from '../probeLighting'
import { CRISTAL, amplitudDelCristal, amplitudPorDonde, esquirlasDelCristal } from './cristal'
import { armarLasEsquirlas } from './esquirlas'
import { crearElFondo, dibujarElFondo, soltarElFondo, type FondoDelCristal } from './fondo'
import { armarElVidrio, uniformesDelVidrio } from './vidrio'

/** Las esquirlas (siempre las mismas: la semilla). */
const ESQUIRLAS = esquirlasDelCristal()

/**
 * [PULIDO 20] R2 · EL CRISTAL EN LA ESCENA: las esquirlas en el borde (`cristal.ts`, `esquirlas.ts`, `vidrio.ts`, `fondo.ts`). Siempre, salvo
 * `?cristal=no` o `?fondo=moire` (el moiré solo) y con movimiento reducido; apagado en el túnel de Trabajos y en Tu panel (con un fundido) y
 * con la cámara del final. Cada cuadro: la cámara de ESTE cuadro (el rig la mueve sin actualizar su matriz: el cristal de PULIDO 19 la
 * leía del cuadro anterior y vibraba), las cajas del texto (cada tanto, las mismas que lee el plasma) y el rectángulo del logo en la
 * pantalla (de su caja en el mundo), la luz de la sala, y el fondo (sólo si se ve). Va al final del escenario: todo ya se movió.
 */
interface Props {
  readonly quieto: boolean
  readonly logoGroupRef: React.RefObject<THREE.Group | null>
}

type VentanaDelBanco = Window & { __cristalDelBanco?: { estado: () => { amplitud: number; porDonde: number; esquirlas: number; logo: number[] }; apagar: (apagado: boolean) => void } }

interface Memoria {
  readonly bandas: Float32Array
  bandasEn: number
  textosEn: number
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

/** La barra (sus enlaces y el login): siempre adentro de las cajas, primero (no son de `[data-v3]`: el plasma no las ve). */
const SELECTOR_DE_LA_BARRA = '[data-pieza="barra-enlace"], [data-pieza="barra-login"]'

/** Las cajas de la barra en `destino` (NDC: x0, y0, x1, y1, con el margen del texto); devuelve cuántas. */
function cajasDeLaBarra(destino: readonly THREE.Vector4[], ancho: number, alto: number): number {
  const m = TEXTO_EN_PANTALLA.margenPx
  let n = 0
  for (const el of document.querySelectorAll(SELECTOR_DE_LA_BARRA)) {
    if (n >= destino.length) break
    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > alto || r.right < 0 || r.left > ancho) continue
    destino[n].set(((r.left - m) / ancho) * 2 - 1, 1 - ((r.bottom + m) / alto) * 2, ((r.right + m) / ancho) * 2 - 1, 1 - ((r.top - m) / alto) * 2)
    n += 1
  }
  return n
}

const CAJA = new THREE.Box3()
const ESQUINA = new THREE.Vector3()
const NEGRO = new THREE.Color(0, 0, 0)

/** El rectángulo del logo en la pantalla (NDC: x0, y0, x1, y1), de las ocho esquinas de su caja en el mundo; sin logo, vacío. */
function rectanguloDelLogo(logo: THREE.Object3D | null, camara: THREE.Camera, destino: THREE.Vector4): boolean {
  if (logo === null || !logo.visible) return false
  CAJA.setFromObject(logo)
  if (CAJA.isEmpty()) return false
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
  for (let k = 0; k < 8; k += 1) {
    ESQUINA.set(k & 1 ? CAJA.max.x : CAJA.min.x, k & 2 ? CAJA.max.y : CAJA.min.y, k & 4 ? CAJA.max.z : CAJA.min.z).project(camara)
    x0 = Math.min(x0, ESQUINA.x)
    y0 = Math.min(y0, ESQUINA.y)
    x1 = Math.max(x1, ESQUINA.x)
    y1 = Math.max(y1, ESQUINA.y)
  }
  destino.set(x0, y0, x1, y1)
  return true
}

export function CristalDeLaEscena({ quieto, logoGroupRef }: Props): React.JSX.Element | null {
  const pruebas = entornoDeLaEscena().pruebas
  if (pruebas['sin-cristal'] === 'si' || quieto) return null
  return <CristalPrendido logoGroupRef={logoGroupRef} />
}

function CristalPrendido({ logoGroupRef }: { readonly logoGroupRef: React.RefObject<THREE.Group | null> }): React.JSX.Element {
  const grupo = useRef<THREE.Group>(null)
  const uniformes = useRef(uniformesDelVidrio())
  const armado = useRef<{ readonly malla: THREE.Mesh; readonly fondo: FondoDelCristal } | null>(null)
  const memoria = useRef<Memoria>({ bandas: new Float32Array(CRISTAL.donde.apagadas.length * 2).fill(Number.NaN), bandasEn: Number.NEGATIVE_INFINITY, textosEn: Number.NEGATIVE_INFINITY, porDonde: 1, apagado: false, aparece: 0 })
  useEffect(() => {
    const g = grupo.current
    if (g === null) return undefined
    const u = uniformes.current
    const malla = armarElVidrio(armarLasEsquirlas(ESQUIRLAS), u, ESQUIRLAS.length)
    const fondo = crearElFondo()
    armado.current = { malla, fondo }
    g.add(malla)
    const ventana = window as VentanaDelBanco
    if (hayBanco()) {
      ventana.__cristalDelBanco = {
        estado: () => ({ amplitud: u.uAmplitud.value, porDonde: memoria.current.porDonde, esquirlas: ESQUIRLAS.length, logo: u.uHayLogo.value > 0.5 ? u.uLogo.value.toArray() : [] }),
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
    const ahora = performance.now()
    // Cristalizan al montarse (aparecen creciendo); después, la amplitud por dónde está la página y por el final.
    m.aparece = Math.min(1, m.aparece + Math.max(0, delta) / CRISTAL.movimiento.aparecenS)
    m.porDonde = porDondeVa(m, ahora)
    const amplitud = m.apagado ? 0 : amplitudDelCristal(m.porDonde, EN_VIVO.camara) * suave(m.aparece)
    u.uAmplitud.value = amplitud
    u.uCrece.value = CRISTAL.movimiento.crecenDesde + (1 - CRISTAL.movimiento.crecenDesde) * amplitud
    malla.visible = amplitud > 0.002
    if (!malla.visible) return
    // La cámara de ESTE cuadro (su matriz, al día) y la luz principal de la sala (sigue el azimut de la cámara con su corrimiento).
    const cam = state.camera
    cam.updateMatrixWorld()
    u.uCamara.value.setFromMatrixPosition(cam.matrixWorld)
    u.uVista.value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse)
    const az = Math.atan2(u.uCamara.value.x, u.uCamara.value.z) + THREE.MathUtils.degToRad(KEY_AZIMUTH_DEG + KEY_FOLLOW_AZIMUTH_OFFSET_DEG)
    const el = THREE.MathUtils.degToRad(KEY_ELEVATION_DEG)
    u.uLuz.value.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az))
    u.uTiempo.value = VIVO.uTiempo.value
    u.uNoche.value = VIVO.uNoche.value
    state.gl.getDrawingBufferSize(u.uResolucion.value)
    u.uPixel.value = state.gl.getPixelRatio()
    u.uAspecto.value = state.size.width / Math.max(1, state.size.height)
    // Las cajas de la barra y del texto (cada tanto: las del plasma, más) y el rectángulo del logo (cada cuadro: se mueve).
    if (ahora - m.textosEn > TEXTO_EN_PANTALLA.cadaMs) {
      m.textosEn = ahora
      const enLaBarra = cajasDeLaBarra(u.uCajas.value, state.size.width, state.size.height)
      u.uCuantasCajas.value = enLaBarra + cajasDelTexto(u.uCajas.value.slice(enLaBarra), state.size.width, state.size.height)
    }
    u.uHayLogo.value = rectanguloDelLogo(logoGroupRef.current, cam, u.uLogo.value) ? 1 : 0
    // El fondo que refractan: sólo lo de atrás (el cielo, el domo, la trama, la fábrica), con la cámara de este cuadro.
    u.uFondo.value = dibujarElFondo(fondo, state.gl, state.scene, cam, state.scene.fog?.color ?? NEGRO)
  })
  return <group ref={grupo} name="cristal" />
}
