'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { sonar } from '../../sonido/bus'
import { hayBanco } from '../entorno'
import { NACE_EN } from '../entorno/Pulso'
import { PULSO_VIVO, VIVO } from '../entorno/vivo'
import { EN_VIVO, FIN_DEL_GOLPE } from '../final/recorridoDelFinal'
import { FLOOR_Y } from '../probeScene'
import { energiaDelBanco, type EnergiaDelBanco } from './banco'
import { crearAfuera, crearMemoria, cuadro, cuadroQuieto, type Afuera, type Memoria } from './cuadro'
import { escucharElPuntero } from './interaccion/puntero'
import { armar, soltar, type Armado, type Vista } from './render/armado'
import { TEXTO_EN_PANTALLA, cajasDelTexto } from './textoEnPantalla'

/**
 * [PULIDO 16] N2 · EL PLASMA, montado con `?energia=plasma` (o `plasma-y-polvo`): átomos, iones y electrones con su física, arcos que
 * obedecen al campo, el logo como generador y el puntero como carga (`docs/rediseno/PLASMA.md`: el modelo). La física y los arcos
 * corren acá, en el cuadro (unos cientos de partículas: la grilla los resuelve en una fracción de ms; `cuadro.ts`); la GPU dibuja
 * las partículas instanciadas, los tramos desde un búfer fijo y los efectos (tres llamadas; `render/`). Lo que cambia en cada cuadro
 * vive en refs; el puntero lo escuchan `interaccion/puntero.ts` (el mouse sobre la página, el dedo mientras toca).
 * Experimentos (apagados): `?plasma-campo=si`, las líneas de campo con el botón apretado; `?plasma-sonido=si`, el chisporroteo.
 */
interface Props {
  readonly logoGroupRef: RefObject<THREE.Group | null>
  readonly quieto: boolean
  readonly compacto: boolean
  readonly color?: boolean
  readonly campo?: boolean
  readonly sonido?: boolean
}

type VentanaDelBanco = Window & { __energiaDelBanco?: EnergiaDelBanco }

/** Después del golpe del final se apaga con la cámara que sube (antes no: cerca del encastre el logo está más activo). */
const DESPUES_DEL_GOLPE = 0.15

export function PlasmaYCargas({ logoGroupRef, quieto, compacto, color = false, campo = false, sonido = false }: Props): React.JSX.Element {
  const grupo = useRef<THREE.Group>(null)
  const armado = useRef<Armado | null>(null)
  const memoria = useRef<Memoria>(crearMemoria())
  const afuera = useRef<Afuera>(crearAfuera())
  const vista = useRef<Vista>({ camara: null, ancho: 1, alto: 1 })
  useEffect(() => {
    const g = grupo.current
    if (g === null) return undefined
    const a = armar(compacto, color, vista, () => logoGroupRef.current)
    g.add(...a.mallas)
    armado.current = a
    memoria.current = crearMemoria()
    const dejarDeEscuchar = escucharElPuntero(a.puntero)
    const ventana = window as VentanaDelBanco
    if (hayBanco()) ventana.__energiaDelBanco = energiaDelBanco(a, vista, memoria)
    return () => {
      dejarDeEscuchar()
      g.remove(...a.mallas)
      soltar(a)
      armado.current = null
      delete ventana.__energiaDelBanco
    }
  }, [compacto, color, logoGroupRef])
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
    u.uTiempo.value = VIVO.uTiempo.value
    u.uFoco.value = state.camera.position.distanceTo(a.centro)
    const despues = Math.min(1, Math.max(0, (EN_VIVO.fin - FIN_DEL_GOLPE) / DESPUES_DEL_GOLPE))
    u.uApagado.value = EN_VIVO.camara * despues * despues * (3 - 2 * despues)
    // Las cajas del texto (los textos tapan: pasan por detrás), cada tanto o con el scroll.
    const ahora = performance.now()
    if (ahora - a.texto.leidoEn > TEXTO_EN_PANTALLA.cadaMs || Math.abs(window.scrollY - a.texto.scroll) > 1) {
      a.texto.leidoEn = ahora
      a.texto.scroll = window.scrollY
      u.uCuantosTextos.value = cajasDelTexto(u.uTextos.value, state.size.width, state.size.height)
    }
    // Con movimiento reducido: quietas, sin arcos ni pulsos.
    if (quieto) {
      cuadroQuieto(a, memoria.current)
      return
    }
    const f = afuera.current
    f.dt = Math.min(Math.max(delta, 0), 0.05)
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
    f.campo = campo
    f.camara = state.camera
    const nacidos = cuadro(a, memoria.current, f)
    if (sonido && nacidos > 0) sonar('chispa')
  })
  return <group ref={grupo} name="energia" />
}
