'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { EN_VIVO } from '../final/recorridoDelFinal'
import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import { FRAGMENTOS_DE_LOS_HILOS, HILOS, VERTICES_DE_LOS_HILOS, activacionDelPuntero, semillasDeLosHilos } from './hilos'

/**
 * [PULIDO 11] E · LOS HILOS DE ENERGÍA, montados en lugar del polvo con `?hilos=si` (`hilos.ts`: qué son y por qué así). Una
 * malla instanciada: una cinta de `HILOS.puntos` pares de vértices por hilo, sin posiciones (las calcula el sombreador). El
 * puntero lo lee de la ventana (el mouse y el dedo: el cursor de la escena no empuja con el dedo) y lo suaviza acá.
 */
interface Props {
  readonly logoGroupRef: RefObject<THREE.Group | null>
  readonly quieto: boolean
}

/** El color en los valores que escribe el sombreador (sRGB: un `ShaderMaterial` no convierte la salida). */
const enSrgb = (hex: string): THREE.Vector3 => {
  const c = new THREE.Color(hex).convertLinearToSRGB()
  return new THREE.Vector3(c.r, c.g, c.b)
}

/** Los uniformes (uno solo en la página: el lienzo de la escena). Los escribe cada cuadro; el material los lee. */
const UNIFORMES_DE_LOS_HILOS = {
  uTiempo: { value: 0 },
  uCentro: { value: new THREE.Vector3() },
  uResolucion: { value: new THREE.Vector2(1, 1) },
  uPixel: { value: 1 },
  uCursor: { value: new THREE.Vector2(9, 9) },
  uAspecto: { value: 1 },
  uActivo: { value: 0 },
  uColorDia: { value: enSrgb(INK_COLOR) },
  uColorNoche: { value: enSrgb(PAPER_COLOR) },
  uNoche: { value: 0 },
  uApagado: { value: 0 },
}

function geometriaDeLosHilos(): THREE.InstancedBufferGeometry {
  const g = new THREE.InstancedBufferGeometry()
  const n = HILOS.puntos
  const k = new Float32Array(n * 2)
  const lado = new Float32Array(n * 2)
  for (let i = 0; i < n; i += 1) {
    k[i * 2] = i / (n - 1)
    k[i * 2 + 1] = i / (n - 1)
    lado[i * 2] = -1
    lado[i * 2 + 1] = 1
  }
  const indices: number[] = []
  for (let i = 0; i < n - 1; i += 1) indices.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
  g.setIndex(indices)
  // three pide `position` para contar los vértices; el sombreador no la lee.
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3))
  g.setAttribute('aK', new THREE.BufferAttribute(k, 1))
  g.setAttribute('aLado', new THREE.BufferAttribute(lado, 1))
  const { a, b } = semillasDeLosHilos()
  g.setAttribute('aSemillaA', new THREE.InstancedBufferAttribute(a, 4))
  g.setAttribute('aSemillaB', new THREE.InstancedBufferAttribute(b, 4))
  g.instanceCount = HILOS.cantidad
  return g
}

export function HilosDeEnergia({ logoGroupRef, quieto }: Props): React.JSX.Element {
  const geometria = useMemo(() => geometriaDeLosHilos(), [])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTICES_DE_LOS_HILOS,
        fragmentShader: FRAGMENTOS_DE_LOS_HILOS,
        uniforms: UNIFORMES_DE_LOS_HILOS,
        transparent: true,
        depthWrite: false,
        // Premultiplicado: de noche el alfa es 0 y la luz suma; de día, la tinta tapa el papel con su alfa.
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
      }),
    [],
  )
  useEffect(
    () => () => {
      geometria.dispose()
      material.dispose()
    },
    [geometria, material],
  )
  // El puntero: dónde (NDC), cuándo se movió por última vez y si hay un dedo apoyado.
  const puntero = useRef({ x: 9, y: 9, movidoEn: Number.NEGATIVE_INFINITY, dedo: false })
  useEffect(() => {
    const p = puntero.current
    const mover = (e: PointerEvent): void => {
      p.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1
      p.y = 1 - (e.clientY / Math.max(1, window.innerHeight)) * 2
      p.movidoEn = performance.now()
      if (e.type === 'pointerdown' && e.pointerType !== 'mouse') p.dedo = true
    }
    const soltar = (e: PointerEvent): void => {
      if (e.pointerType !== 'mouse') p.dedo = false
    }
    window.addEventListener('pointermove', mover, { passive: true })
    window.addEventListener('pointerdown', mover, { passive: true })
    window.addEventListener('pointerup', soltar, { passive: true })
    window.addEventListener('pointercancel', soltar, { passive: true })
    return () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerdown', mover)
      window.removeEventListener('pointerup', soltar)
      window.removeEventListener('pointercancel', soltar)
    }
  }, [])
  const centro = useRef(new THREE.Vector3())
  useFrame((state, delta) => {
    const dt = Math.min(Math.max(delta, 0), 0.1)
    const u = UNIFORMES_DE_LOS_HILOS
    const p = puntero.current
    u.uTiempo.value = VIVO.uTiempo.value
    logoGroupRef.current?.getWorldPosition(centro.current)
    u.uCentro.value.copy(centro.current)
    // El búfer de dibujo, leído acá (el de `VIVO` lo escribe la estela, que puede estar apagada).
    state.gl.getDrawingBufferSize(u.uResolucion.value)
    u.uPixel.value = state.gl.getPixelRatio()
    u.uAspecto.value = state.size.width / Math.max(1, state.size.height)
    // El cursor suavizado; prendido mientras se mueve (o hay un dedo), suelto despacio después. Quieto: nada.
    const cursor = u.uCursor.value
    cursor.x += (p.x - cursor.x) * (1 - Math.exp(-dt / 0.05))
    cursor.y += (p.y - cursor.y) * (1 - Math.exp(-dt / 0.05))
    const empuje = !quieto && (p.dedo || performance.now() - p.movidoEn < 250) ? HILOS.activacion.empujeEntero : 0
    u.uActivo.value = activacionDelPuntero(u.uActivo.value, empuje, dt)
    u.uNoche.value = VIVO.uNoche.value
    // En el final del pie se apagan con la cámara que sube: la energía del piso es la que manda.
    u.uApagado.value = EN_VIVO.camara
  })
  return <mesh geometry={geometria} material={material} frustumCulled={false} name="hilos" />
}
