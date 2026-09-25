'use client'

import { useFrame, useLoader, type RootState } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { SVGLoader } from 'three-stdlib'
import * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'
import { entornoDeLaEscena, hayBanco, type Escena4 } from '../entorno'
import { leerCajasDeTexto } from '../entorno/cajasDeTexto'
import { PULSO_VIVO } from '../entorno/vivo'
import type { ProbeRigStore } from '../probeStore'
import { fueraDelTunel } from '../tunelEnLaEscena'
import { armar, contarVisibles, type Armado } from './armado'
import { FORMACION, type Lectura } from './enFormacion'
import { DESENFOQUE, TEXTO } from './materiales'

/**
 * [ESCENA 4] LA FORMACIÓN — las copias falladas, en formación alrededor de un claro, un nivel más
 * abajo que el nuestro. Decoración de fondo (`enFormacion.ts` tiene el porqué de cada regla; `armado.ts`,
 * lo que se construye).
 *
 * **Cómo se dibuja.** Las copias van a una escena aparte, a media resolución, junto con TAPONES del
 * logo y de nuestro piso (sólo profundidad): así el logo las tapa igual que en la sala. Después un
 * plano de pantalla las vuelve a poner en el cuadro, desenfocadas, ANTES de la cúpula de rendijas
 * y del polvo: la cúpula está detrás de ellas y el polvo, delante. El desenfoque es sólo de ellas.
 *
 * **El piso de abajo.** Nuestra losa se achica al radio del claro (`StudioFloor`, `radioDeLaLosa`) y
 * un torno de papel hace el escalón (L1) o la rampa (L2), el piso de la formación y la pared que
 * vuelve a subir al ciclorama en el radio 34.
 *
 * **Dónde no está.** En el túnel de Trabajos (`tunelEnLaEscena.ts`), y en el teléfono: a 375 las copias
 * quedan de 20 a 40 px, desenfocadas y debajo del texto, y se leen como manchas. Con `movil=menos`
 * se ve la versión con menos copias (un bloque de cada dos, dos filas).
 */

interface PropsDeLaFormacion {
  readonly rig: ProbeRigStore
  readonly calidad: NivelDeCalidad
  readonly quieto: boolean
  readonly logoGroupRef: RefObject<THREE.Group | null>
}

type VentanaDelBanco = Window & {
  __formacionDelBanco?: { mostrar: (formacion: boolean, logo: boolean) => void; visibles: () => number; copias: number; instancias: number }
}

/** ¿Hay formación en esta carga y en este ancho? */
function hayFormacion(calidad: NivelDeCalidad): boolean {
  const e = entornoDeLaEscena().escena4
  return e.formacion !== 'no' && (calidad !== 'compacta' || e.movil === 'menos')
}

export function Formacion(props: PropsDeLaFormacion) {
  const e = entornoDeLaEscena().escena4
  if (e.formacion === 'no' || !hayFormacion(props.calidad)) return null
  return <FormacionPrendida {...props} escena4={e} lectura={e.formacion} />
}

/** El radio de la losa cuando hay formación: la del claro. `undefined` = la de siempre. */
export function radioDeLaLosaConFormacion(calidad: NivelDeCalidad): number | undefined {
  return hayFormacion(calidad) ? FORMACION.radioDelClaro : undefined
}


function FormacionPrendida({ rig, calidad, quieto, logoGroupRef, escena4, lectura }: PropsDeLaFormacion & { readonly escena4: Escena4; readonly lectura: Lectura }) {
  const svg = useLoader(SVGLoader, '/logodevelOP.svg')
  const movil = calidad === 'compacta'
  const armado = useMemo(() => armar(svg.paths.flatMap((p) => p.toShapes(true)), lectura, escena4, movil), [svg, lectura, escena4, movil])
  useEffect(() => () => armado.soltar(), [armado])
  const memoria = useRef({ tam: new THREE.Vector2(), camara: null as THREE.Camera | null, mirada: 0, textoLeidoEn: 0, progreso: Number.NaN, movio: 0 })

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__formacionDelBanco = {
      mostrar: (conFormacion, conLogo) => {
        armado.composicion.visible = conFormacion
        if (logoGroupRef.current !== null) logoGroupRef.current.visible = conLogo
      },
      visibles: () => (memoria.current.camara === null ? 0 : contarVisibles(armado.copias, memoria.current.camara, lectura)),
      copias: armado.copias.length,
      instancias: armado.instancias.count,
    }
    return () => {
      delete ventana.__formacionDelBanco
    }
  }, [armado, logoGroupRef, memoria, lectura])

  useFrame((state, delta) => {
    const m = memoria.current
    m.camara = state.camera
    const progreso = rig.current.progress
    const visible = fueraDelTunel(progreso)
    // Las cajas de texto, con freno: más seguido mientras el scroll se mueve.
    const ahora = performance.now()
    if (progreso !== m.progreso) {
      m.progreso = progreso
      m.movio = ahora
    }
    const cada = ahora - m.movio < 300 ? TEXTO.cadaMsConScroll : TEXTO.cadaMs
    if (visible > 0 && ahora - m.textoLeidoEn > cada) {
      m.textoLeidoEn = ahora
      leerTexto(armado, state.gl.domElement)
    }
    m.mirada = siguienteMirada(m.mirada, escena4.mirada && !quieto && PULSO_VIVO.hover, Math.min(delta, 0.1))
    dibujarAparte(armado, state, logoGroupRef.current, visible, m.mirada, m.tam)
  })

  return (
    <>
      <primitive object={armado.pozo} />
      <primitive object={armado.composicion} />
    </>
  )
}

/** Las cajas del texto en pantalla y la pluma, en píxeles del búfer. */
function leerTexto(a: Armado, lienzo: HTMLCanvasElement): void {
  leerCajasDeTexto(lienzo, a.compuesta.uTexto.value, TEXTO.plumaCss)
  const r = lienzo.getBoundingClientRect()
  a.compuesta.uPluma.value = TEXTO.plumaCss * (r.width > 0 ? lienzo.width / r.width : 1)
}

/** F-mirada: 0 → 1 en ~2,5 s al entrar el hover, y de vuelta al salir. */
function siguienteMirada(actual: number, hover: boolean, dt: number): number {
  const objetivo = hover ? 1 : 0
  const paso = dt / 2.5
  return objetivo > actual ? Math.min(objetivo, actual + paso) : Math.max(objetivo, actual - paso)
}

function dibujarAparte(a: Armado, state: RootState, logo: THREE.Group | null, visible: number, mirada: number, tam: THREE.Vector2): void {
  a.compuesta.uVisible.value = visible
  a.copia.uMirada.value = mirada
  if (visible <= 0) return
  const gl = state.gl
  gl.getDrawingBufferSize(tam)
  const ancho = Math.max(1, Math.round(tam.x * DESENFOQUE.resolucion))
  const alto = Math.max(1, Math.round(tam.y * DESENFOQUE.resolucion))
  if (a.buffer.width !== ancho || a.buffer.height !== alto) a.buffer.setSize(ancho, alto)
  a.compuesta.uTexel.value.set(1 / ancho, 1 / alto)

  // Los tapones del logo siguen a sus mallas (la vira, el peso, el hover): se copian las matrices.
  if (logo !== null && a.taponesDelLogo.length === 0) juntarTapones(a, logo)
  logo?.updateMatrixWorld(true)
  for (const { tapon, de } of a.taponesDelLogo) {
    tapon.matrixWorld.copy(de.matrixWorld)
    tapon.visible = de.visible && logo !== null && logo.visible
  }
  a.aparte.fog = state.scene.fog

  const antes = gl.getRenderTarget()
  const color = gl.getClearColor(new THREE.Color())
  const alfa = gl.getClearAlpha()
  gl.setRenderTarget(a.buffer)
  gl.setClearColor(0x000000, 0)
  gl.clear(true, true, false)
  gl.render(a.aparte, state.camera)
  gl.setRenderTarget(antes)
  gl.setClearColor(color, alfa)
}

function juntarTapones(a: Armado, logo: THREE.Group): void {
  logo.traverse((objeto) => {
    if (!(objeto instanceof THREE.Mesh)) return
    const tapon = new THREE.Mesh(objeto.geometry, a.tapon)
    // Antes que las copias: un tapón que llega tarde tapa la profundidad pero no borra el color.
    tapon.renderOrder = -1
    tapon.matrixAutoUpdate = false
    tapon.matrixWorldAutoUpdate = false
    a.aparte.add(tapon)
    a.taponesDelLogo.push({ tapon, de: objeto })
  })
}
