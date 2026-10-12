'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { crearPuntero } from '../energia/interaccion/interaccion'
import { escucharElPuntero } from '../energia/interaccion/puntero'
import { TEXTO_EN_PANTALLA, cajasDelTexto } from '../energia/textoEnPantalla'
import { PEDIDOS_DEL_PASE } from '../pase/pase'
import { armarElEspejo, cuadroDelEspejo, soltarElEspejo, type ArmadoDelEspejo, type DeLaEscenaAlEspejo } from './armado'
import { ESPEJO, dispararYa, type Efecto, type EntradaDelDisparador } from './espejo'

/**
 * [PULIDO 18] P2 · LA DIMENSIÓN ESPEJO EN LA ESCENA (`?espejo=`; `docs/rediseno/DIMENSION-ESPEJO.md`). Monta el efecto pedido y lo
 * corre: el disparador (`?espejo-disparo=`: el ambiente, el scroll o mantener sobre el fondo), las cajas del texto (ahí no pinta), los
 * bordes de las secciones del scroll y el puntero. Pide al pase compartido la profundidad (siempre: lo que no es fondo no se toca) y
 * el color del cuadro (sólo con un efecto de pantalla vivo). Con movimiento reducido, nada.
 */
interface Props {
  readonly logoGroupRef: RefObject<THREE.Group | null>
  readonly quieto: boolean
}

type VentanaDelBanco = Window & {
  __espejoDelBanco?: { estado: () => { efecto: Efecto; modo: string; amplitud: number; zona: number[] }; disparar: (x: number, y: number) => void }
}

export function EspejoDeLaEscena({ logoGroupRef, quieto }: Props): React.JSX.Element | null {
  const { espejo } = entornoDeLaEscena().pruebas
  if (espejo === 'no' || quieto) return null
  return <EspejoPrendido logoGroupRef={logoGroupRef} efecto={espejo} />
}

interface Memoria {
  readonly bordes: Float32Array
  bordesEn: number
  textosEn: number
}

/** El tramo del scroll (en `en`): cuánto cerca del medio de la pantalla está cada borde de sección que dispara (crece y se cura con el avance). */
function tramoDelScroll(m: Memoria, ahora: number, alto: number, en: EntradaDelDisparador): void {
  const B = ESPEJO.scroll.bordes
  if (ahora - m.bordesEn > 500) {
    m.bordesEn = ahora
    for (let k = 0; k < B.length; k += 1) {
      const el = document.getElementById(B[k][1])
      m.bordes[k] = el === null ? Number.NaN : el.getBoundingClientRect().top + window.scrollY
    }
  }
  en.scrollAmplitud = 0
  en.scrollTramo = -1
  for (let k = 0; k < B.length; k += 1) {
    const d = (m.bordes[k] - window.scrollY - alto * 0.5) / Math.max(1, alto)
    const a = Number.isFinite(d) ? Math.exp(-((d / ESPEJO.scroll.ancho) ** 2) * 3) : 0
    if (a > en.scrollAmplitud) {
      en.scrollAmplitud = a
      en.scrollTramo = k
    }
  }
  if (en.scrollAmplitud < 0.02) en.scrollAmplitud = 0
}

function EspejoPrendido({ logoGroupRef, efecto }: { readonly logoGroupRef: RefObject<THREE.Group | null>; readonly efecto: Efecto }): React.JSX.Element {
  const pruebas = entornoDeLaEscena().pruebas
  const disparo = pruebas['espejo-disparo'] === 'no' ? 'ambiente' : pruebas['espejo-disparo']
  const prisma = pruebas['espejo-prisma'] === 'si'
  const grupo = useRef<THREE.Group>(null)
  const armadoRef = useRef<ArmadoDelEspejo | null>(null)
  const punteroRef = useRef(crearPuntero())
  const memoria = useRef<Memoria>({ bordes: new Float32Array(ESPEJO.scroll.bordes.length).fill(Number.NaN), bordesEn: Number.NEGATIVE_INFINITY, textosEn: Number.NEGATIVE_INFINITY })
  const escena = useRef<DeLaEscenaAlEspejo>({ dt: 0, camara: new THREE.PerspectiveCamera(), logo: null, noche: 0, resolucion: new THREE.Vector2(1, 1), pixel: 1, alto: 1 })
  // El armado se hace acá (no en el render): se cuelga del grupo y lo mutable vive en refs.
  useEffect(() => {
    const g = grupo.current
    if (g === null) return undefined
    const armado = armarElEspejo(efecto, disparo, prisma)
    g.add(armado.grupo)
    armadoRef.current = armado
    PEDIDOS_DEL_PASE.profundidad += 1
    const dejarDeEscuchar = escucharElPuntero(punteroRef.current)
    const ventana = window as VentanaDelBanco
    if (hayBanco()) {
      ventana.__espejoDelBanco = {
        estado: () => ({ efecto: armado.efecto, modo: armado.disparador.modo, amplitud: armado.disparador.amplitud, zona: [armado.disparador.zonaX, armado.disparador.zonaY, armado.disparador.zonaRadio] }),
        disparar: (x, y) => dispararYa(armado.disparador, armado.entrada, x, y),
      }
    }
    return () => {
      PEDIDOS_DEL_PASE.profundidad -= 1
      dejarDeEscuchar()
      g.remove(armado.grupo)
      soltarElEspejo(armado)
      armadoRef.current = null
      delete ventana.__espejoDelBanco
    }
  }, [efecto, disparo, prisma])
  useFrame((state, delta) => {
    const armado = armadoRef.current
    if (armado === null) return
    const puntero = punteroRef.current
    const ahora = performance.now()
    const en = armado.entrada
    en.tiempo = ahora / 1000
    en.x = puntero.x
    en.y = puntero.y
    en.apretado = puntero.apretado
    en.apretadoDesde = puntero.desde / 1000
    en.sobreTexto = puntero.sobreTexto
    tramoDelScroll(memoria.current, ahora, window.innerHeight, en)
    // Las cajas del texto (ahí no pinta), cada tanto: las mismas que lee el plasma.
    if (ahora - memoria.current.textosEn > TEXTO_EN_PANTALLA.cadaMs) {
      memoria.current.textosEn = ahora
      const u = armado.uniformes
      const cuantos = cajasDelTexto(u.uTextos.value, state.size.width, state.size.height)
      u.uCuantosTextos.value = cuantos
      for (let k = 0; k < Math.min(cuantos, en.textos.length / 4); k += 1) {
        const c = u.uTextos.value[k]
        en.textos[k * 4] = c.x
        en.textos[k * 4 + 1] = c.y
        en.textos[k * 4 + 2] = c.z
        en.textos[k * 4 + 3] = c.w
      }
      en.cuantosTextos = Math.min(cuantos, en.textos.length / 4)
    }
    const f = escena.current
    f.dt = Math.min(Math.max(delta, 0), 1 / 30)
    f.camara = state.camera
    f.logo = logoGroupRef.current
    f.noche = VIVO.uNoche.value
    state.gl.getDrawingBufferSize(f.resolucion)
    f.pixel = state.gl.getPixelRatio()
    f.alto = state.size.height
    cuadroDelEspejo(armado, f)
  })
  return <group ref={grupo} name="espejo" />
}
