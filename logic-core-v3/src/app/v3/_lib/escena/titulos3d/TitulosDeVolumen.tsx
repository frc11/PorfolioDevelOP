'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'
import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import datosDeLaFuente from '../../../_fuentes/chivo-400-titulos.json'
import { TITULOS_DE_VOLUMEN, suscribirALosTitulos, versionDeLosTitulos, type TituloDeVolumen } from '../../titulos3d/registro'
import { conElAmanecer } from '../amanecer/luz'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { crearElEstudio, SATINADO } from '../estudio'
import { calentar } from '../gpu/Precompilar'
import { conLogoDeNoche, hornearContornos, type ContornoDelLogo } from '../logoDeNoche'
import { EMISION_EN_LA_NOCHE } from '../logoEmision'
import { KEY_INTENSITY } from '../probeLighting'
import { INK_COLOR, PAPER_COLOR } from '../probeScene'
import type { ProbeRigStore, ProbeStatsStore } from '../probeStore'
import { camaraDeLaLectura, colocar, lugarDeLectura, posicionesDelDom } from './colocacion'
import { armarElTitulo } from './geometria'
import { DISOLVER_GLSL, DISOLVER_PARS_GLSL, LLEGADA_NORMAL_GLSL, LLEGADA_PARS_GLSL, LLEGADA_POSICION_GLSL, persigue } from './llegada'

/**
 * [ESCENA 10] T3 · LOS TÍTULOS DE VOLUMEN EN LA ESCENA — una prueba (bandera `titulos=negro|blanco`), en un módulo que
 * sólo se descarga con ella. Cada título que anota una sección (`_lib/titulos3d/registro.ts`) se arma extruido con la
 * Chivo (`geometria.ts`), se pone quieto en el mundo (`colocacion.ts`) y sus letras llegan y se van con el progreso de
 * la pieza (`llegada.ts`). Una malla (una llamada) por título.
 *
 * **Los dos materiales.** `negro`: el negro satinado del logo (la tinta, su rugosidad y los reflejos del mismo estudio,
 * que siguen a la luz de la sala). `blanco`: el papel, con la misma rugosidad y el mismo estudio.
 *
 * **De noche** (Portfolio es de noche) la sala está apagada y un título sin luz no se lee. Se iluminan como el logo, que
 * ya resolvió su noche (ESCENA 9 T2, ESCENA 10 T1): emiten con la MISMA noche (su emisiva es la del logo, en el mismo
 * cuadro) y llevan su dibujo: los costados negros y las tapas claras con un filo más claro en el contorno. El negro, con
 * el gris de las tapas del logo; el blanco, con tapas casi blancas. Y el amanecer los oscurece como al resto de la sala
 * hasta que su frente los alcanza.
 *
 * **Cuándo se arma.** Con las fuentes del DOM cargadas y la página ociosa (la x de cada letra se lee del DOM: el
 * interletrado y el kerning del navegador), nunca en medio de la llegada; al montarse se compila y se calienta (regla 2:
 * el módulo llega después del precompilado). Se coloca al empezar cada llegada y al cambiar el tamaño del cuadro.
 */

/**
 * El filo de noche (em), el campo de su contorno (em) y las tapas del blanco de noche (valor en pantalla). Y el filo
 * del blanco de DÍA (su color, lineal): sobre el cielo claro las tapas blancas casi no se separan del fondo; con el filo
 * oscuro, el mismo dibujo de la noche al revés, se leen. De noche lo reemplaza el filo claro.
 */
const NOCHE_DEL_TITULO = { filo: 0.018, contorno: { alcance: 0.06, celda: 0.005 }, tapaDelBlanco: 0.86, filoDelBlancoDeDia: 0.06 } as const

/** El filo oscuro del blanco de día: el albedo del borde de las tapas, apagado con la noche (la del logo, por la emisiva). */
const FILO_DE_DIA_GLSL = /* glsl */ `
	diffuseColor.rgb = mix( diffuseColor.rgb, vec3( ${NOCHE_DEL_TITULO.filoDelBlancoDeDia.toFixed(3)} ), bordeDelLogoDeNoche() * ( 1.0 - clamp( emissive.r / ${EMISION_EN_LA_NOCHE.toFixed(3)}, 0.0, 1.0 ) ) );
`

type Variante = 'negro' | 'blanco'

const FUENTE = new Font(datosDeLaFuente as FontData)

interface Armado {
  readonly titulo: TituloDeVolumen
  /** Lo que se muestra: persigue a la llegada y a la salida de la pieza (`persigue`). */
  readonly mostrado: { llegada: number; salida: number }
  readonly grupo: THREE.Group
  readonly malla: THREE.Mesh
  readonly material: THREE.MeshStandardMaterial
  readonly uniforms: { readonly uLlegada: { value: number }; readonly uSalida: { value: number }; readonly uQuieto: { value: number } }
  readonly contorno: ContornoDelLogo
  colocado: boolean
}

interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
  readonly stats: ProbeStatsStore
  readonly rig: ProbeRigStore
}

type VentanaDelBanco = Window & { __titulosDelBanco?: { titulos: () => unknown; camara: () => unknown; progreso: () => number } }

export default function TitulosDeVolumen({ keyLightRef, logoMaterialRef, stats, rig }: Props) {
  const variante: Variante = entornoDeLaEscena().pruebas.titulos === 'blanco' ? 'blanco' : 'negro'
  const version = useSyncExternalStore(suscribirALosTitulos, versionDeLosTitulos, versionDeLosTitulos)
  const gl = useThree((s) => s.gl)
  const escena = useThree((s) => s.scene)
  const camara = useThree((s) => s.camera)
  const tam = useThree((s) => s.size)
  const raiz = useRef<THREE.Group>(null)
  const m = useRef({ armados: [] as Armado[], quieto: false, nudo: new THREE.PerspectiveCamera() })

  // Movimiento reducido: sin llegada (se disuelven en su lugar). Se lee al cambiar, no por cuadro.
  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)')
    const leer = (): void => {
      m.current.quieto = q.matches
    }
    leer()
    q.addEventListener('change', leer)
    return () => q.removeEventListener('change', leer)
  }, [])

  // El estudio de los reflejos, uno para todos los títulos.
  const estudio = useRef<THREE.WebGLRenderTarget | null>(null)
  useEffect(() => {
    const rt = crearElEstudio(gl)
    estudio.current = rt
    for (const a of m.current.armados) ponerElEstudio(a.material, rt)
    return () => {
      estudio.current = null
      rt.dispose()
    }
  }, [gl])

  // Los títulos anotados: se arman con las fuentes cargadas y la página ociosa; se sueltan al irse.
  useEffect(() => {
    void version
    const g = raiz.current
    const s = m.current
    if (g === null) return undefined
    let vivo = true
    let soltarElPedido = (): void => undefined
    const armados: Armado[] = []
    void document.fonts.ready.then(() => {
      if (!vivo) return
      soltarElPedido = enOcio(
        () => {
          if (!vivo) return
          for (const t of TITULOS_DE_VOLUMEN.values()) {
            const a = armar(t, variante)
            if (estudio.current !== null) ponerElEstudio(a.material, estudio.current)
            g.add(a.grupo)
            armados.push(a)
          }
          s.armados = armados
          // Regla 2: llega después del precompilado de la escena; se compila y se calienta al armarse.
          void gl.compileAsync(escena, camara).then(() => {
            if (vivo) calentar(gl, escena, camara)
          })
        },
      )
    })
    return () => {
      vivo = false
      soltarElPedido()
      s.armados = []
      for (const a of armados) {
        g.remove(a.grupo)
        soltar(a)
      }
    }
  }, [version, variante, gl, escena, camara])

  // Al cambiar el tamaño del cuadro, cada título se vuelve a colocar en su próxima llegada (o ya, si está a la vista).
  useEffect(() => descolocar(m.current.armados, tam.width), [tam.width, tam.height])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    const v = new THREE.Vector3() // banco
    ventana.__titulosDelBanco = {
      titulos: () =>
        m.current.armados.map((a) => {
          // La caja del título en el cuadro (px), con su llegada de ahora: para compararla con la del DOM.
          a.malla.geometry.computeBoundingBox()
          const b = a.malla.geometry.boundingBox ?? new THREE.Box3() // banco
          const esquinas = [b.min.x, b.max.x].flatMap((x) => [b.min.y, b.max.y].map((y) => v.set(x, y, 0).applyMatrix4(a.malla.matrixWorld).project(camara).clone())) // banco
          const px = esquinas.map((p) => [((p.x + 1) / 2) * tam.width, ((1 - p.y) / 2) * tam.height]) // banco
          const lugar = a.titulo.lugar.getBoundingClientRect()
          return {
            id: a.titulo.id,
            llegada: a.titulo.llegada,
            salida: a.titulo.salida,
            mostrado: { ...a.mostrado },
            visible: a.malla.visible,
            colocado: a.colocado,
            triangulos: (a.malla.geometry.getAttribute('position').count / 3) | 0,
            enElCuadro: { izquierda: Math.min(...px.map((p) => p[0])), derecha: Math.max(...px.map((p) => p[0])), arriba: Math.min(...px.map((p) => p[1])), abajo: Math.max(...px.map((p) => p[1])) },
            dom: { izquierda: lugar.left, derecha: lugar.right, arriba: lugar.top, abajo: lugar.bottom },
          }
        }),
      // La cámara viva y la que la colocación calcula para el mismo progreso (sin el mouse ni la inercia).
      camara: () => {
        const calculada = camaraDeLaLectura(rig.current.progress, tam.width / Math.max(1, tam.height), stats.current.logoW, stats.current.logoH, new THREE.PerspectiveCamera()) // banco
        return { viva: [...camara.position.toArray(), ...camara.quaternion.toArray()], calculada: [...calculada.position.toArray(), ...calculada.quaternion.toArray()] }
      },
      progreso: () => rig.current.progress,
    }
    return () => {
      delete ventana.__titulosDelBanco
    }
  }, [camara, rig, stats, tam.width, tam.height])

  useFrame((_, delta) => alCuadro(m.current, logoMaterialRef.current, keyLightRef.current, tam.width / Math.max(1, tam.height), stats, Math.min(delta, 0.1)))

  return <group ref={raiz} name="titulos de volumen" />
}

/** Al cambiar el tamaño del cuadro, cada título se vuelve a colocar en su próxima llegada (o ya, si está a la vista). */
function descolocar(armados: readonly Armado[], ancho: number): void {
  void ancho
  for (const a of armados) a.colocado = false
}

/** Un cuadro: la llegada y la salida de cada título (perseguidas), si se dibuja, dónde va (al empezar a llegar) y su luz. */
function alCuadro(s: { readonly armados: readonly Armado[]; readonly quieto: boolean; readonly nudo: THREE.PerspectiveCamera }, logo: THREE.MeshStandardMaterial | null, principal: THREE.DirectionalLight | null, aspecto: number, stats: ProbeStatsStore, dt: number): void {
  if (s.armados.length === 0) return
  const nivel = principal === null ? 1 : Math.min(1, principal.intensity / KEY_INTENSITY)
  for (const a of s.armados) {
    a.mostrado.llegada = persigue(a.mostrado.llegada, a.titulo.llegada, dt)
    a.mostrado.salida = persigue(a.mostrado.salida, a.titulo.salida, dt)
    const { llegada, salida } = a.mostrado
    a.uniforms.uLlegada.value = llegada
    a.uniforms.uSalida.value = salida
    a.uniforms.uQuieto.value = s.quieto ? 1 : 0
    // Regla 5: sin ninguna letra en camino, no se dibuja; al empezar la próxima llegada se vuelve a colocar.
    a.malla.visible = llegada > 0 && salida < 1
    if (!a.malla.visible) {
      if (llegada <= 0) a.colocado = false
      continue
    }
    if (!a.colocado) {
      const nudo = camaraDeLaLectura(a.titulo.lectura, aspecto, stats.current.logoW, stats.current.logoH, s.nudo)
      colocar(a.grupo, nudo, lugarDeLectura(a.titulo.lugar, a.titulo.subida), FUENTE.data) // una vez por llegada
      a.colocado = true
    }
    // La noche del logo, en el mismo cuadro; y los reflejos, con la luz de la sala.
    if (logo !== null) a.material.emissive.copy(logo.emissive)
    a.material.envMapIntensity = nivel
  }
}

/** Con la página ociosa (a lo sumo en 1,5 s); Safari no tiene `requestIdleCallback`: ahí, en 200 ms. Devuelve cómo cancelarlo. */
function enOcio(f: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const pedido = window.requestIdleCallback(f, { timeout: 1500 })
    return () => window.cancelIdleCallback(pedido)
  }
  const pedido = window.setTimeout(f, 200)
  return () => window.clearTimeout(pedido)
}

function ponerElEstudio(material: THREE.MeshStandardMaterial, rt: THREE.WebGLRenderTarget): void {
  material.envMap = rt.texture
  material.needsUpdate = true
}

function armar(titulo: TituloDeVolumen, variante: Variante): Armado {
  const { geometria, contornos } = armarElTitulo(FUENTE, titulo.texto, posicionesDelDom(titulo.lugar))
  const material = new THREE.MeshStandardMaterial({ color: variante === 'negro' ? INK_COLOR : PAPER_COLOR, roughness: SATINADO.roughness, metalness: 0, dithering: true })
  const uniforms = { uLlegada: { value: 0 }, uSalida: { value: 0 }, uQuieto: { value: 0 } }
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${LLEGADA_PARS_GLSL}`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n${LLEGADA_NORMAL_GLSL}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${LLEGADA_POSICION_GLSL}`)
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\n${DISOLVER_PARS_GLSL}`).replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${DISOLVER_GLSL}`)
    // El blanco, de día: el filo oscuro (la función del borde la trae el dibujo de noche, que se instala abajo).
    if (variante === 'blanco') shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>\n${FILO_DE_DIA_GLSL}`)
  }
  material.customProgramCacheKey = () => `titulo-de-volumen-${variante}`
  // De noche, el dibujo del logo (en em: el filo y el campo de su contorno); y el amanecer, como el resto de la sala.
  const contorno = hornearContornos(contornos, NOCHE_DEL_TITULO.contorno)
  conLogoDeNoche(material, contorno, variante === 'blanco' ? { ancho: NOCHE_DEL_TITULO.filo, tapa: NOCHE_DEL_TITULO.tapaDelBlanco } : { ancho: NOCHE_DEL_TITULO.filo })
  conElAmanecer(material)
  const malla = new THREE.Mesh(geometria, material)
  malla.name = `titulo de volumen · ${titulo.id}`
  // Las letras que llegan salen de la caja de la geometría quieta: sin descarte por encuadre (son una o dos mallas).
  malla.frustumCulled = false
  malla.visible = false
  const grupo = new THREE.Group()
  grupo.add(malla)
  return { titulo, mostrado: { llegada: titulo.llegada, salida: titulo.salida }, grupo, malla, material, uniforms, contorno, colocado: false }
}

function soltar(a: Armado): void {
  a.malla.geometry.dispose()
  a.material.dispose()
  a.contorno.textura.dispose()
}
