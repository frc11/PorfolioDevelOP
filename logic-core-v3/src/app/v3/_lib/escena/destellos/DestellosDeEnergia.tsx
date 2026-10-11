'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { EN_VIVO } from '../final/recorridoDelFinal'
import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import {
  DESTELLOS,
  FRAGMENTOS_DE_LA_CONSTELACION,
  FRAGMENTOS_DE_LOS_DESTELLOS,
  VERTICES_DE_LA_CONSTELACION,
  VERTICES_DE_LOS_DESTELLOS,
  activacionDelPuntero,
  indiceDeLaVariante,
  paresDeLaConstelacion,
  semillasDeLosDestellos,
  type VarianteDeDestellos,
} from './destellos'
import { TEXTO_EN_PANTALLA, cajasDelTexto } from './textoEnPantalla'

/**
 * [PULIDO 14] L3 · LOS DESTELLOS DE ENERGÍA, montados en lugar del polvo con `?destellos=<variante>` (`destellos.ts`: qué son, cada
 * variante y por qué así). Una nube de puntos sin posiciones (las calcula el sombreador) y, en `chispas`, los trazos de la
 * constelación. El puntero lo lee de la ventana (el mouse y el dedo) y lleva su estado acá: dónde está (suavizado), si pide (se
 * movió hace poco, o hay un dedo apoyado), cuánto lleva capturando y, al soltar, dónde y hace cuánto (la inercia).
 */
interface Props {
  readonly logoGroupRef: RefObject<THREE.Group | null>
  readonly variante: VarianteDeDestellos
  readonly quieto: boolean
  readonly compacto: boolean
  readonly color?: boolean
}

/** El color en los valores que escribe el sombreador (sRGB: un `ShaderMaterial` no convierte la salida). */
const enSrgb = (hex: string): THREE.Vector3 => {
  const c = new THREE.Color(hex).convertLinearToSRGB()
  return new THREE.Vector3(c.r, c.g, c.b)
}

/** `?destellos-color=si`: de noche un cian frío que brilla, de día un azul de tinta. */
const EN_COLOR = { noche: new THREE.Color().setHSL(0.53, 0.9, 0.76), dia: new THREE.Color().setHSL(0.6, 0.78, 0.34) } as const

function uniformesNuevos() {
  return {
    uTiempo: { value: 0 },
    uCentro: { value: new THREE.Vector3() },
    uResolucion: { value: new THREE.Vector2(1, 1) },
    uPixel: { value: 1 },
    uEscalaPx: { value: 1 },
    uCursor: { value: new THREE.Vector2(9, 9) },
    uAspecto: { value: 1 },
    uActivo: { value: 0 },
    uCaptura: { value: 0 },
    uSoltado: { value: new THREE.Vector2(9, 9) },
    uSuelta: { value: 0 },
    uSoltada: { value: 0 },
    uTextos: { value: Array.from({ length: TEXTO_EN_PANTALLA.cajas }, () => new THREE.Vector4()) },
    uCuantosTextos: { value: 0 },
    uColorDia: { value: enSrgb(INK_COLOR) },
    uColorNoche: { value: enSrgb(PAPER_COLOR) },
    uNoche: { value: 0 },
    uApagado: { value: 0 },
  }
}
type Uniformes = ReturnType<typeof uniformesNuevos>
/** Los uniformes (uno solo en la página: el lienzo de la escena). Los escribe cada cuadro; los dos materiales los leen. */
const UNIFORMES_DE_LOS_DESTELLOS: Uniformes = uniformesNuevos()

/** El material de los dos (premultiplicado: de noche el alfa es 0 y la luz suma; de día, la tinta tapa el papel con su alfa). */
function material(vertices: string, fragmentos: string, uniformes: Uniformes, variante: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: vertices,
    fragmentShader: fragmentos,
    uniforms: uniformes,
    defines: { VARIANTE: variante },
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  })
}

function nube(n: number, semillas: { readonly a: Float32Array; readonly b: Float32Array }): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry()
  // three pide `position` para contar los vértices; el sombreador no la lee.
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
  g.setAttribute('aSemillaA', new THREE.BufferAttribute(semillas.a.subarray(0, n * 4), 4))
  g.setAttribute('aSemillaB', new THREE.BufferAttribute(semillas.b.subarray(0, n * 4), 4))
  return g
}

function constelacion(semillas: { readonly a: Float32Array; readonly b: Float32Array }, m: number): THREE.BufferGeometry {
  const pares = paresDeLaConstelacion(semillas.a, m, DESTELLOS.chispas.vecinos)
  const v = pares.length
  const [a, b, oa, ob] = [new Float32Array(v * 4), new Float32Array(v * 4), new Float32Array(v * 4), new Float32Array(v * 4)]
  for (let k = 0; k < v; k += 1) {
    const [yo, otro] = [pares[k], pares[k % 2 === 0 ? k + 1 : k - 1]]
    for (let c = 0; c < 4; c += 1) {
      a[k * 4 + c] = semillas.a[yo * 4 + c]
      b[k * 4 + c] = semillas.b[yo * 4 + c]
      oa[k * 4 + c] = semillas.a[otro * 4 + c]
      ob[k * 4 + c] = semillas.b[otro * 4 + c]
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v * 3), 3))
  g.setAttribute('aSemillaA', new THREE.BufferAttribute(a, 4))
  g.setAttribute('aSemillaB', new THREE.BufferAttribute(b, 4))
  g.setAttribute('aOtroA', new THREE.BufferAttribute(oa, 4))
  g.setAttribute('aOtroB', new THREE.BufferAttribute(ob, 4))
  return g
}

/** Sólo con banco: otra cantidad (para medir hasta cuántos entran en el cuadro). */
type VentanaDelBanco = Window & { __cantidadDeDestellos?: number }
function cantidadDelBanco(): number | null {
  if (typeof window === 'undefined' || !hayBanco()) return null
  const n = (window as VentanaDelBanco).__cantidadDeDestellos
  return typeof n === 'number' && n > 0 ? Math.floor(n) : null
}

export function DestellosDeEnergia({ logoGroupRef, variante, quieto, compacto, color = false }: Props): React.JSX.Element {
  const n = cantidadDelBanco() ?? (compacto ? DESTELLOS.cantidadCompacta : DESTELLOS.cantidad)
  const uniformes = UNIFORMES_DE_LOS_DESTELLOS
  const armado = useMemo(() => {
    const semillas = semillasDeLosDestellos(n)
    const indice = indiceDeLaVariante(variante)
    const puntos = new THREE.Points(nube(n, semillas), material(VERTICES_DE_LOS_DESTELLOS, FRAGMENTOS_DE_LOS_DESTELLOS, uniformes, indice))
    puntos.frustumCulled = false
    puntos.name = 'destellos'
    const trazos = variante === 'chispas' ? new THREE.LineSegments(constelacion(semillas, Math.min(n, DESTELLOS.chispas.constelacion)), material(VERTICES_DE_LA_CONSTELACION, FRAGMENTOS_DE_LA_CONSTELACION, uniformes, indice)) : null
    if (trazos !== null) {
      trazos.frustumCulled = false
      trazos.name = 'constelación'
    }
    return { puntos, trazos }
  }, [n, variante, uniformes])
  useEffect(
    () => () => {
      for (const o of [armado.puntos, armado.trazos]) {
        if (o === null) continue
        o.geometry.dispose()
        if (o.material instanceof THREE.Material) o.material.dispose()
      }
    },
    [armado],
  )
  // El color: el de siempre (tinta y papel) o el frío.
  useEffect(() => {
    const [dia, noche] = color ? [EN_COLOR.dia, EN_COLOR.noche] : [null, null]
    const u = UNIFORMES_DE_LOS_DESTELLOS
    u.uColorDia.value.copy(dia === null ? enSrgb(INK_COLOR) : new THREE.Vector3(dia.r, dia.g, dia.b))
    u.uColorNoche.value.copy(noche === null ? enSrgb(PAPER_COLOR) : new THREE.Vector3(noche.r, noche.g, noche.b))
  }, [color])
  const texto = useRef({ leidoEn: Number.NEGATIVE_INFINITY, scroll: Number.NaN })
  // El puntero: dónde (NDC), cuándo se movió, si hay un dedo, si el mouse salió de la ventana; y si pedía en el cuadro anterior.
  const puntero = useRef({ x: 9, y: 9, movidoEn: Number.NEGATIVE_INFINITY, dedo: false, fuera: true, pedia: false })
  useEffect(() => {
    const p = puntero.current
    const mover = (e: PointerEvent): void => {
      p.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      p.y = 1 - (e.clientY / Math.max(1, window.innerHeight)) * 2
      p.movidoEn = performance.now()
      p.fuera = false
      if (e.type === 'pointerdown' && e.pointerType !== 'mouse') p.dedo = true
    }
    const soltar = (e: PointerEvent): void => {
      if (e.pointerType !== 'mouse') p.dedo = false
    }
    const salir = (e: MouseEvent): void => {
      if (e.relatedTarget === null) p.fuera = true
    }
    window.addEventListener('pointermove', mover, { passive: true })
    window.addEventListener('pointerdown', mover, { passive: true })
    window.addEventListener('pointerup', soltar, { passive: true })
    window.addEventListener('pointercancel', soltar, { passive: true })
    document.addEventListener('mouseout', salir)
    return () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerdown', mover)
      window.removeEventListener('pointerup', soltar)
      window.removeEventListener('pointercancel', soltar)
      document.removeEventListener('mouseout', salir)
    }
  }, [])
  const centro = useRef(new THREE.Vector3())
  useFrame((state, delta) => {
    const dt = Math.min(Math.max(delta, 0), 0.1)
    const u = UNIFORMES_DE_LOS_DESTELLOS
    const p = puntero.current
    // Con movimiento reducido, quietos: sin el tiempo ni el puntero.
    if (!quieto) u.uTiempo.value = VIVO.uTiempo.value
    logoGroupRef.current?.getWorldPosition(centro.current)
    u.uCentro.value.copy(centro.current)
    const resolucion = u.uResolucion.value
    state.gl.getDrawingBufferSize(resolucion)
    u.uPixel.value = state.gl.getPixelRatio()
    u.uAspecto.value = state.size.width / Math.max(1, state.size.height)
    if (state.camera instanceof THREE.PerspectiveCamera) u.uEscalaPx.value = resolucion.y / (2 * Math.tan(THREE.MathUtils.degToRad(state.camera.fov) / 2))
    const cursor = u.uCursor.value
    cursor.x += (p.x - cursor.x) * (1 - Math.exp(-dt / 0.05))
    cursor.y += (p.y - cursor.y) * (1 - Math.exp(-dt / 0.05))
    const pide = !quieto && (p.dedo || (!p.fuera && performance.now() - p.movidoEn < DESTELLOS.puntero.quietoS * 1000))
    const activo = activacionDelPuntero(u.uActivo.value, pide, dt)
    u.uActivo.value = activo
    if (pide) {
      u.uCaptura.value = Math.min(60, u.uCaptura.value + dt)
      u.uSuelta.value = 0
      u.uSoltada.value = 0
      u.uSoltado.value.copy(cursor)
    } else {
      // Al soltar: dónde y con cuánto; después, hace cuánto (la inercia). Pasado el rastro, todo en cero.
      if (p.pedia) u.uSoltada.value = activo
      u.uSuelta.value += dt
      if (u.uSuelta.value > 12) {
        u.uSoltada.value = 0
        u.uCaptura.value = 0
      }
    }
    p.pedia = pide
    u.uNoche.value = VIVO.uNoche.value
    // En el final del pie se apagan con la cámara que sube: la energía del piso es la que manda.
    u.uApagado.value = EN_VIVO.camara
    const ahora = performance.now()
    if (ahora - texto.current.leidoEn > TEXTO_EN_PANTALLA.cadaMs || Math.abs(window.scrollY - texto.current.scroll) > 1) {
      texto.current.leidoEn = ahora
      texto.current.scroll = window.scrollY
      u.uCuantosTextos.value = cajasDelTexto(u.uTextos.value, state.size.width, state.size.height)
    }
  })
  return (
    <>
      <primitive object={armado.puntos} />
      {armado.trazos !== null && <primitive object={armado.trazos} />}
    </>
  )
}
