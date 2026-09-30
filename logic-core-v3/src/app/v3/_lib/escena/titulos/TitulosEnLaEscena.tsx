'use client'

import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import { CONSULTA_MENOS_MOVIMIENTO } from '../../cursor'
import { hayBanco } from '../entorno'
import { LLEGADA_3D } from '../../titulos3d/llegada'
import { TITULOS_PARA_LA_ESCENA, type TituloParaLaEscena } from '../../titulos3d/enLaEscena'

/**
 * [ESCENA 9] T5 · V2 · LOS TÍTULOS DENTRO DE LA ESCENA (bandera `titulos=webgl`; el porqué, en `_lib/titulos3d/llegada.ts`).
 * Un módulo aparte, que sólo se descarga con la bandera (troika no viaja con la escena).
 *
 * El título que la sección anotó (`_lib/titulos3d/enLaEscena.ts`) se dibuja con texto SDF (troika, la misma Chivo del
 * sitio) con la luz de la sala, la niebla y la profundidad de verdad, en el MISMO lugar de la pantalla que el del DOM
 * (que queda, transparente, para los lectores de pantalla y los buscadores; el lienzo ya no se anuncia). Se para delante
 * del logo (a una fracción de su distancia a la cámara): a su costado, sin taparlo ni quedar detrás de nada.
 *
 * La llegada, letra por letra, en el vértice (una sola malla): el orden de cada letra es su lugar en el renglón, con las
 * mismas cifras que la variante del DOM. **Se lee siempre:** la tinta del título, con emisión. **Con movimiento
 * reducido**, sólo la opacidad.
 */
export const TITULOS_3D = {
  /** A qué fracción de la distancia de la cámara al logo se para el título. */
  distancia: 0.85,
  /** De cuán atrás viene cada letra, en alturas de letra (el giro, la subida y el escalonado son los del DOM). */
  profundidad: 3,
  /** Cuánto de la tinta emite: toda (se lee como el título del DOM también con la sala a oscuras). */
  emite: 1,
  /** Cada cuánto se vuelve a leer la tinta y la tipografía del DOM (ms). */
  relectura: 500,
} as const

/**
 * La Chivo del sitio en su peso de los títulos (400), en TTF: troika no lee WOFF2 (lo rechaza en su worker y el texto
 * se queda esperando la fuente, sin error). Es `chivo-latin.woff2` instanciada en 400 con fontTools (la misma licencia,
 * `OFL-chivo.txt`). Por su URL de módulo: el empaquetador la sirve, y sólo con la bandera.
 */
const CHIVO = new URL('../../../_fuentes/chivo-400-latin.ttf', import.meta.url).href

const f = (x: number): string => x.toFixed(4)

const VERTICE = /* glsl */ `
	{
		// [ESCENA 9] T5 · la llegada de cada letra: su orden es su lugar en el renglón.
		vec4 caja = aTroikaGlyphBounds;
		float orden = clamp( ( caja.x - uCajaDelTexto.x ) / max( uCajaDelTexto.y, 1e-4 ), 0.0, 1.0 );
		float u = clamp( ( uLlegada - orden * ( 1.0 - ${f(LLEGADA_3D.dura)} ) ) / ${f(LLEGADA_3D.dura)}, 0.0, 1.0 );
		float e = 1.0 - pow( 1.0 - u, 3.0 );
		vLlegadaDeLaLetra = e;
		float falta = ( 1.0 - e ) * ( 1.0 - uQuieto );
		float base = min( caja.y, caja.w );
		float alto = abs( caja.w - caja.y );
		// Acostada hacia atrás sobre su base (la tapa se levanta hacia la cámara), como en el DOM.
		float a = - falta * ${f((LLEGADA_3D.giro * Math.PI) / 180)};
		vec3 q = transformed - vec3( 0.0, base, 0.0 );
		q = vec3( q.x, q.y * cos( a ) - q.z * sin( a ), q.y * sin( a ) + q.z * cos( a ) );
		transformed = q + vec3( 0.0, base - falta * ${f(LLEGADA_3D.subida)} * alto, - falta * ${f(TITULOS_3D.profundidad)} * alto );
	}
`

type Shader = Parameters<THREE.Material['onBeforeCompile']>[0]

interface MaterialDelTitulo {
  readonly material: THREE.MeshStandardMaterial
  readonly uLlegada: { value: number }
  readonly uQuieto: { value: number }
  readonly uCajaDelTexto: { value: THREE.Vector2 }
}

/** El material de un título: la tinta con emisión, y el parche de la llegada (troika lo deriva para el SDF). */
function materialDelTitulo(): MaterialDelTitulo {
  const material = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0, transparent: true, side: THREE.DoubleSide, depthWrite: false })
  material.name = 'títulos 3D'
  const uLlegada = { value: 0 }
  const uQuieto = { value: 0 }
  const uCajaDelTexto = { value: new THREE.Vector2(0, 1) }
  material.onBeforeCompile = (shader: Shader) => {
    Object.assign(shader.uniforms, { uLlegada, uQuieto, uCajaDelTexto })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uLlegada;\nuniform float uQuieto;\nuniform vec2 uCajaDelTexto;\nvarying float vLlegadaDeLaLetra;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERTICE}`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vLlegadaDeLaLetra;')
      .replace('#include <alphatest_fragment>', 'diffuseColor.a *= vLlegadaDeLaLetra;\n#include <alphatest_fragment>')
  }
  material.customProgramCacheKey = () => 'titulos-3d-llegada'
  return { material, uLlegada, uQuieto, uCajaDelTexto }
}

/** Lo que se lee del DOM cada tanto: la tinta de quien pinta el título (el texto anotado es transparente) y si se pide menos movimiento. */
function alLeerElDom(a: MaterialDelTitulo, elemento: HTMLElement, quieto: boolean): void {
  const pintor = elemento.parentElement ?? elemento
  a.material.color.setStyle(getComputedStyle(pintor).color)
  a.material.emissive.copy(a.material.color).multiplyScalar(TITULOS_3D.emite)
  a.uQuieto.value = quieto ? 1 : 0
}

/** En cada cuadro: cuánto llegó y la caja del texto (el orden de cada letra sale de su lugar en el renglón). */
function alCuadro(a: MaterialDelTitulo, llegada: number, caja: THREE.Box3 | null): void {
  a.uLlegada.value = llegada
  if (caja !== null) a.uCajaDelTexto.value.set(caja.min.x, Math.max(1e-4, caja.max.x - caja.min.x))
}

export default function TitulosEnLaEscena() {
  // Los títulos anotados (la sección los anota al montarse): se revisan cada tanto, no en cada cuadro.
  const [ids, setIds] = useState<readonly string[]>([])
  useEffect(() => {
    const revisar = (): void => {
      const ahora = [...TITULOS_PARA_LA_ESCENA.keys()].sort()
      setIds((antes) => (antes.join('|') === ahora.join('|') ? antes : ahora))
    }
    revisar()
    const id = window.setInterval(revisar, TITULOS_3D.relectura)
    // Con banco: qué anotaron las secciones y qué títulos se montaron (con su malla).
    const ventana = window as Window & { __titulosDelBanco?: { anotados: () => string[]; montados: () => string[] } }
    if (hayBanco()) ventana.__titulosDelBanco = { anotados: () => [...TITULOS_PARA_LA_ESCENA.keys()], montados: () => [...MONTADOS] }
    return () => {
      window.clearInterval(id)
      delete ventana.__titulosDelBanco
    }
  }, [])
  return (
    <>
      {ids.map((id) => {
        const t = TITULOS_PARA_LA_ESCENA.get(id)
        return t === undefined ? null : <TituloEnLaEscena key={id} titulo={t} />
      })}
    </>
  )
}

/** Con banco: los títulos montados en la escena. */
const MONTADOS = new Set<string>()

function TituloEnLaEscena({ titulo }: { readonly titulo: TituloParaLaEscena }) {
  useEffect(() => {
    MONTADOS.add(titulo.id)
    return () => {
      MONTADOS.delete(titulo.id)
    }
  }, [titulo.id])
  const malla = useRef<THREE.Mesh>(null)
  const armado = useMemo(() => materialDelTitulo(), [])
  const [tipo, setTipo] = useState({ espaciado: 0, alto: 1.2 })
  const memoria = useRef({ local: new THREE.Vector3(), centro: new THREE.Vector3(), tamPx: 0, logo: null as THREE.Object3D | null })
  useEffect(() => () => armado.material.dispose(), [armado])
  // La tinta y la tipografía del DOM: al montar y cada tanto (la tinta cambia con el día; el tamaño, con la ventana).
  useEffect(() => {
    const menos = window.matchMedia(CONSULTA_MENOS_MOVIMIENTO)
    const leer = (): void => {
      const estilo = getComputedStyle(titulo.elemento)
      const tam = parseFloat(estilo.fontSize)
      memoria.current.tamPx = tam
      const caja = titulo.elemento.getBoundingClientRect()
      const espaciado = estilo.letterSpacing === 'normal' ? 0 : parseFloat(estilo.letterSpacing) / tam
      // El alto de la caja del texto en el DOM (su área de contenido): con él, el renglón de troika empieza donde el del DOM.
      const alto = caja.height > 0 ? caja.height / tam : 1.2
      setTipo((antes) => (Math.abs(antes.espaciado - espaciado) < 1e-4 && Math.abs(antes.alto - alto) < 1e-3 ? antes : { espaciado, alto }))
      alLeerElDom(armado, titulo.elemento, menos.matches)
    }
    leer()
    const id = window.setInterval(leer, TITULOS_3D.relectura)
    return () => window.clearInterval(id)
  }, [titulo.elemento, armado])
  useFrame((state) => {
    const m = malla.current
    const camara = state.camera
    if (m === null || !(camara instanceof THREE.PerspectiveCamera)) return
    const caja = titulo.elemento.isConnected ? titulo.elemento.getBoundingClientRect() : null
    if (caja === null || caja.bottom < 0 || caja.top > window.innerHeight || caja.width === 0) {
      m.visible = false
      return
    }
    m.visible = true
    const mem = memoria.current
    mem.logo ??= state.scene.getObjectByName('logo') ?? null
    // Delante del logo: a una fracción de su distancia a la cámara.
    const d = (mem.logo === null ? 10 : camara.position.distanceTo(mem.logo.getWorldPosition(mem.centro))) * TITULOS_3D.distancia
    // Un píxel de la pantalla, en unidades del mundo, a esa distancia.
    const k = (2 * d * Math.tan(THREE.MathUtils.degToRad(camara.fov) / 2)) / window.innerHeight
    mem.local.set((caja.left - window.innerWidth / 2) * k, -(caja.top - window.innerHeight / 2) * k, -d).applyQuaternion(camara.quaternion)
    m.position.copy(camara.position).add(mem.local)
    m.quaternion.copy(camara.quaternion)
    m.scale.setScalar(mem.tamPx * k)
    alCuadro(armado, titulo.llegada, m.geometry.boundingBox)
  })
  return (
    <Text ref={malla} name={`títulos 3D · ${titulo.id}`} font={CHIVO} fontSize={1} anchorX="left" anchorY="top" letterSpacing={tipo.espaciado} lineHeight={tipo.alto} material={armado.material} visible={false}>
      {titulo.texto}
    </Text>
  )
}
