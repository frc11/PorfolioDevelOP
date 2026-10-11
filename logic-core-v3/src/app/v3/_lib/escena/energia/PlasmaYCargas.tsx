'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { hayBanco } from '../entorno'
import { NACE_EN } from '../entorno/Pulso'
import { PULSO_VIVO, VIVO } from '../entorno/vivo'
import { EN_VIVO, FIN_DEL_GOLPE } from '../final/recorridoDelFinal'
import { FLOOR_Y } from '../probeScene'
import { energiaDelBanco, type EnergiaDelBanco } from './banco'
import { crearAfuera, cuadro, cuadroQuieto, type Afuera } from './cuadro'
import { armar, soltar, type Armado, type Vista } from './dibujo/armado'
import type { Direccion } from './direcciones'
import { escucharElPuntero } from './interaccion/puntero'
import { TEXTO_EN_PANTALLA, cajasDelTexto } from './textoEnPantalla'

/**
 * [PULIDO 17] O3 · LA ENERGÍA, montada con `?energia=plasma` (o `plasma-y-polvo`) en una de sus tres direcciones (`?plasma=a|b|c`;
 * sin la bandera, la recomendada: `direcciones.ts`). Partículas de energía que brillan, vibran y se mueven, y los arcos de PULIDO 15
 * hechos luz (`docs/rediseno/PLASMA.md`: el modelo; `REFERENCIAS-PLASMA.md`: de dónde sale). Las brasas y los arcos corren acá, en
 * el cuadro (`cuadro.ts`); el enjambre de B y C, en la GPU (`enjambre/`); lo que cambia en cada cuadro vive en refs. El puntero lo
 * escuchan `interaccion/puntero.ts` (el mouse sobre la página, el dedo mientras toca).
 */
interface Props {
  readonly logoGroupRef: RefObject<THREE.Group | null>
  readonly quieto: boolean
  readonly compacto: boolean
  readonly direccion: Direccion
}

type VentanaDelBanco = Window & { __energiaDelBanco?: EnergiaDelBanco }

/** Después del golpe del final se apaga con la cámara que sube; antes, cerca del encastre, baja cerca del logo (no compite). */
const DESPUES_DEL_GOLPE = 0.15
const CERCA_DEL_FINAL = 0.85

export function PlasmaYCargas({ logoGroupRef, quieto, compacto, direccion }: Props): React.JSX.Element {
  const grupo = useRef<THREE.Group>(null)
  const armado = useRef<Armado | null>(null)
  const afuera = useRef<Afuera>(crearAfuera())
  const vista = useRef<Vista>({ camara: null, ancho: 1, alto: 1 })
  const quietas = useRef({ listo: false })
  useEffect(() => {
    const g = grupo.current
    if (g === null) return undefined
    const a = armar(direccion, compacto, vista, () => logoGroupRef.current)
    g.add(...a.mallas)
    armado.current = a
    quietas.current.listo = false
    const dejarDeEscuchar = escucharElPuntero(a.puntero)
    const ventana = window as VentanaDelBanco
    if (hayBanco()) ventana.__energiaDelBanco = energiaDelBanco(a, vista)
    return () => {
      dejarDeEscuchar()
      g.remove(...a.mallas)
      soltar(a)
      armado.current = null
      delete ventana.__energiaDelBanco
    }
  }, [direccion, compacto, logoGroupRef])
  useFrame((state, delta) => {
    const a = armado.current
    if (a === null) return
    const u = a.uniformes
    vista.current.camara = state.camera
    vista.current.ancho = state.size.width
    vista.current.alto = state.size.height
    logoGroupRef.current?.getWorldPosition(a.centro)
    u.uCentro.value.copy(a.centro)
    state.gl.getDrawingBufferSize(u.uResolucion.value)
    u.uPixel.value = state.gl.getPixelRatio()
    if (state.camera instanceof THREE.PerspectiveCamera) u.uEscalaPx.value = u.uResolucion.value.y / (2 * Math.tan(THREE.MathUtils.degToRad(state.camera.fov) / 2))
    u.uNoche.value = VIVO.uNoche.value
    u.uFoco.value = state.camera.position.distanceTo(a.centro)
    const despues = Math.min(1, Math.max(0, (EN_VIVO.fin - FIN_DEL_GOLPE) / DESPUES_DEL_GOLPE))
    u.uApagado.value = EN_VIVO.camara * despues * despues * (3 - 2 * despues)
    u.uCercaDelFinal.value = CERCA_DEL_FINAL * Math.min(1, Math.max(0, EN_VIVO.fin / Math.max(1e-3, FIN_DEL_GOLPE)))
    // Las cajas del texto (los textos tapan: pasan por detrás), cada tanto; con el scroll, más seguido (no en cada cuadro: el borde
    // es suave y leer las cajas reserva).
    const ahora = performance.now()
    const corrio = Math.abs(window.scrollY - a.texto.scroll) > 1
    if (ahora - a.texto.leidoEn > (corrio ? TEXTO_EN_PANTALLA.conScrollMs : TEXTO_EN_PANTALLA.cadaMs)) {
      a.texto.leidoEn = ahora
      a.texto.scroll = window.scrollY
      u.uCuantosTextos.value = cajasDelTexto(u.uTextos.value, state.size.width, state.size.height)
    }
    // Con movimiento reducido: quietas (sin titilar, sin arcos ni pulsos).
    if (quieto) {
      u.uTiempo.value = 0
      cuadroQuieto(a, state.gl, quietas.current)
      return
    }
    u.uTiempo.value = VIVO.uTiempo.value
    const f = afuera.current
    f.dt = Math.min(Math.max(delta, 0), 1 / 30)
    f.ahora = ahora
    f.tiempo = VIVO.uTiempo.value
    f.scroll = window.scrollY
    f.alto = window.innerHeight
    f.anillos = VIVO.uAnillos.value
    f.naceEn = NACE_EN
    f.ultimoPrincipal = PULSO_VIVO.ultimoPrincipal
    f.fin = EN_VIVO.fin
    f.golpe = FIN_DEL_GOLPE
    f.piso = FLOOR_Y - a.centro.y + 0.02
    f.camara = state.camera
    f.gl = state.gl
    f.logo = logoGroupRef.current
    cuadro(a, f)
  })
  return <group ref={grupo} name="energia" />
}
