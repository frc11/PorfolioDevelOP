'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { EN_VIVO } from '../final/recorridoDelFinal'
import { programarArcos, rellenarArcos, type ClaseDeArco } from './arcos'
import { armar, grupoEnPantalla, pintarLaPaleta, soltar, subir, type Armado, type Vista } from './armado'
import { PLASMA, cuantosEnlaces, pasoDeLasCargas } from './cargas'
import { TEXTO_EN_PANTALLA, cajasDelTexto } from './textoEnPantalla'

/**
 * [PULIDO 15] M2 · PLASMA + CARGAS, montado con `?energia=plasma` (`cargas.ts`: qué es y por qué así). La física y los arcos corren
 * acá, en el cuadro (unos cientos de cargas: la grilla las resuelve en una fracción de ms); la GPU dibuja las cargas instanciadas
 * (una llamada) y los arcos desde un búfer fijo (otra llamada). Lo que cambia en cada cuadro vive en refs (`armado.ts` arma las
 * mallas y se cuelgan de un grupo). El puntero lo lee de la ventana: el mouse mientras está sobre la página, el dedo mientras toca.
 */
interface Props {
  readonly logoGroupRef: RefObject<THREE.Group | null>
  readonly quieto: boolean
  readonly compacto: boolean
  readonly color?: boolean
}

/** El banco: qué hay (para medir y capturar), un arco ya, y dónde hay un grupo de cargas en la pantalla. */
interface EnergiaDelBanco {
  estado: () => { cargas: number; enlaces: number; arcos: number; contados: Record<ClaseDeArco, number>; maximoALaVez: number; cursor: boolean }
  forzar: (clase: ClaseDeArco) => void
  grupo: () => [number, number] | null
}
type VentanaDelBanco = Window & { __energiaDelBanco?: EnergiaDelBanco }

export function PlasmaYCargas({ logoGroupRef, quieto, compacto, color = false }: Props): React.JSX.Element {
  const n = compacto ? PLASMA.cargas.compacta : PLASMA.cargas.escritorio
  const grupo = useRef<THREE.Group>(null)
  const armado = useRef<Armado | null>(null)
  const vista = useRef<Vista>({ camara: null, ancho: 1, alto: 1 })
  useEffect(() => {
    const g = grupo.current
    if (g === null) return undefined
    const a = armar(n, compacto, vista, () => logoGroupRef.current)
    pintarLaPaleta(a.uniformes, color)
    g.add(...a.mallas)
    armado.current = a
    const ventana = window as VentanaDelBanco
    if (hayBanco()) {
      ventana.__energiaDelBanco = {
        estado: () => ({ cargas: a.cargas.n, enlaces: cuantosEnlaces(a.cargas), arcos: a.arcos.arcos.filter((x) => x.activo).length, contados: { ...a.arcos.contados }, maximoALaVez: a.arcos.maximoALaVez, cursor: a.rayo.activo }),
        forzar: (clase) => {
          a.arcos.forzado = clase
        },
        grupo: () => grupoEnPantalla(a, vista.current),
      }
    }
    return () => {
      g.remove(...a.mallas)
      soltar(a)
      armado.current = null
      delete ventana.__energiaDelBanco
    }
  }, [n, compacto, color, logoGroupRef])
  // El puntero: dónde (NDC), si es un mouse sobre la página o un dedo que toca. El dedo, por los eventos táctiles: los del puntero
  // se cancelan apenas el dedo desplaza la página, y el dedo sigue siendo una carga mientras toca.
  const puntero = useRef({ x: 9, y: 9, dedo: false, mouse: false, fuera: true })
  useEffect(() => {
    const p = puntero.current
    const enNdc = (x: number, y: number): void => {
      p.x = (x / Math.max(1, window.innerWidth)) * 2 - 1
      p.y = 1 - (y / Math.max(1, window.innerHeight)) * 2
      p.fuera = false
    }
    const mover = (e: PointerEvent): void => {
      if (e.pointerType !== 'mouse') return
      enNdc(e.clientX, e.clientY)
      p.mouse = true
    }
    const tocar = (e: TouchEvent): void => {
      const t = e.touches[0]
      p.dedo = t !== undefined
      p.mouse = false
      if (t !== undefined) enNdc(t.clientX, t.clientY)
    }
    const salir = (e: MouseEvent): void => {
      if (e.relatedTarget === null) p.fuera = true
    }
    window.addEventListener('pointermove', mover, { passive: true })
    window.addEventListener('pointerdown', mover, { passive: true })
    for (const tipo of ['touchstart', 'touchmove', 'touchend', 'touchcancel'] as const) window.addEventListener(tipo, tocar, { passive: true })
    document.addEventListener('mouseout', salir)
    return () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerdown', mover)
      for (const tipo of ['touchstart', 'touchmove', 'touchend', 'touchcancel'] as const) window.removeEventListener(tipo, tocar)
      document.removeEventListener('mouseout', salir)
    }
  }, [])
  useFrame((state, delta) => {
    const a = armado.current
    if (a === null) return
    const dt = Math.min(Math.max(delta, 0), 0.05)
    const u = a.uniformes
    const p = puntero.current
    vista.current.camara = state.camera
    vista.current.ancho = state.size.width
    vista.current.alto = state.size.height
    logoGroupRef.current?.getWorldPosition(a.centro)
    u.uCentro.value.copy(a.centro)
    a.camara[0] = state.camera.position.x - a.centro.x
    a.camara[1] = state.camera.position.y - a.centro.y
    a.camara[2] = state.camera.position.z - a.centro.z
    const resolucion = u.uResolucion.value
    state.gl.getDrawingBufferSize(resolucion)
    u.uPixel.value = state.gl.getPixelRatio()
    if (state.camera instanceof THREE.PerspectiveCamera) u.uEscalaPx.value = resolucion.y / (2 * Math.tan(THREE.MathUtils.degToRad(state.camera.fov) / 2))
    u.uNoche.value = VIVO.uNoche.value
    // En el final del pie se apagan con la cámara que sube: la energía del piso es la que manda.
    u.uApagado.value = EN_VIVO.camara
    const ahora = performance.now()
    if (ahora - a.texto.leidoEn > TEXTO_EN_PANTALLA.cadaMs || Math.abs(window.scrollY - a.texto.scroll) > 1) {
      a.texto.leidoEn = ahora
      a.texto.scroll = window.scrollY
      u.uCuantosTextos.value = cajasDelTexto(u.uTextos.value, state.size.width, state.size.height)
    }
    // Con movimiento reducido, quietas y sin arcos.
    if (quieto) return
    u.uTiempo.value = VIVO.uTiempo.value
    // El puntero, una carga sobre su rayo: el mouse mientras está sobre la página; el dedo mientras toca.
    a.rayo.activo = p.x < 2 && (p.mouse ? !p.fuera : p.dedo)
    if (a.rayo.activo) {
      a.v.set(p.x, p.y, 0.5).unproject(state.camera).sub(state.camera.position).normalize()
      Object.assign(a.rayo.r, { ox: a.camara[0], oy: a.camara[1], oz: a.camara[2], dx: a.v.x, dy: a.v.y, dz: a.v.z })
    }
    pasoDeLasCargas(a.cargas, dt, u.uTiempo.value, a.rayo.activo ? a.rayo.r : null, a.azar)
    programarArcos(a.arcos, a.cargas, dt, a.entorno, a.azar)
    subir(a, rellenarArcos(a.arcos, a.cargas, a.bufer))
  })
  return <group ref={grupo} name="energia" />
}
