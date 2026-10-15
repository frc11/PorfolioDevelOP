'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { AMANECER_EN_VIVO } from '../amanecer/luz'
import { hayBanco } from '../entorno'
import { nocheDeLaEnergia } from '../entorno/nocheDelLogo'
import { PEDIDOS_DEL_PASE } from '../pase/pase'
import { NACE_EN } from '../entorno/Pulso'
import { LUCES_VIVAS, PULSO_VIVO, VIVO } from '../entorno/vivo'
import { EN_VIVO, FIN_DEL_GOLPE } from '../final/recorridoDelFinal'
import { FLOOR_Y } from '../probeScene'
import { energiaDelBanco, type EnergiaDelBanco } from './banco'
import { crearAfuera, cuadro, cuadroQuieto, type Afuera } from './cuadro'
import { armar, soltar, type Armado, type Vista } from './dibujo/armado'
import { aplicarElDia } from './dibujo/dia'
import { escucharElPuntero } from './interaccion/puntero'
import { juntarLasLucesVivas } from './lucesVivas'
import { TEXTO_EN_PANTALLA, cajaDelLogo, cajasDelTexto } from './textoEnPantalla'

/**
 * [PULIDO 17] O3 · LA ENERGÍA: el plasma A ([PULIDO 18] el producto, sin pedir nada; [PULIDO 19] Q0 · la única dirección: B se borró
 * con su enjambre y `?plasma=` con ella). Partículas de energía que brillan, vibran y se mueven, y los arcos de PULIDO 15 hechos luz
 * (`docs/rediseno/PLASMA.md`: el modelo; `REFERENCIAS-PLASMA.md`: de dónde sale). Las brasas y los arcos corren acá, en el cuadro
 * (`cuadro.ts`); lo que cambia en cada cuadro vive en refs. El puntero lo
 * escuchan `interaccion/puntero.ts` (el mouse sobre la página, el dedo mientras toca).
 */
interface Props {
  readonly logoGroupRef: RefObject<THREE.Group | null>
  readonly quieto: boolean
  readonly compacto: boolean
}

type VentanaDelBanco = Window & { __energiaDelBanco?: EnergiaDelBanco }

/** Después del golpe del final se apaga con la cámara que sube; antes, cerca del encastre, baja cerca del logo (no compite). */
const DESPUES_DEL_GOLPE = 0.15
const CERCA_DEL_FINAL = 0.85

export function PlasmaYCargas({ logoGroupRef, quieto, compacto }: Props): React.JSX.Element {
  const grupo = useRef<THREE.Group>(null)
  const armado = useRef<Armado | null>(null)
  const afuera = useRef<Afuera>(crearAfuera())
  const vista = useRef<Vista>({ camara: null, ancho: 1, alto: 1 })
  const quietas = useRef({ listo: false })
  // [PULIDO 18] P1.a · las partículas y los arcos blandos leen la profundidad del pase compartido (`pase/`).
  useEffect(() => {
    PEDIDOS_DEL_PASE.profundidad += 1
    return () => {
      PEDIDOS_DEL_PASE.profundidad -= 1
    }
  }, [])
  useEffect(() => {
    const g = grupo.current
    if (g === null) return undefined
    const a = armar(compacto, vista, () => logoGroupRef.current)
    // [PULIDO 27] Z2 · `?red=toda`: la red en reposo, un árbol que une todas las que se ven (`arbol.ts`); Z3 · `?dia=`: el día (`dia.ts`).
    const consulta = new URLSearchParams(window.location.search)
    a.red.modo = consulta.get('red') === 'toda' ? 'toda' : 'cadenas'
    aplicarElDia(consulta.get('dia'), a.dia)
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
      LUCES_VIVAS.uCuantas.value = 0
      delete ventana.__energiaDelBanco
    }
  }, [compacto, logoGroupRef])
  useFrame((state, delta) => {
    const a = armado.current
    // [PULIDO 28] AC1 · un cuadro con la cámara sin número no entra: las brasas guardarían el NaN para siempre (sin cargas, el cristal negro).
    if (a === null || !Number.isFinite(state.camera.position.lengthSq() + state.camera.quaternion.lengthSq())) return
    const u = a.uniformes
    vista.current.camara = state.camera
    vista.current.ancho = state.size.width
    vista.current.alto = state.size.height
    logoGroupRef.current?.getWorldPosition(a.centro)
    u.uCentro.value.copy(a.centro)
    state.gl.getDrawingBufferSize(u.uResolucion.value)
    u.uPixel.value = state.gl.getPixelRatio()
    if (state.camera instanceof THREE.PerspectiveCamera) u.uEscalaPx.value = u.uResolucion.value.y / (2 * Math.tan(THREE.MathUtils.degToRad(state.camera.fov) / 2))
    // [PULIDO 26] X3 · la noche de la energía sigue al frente del amanecer (sin el salto del cambio: `nocheDeLaEnergia`).
    u.uNoche.value = nocheDeLaEnergia(VIVO.uNoche.value, AMANECER_EN_VIVO.uBarridoDelDia.value, AMANECER_EN_VIVO.uFrenteDelDia.value)
    // [PULIDO 18] P1.c · de día, el calor refracta lo de atrás: la copia del cuadro (el pase compartido).
    if (u.uNoche.value < 0.97) PEDIDOS_DEL_PASE.colorEsteCuadro = true
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
      // [PULIDO 27] Z2 · y la del logo (la red en reposo no se forma delante).
      if (logoGroupRef.current !== null) cajaDelLogo(logoGroupRef.current, state.camera, a.red.cajas.logo)
    }
    // Con movimiento reducido: quietas (sin titilar, sin arcos ni pulsos).
    if (quieto) {
      u.uTiempo.value = 0
      cuadroQuieto(a, quietas.current)
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
    f.piso = FLOOR_Y + 0.02
    f.camara = state.camera
    cuadro(a, f)
    // [PULIDO 26] X4 · las luces que el cristal refleja de noche (los arcos de este cuadro y unas brasas fijas).
    juntarLasLucesVivas(u.uLuces.value, u.uCuantasLuces.value, a.brasas)
  })
  return <group ref={grupo} name="energia" />
}
