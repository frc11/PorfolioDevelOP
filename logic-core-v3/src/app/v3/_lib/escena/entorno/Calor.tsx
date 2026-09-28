'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { crearCronometro, type Cronometro, type Medida } from '../gpu/cronometro'
import { FLOOR_Y } from '../probeScene'
import { HAZ_ENCENDIDO } from './encendido'
import { HAZ, VIVO } from './vivo'

/**
 * [ESCENA 6] 6f · AIRE CALIENTE EN EL HAZ — de noche, una refracción muy leve dentro de la columna de
 * E1, como el aire bajo un reflector.
 *
 * **Cómo.** Una pasada extra a media resolución: la escena se dibuja en una textura, recortada
 * (tijera) al rectángulo que la columna ocupa en pantalla. Después la columna se dibuja encima con esa
 * imagen corrida por un ruido que sube (el aire caliente asciende), a lo sumo `desvio` píxeles, más
 * fuerte hacia el eje y apagado en las puntas. De día, o con el haz apagado (6e), no hay pasada.
 * Apagado en el teléfono.
 */
export const CALOR = {
  /** La resolución de la pasada extra, contra la del lienzo. */
  resolucion: 0.5,
  /** El corrimiento máximo, en píxeles del lienzo, y cuánto se mezcla la imagen corrida. */
  desvio: 1.6,
  mezcla: 0.8,
  /** El ruido: su escala a lo alto y alrededor, y cuánto sube por segundo. */
  escala: { alto: 16, vuelta: 7 },
  sube: 1.3,
} as const

const ALTO = HAZ.arriba - FLOOR_Y

const VERTEX = /* glsl */ `
varying vec3 vNormal2;
varying vec3 vVista;
varying float vAlto;
varying float vVuelta;
void main() {
	vAlto = uv.y;
	vVuelta = uv.x;
	vec4 mv = modelViewMatrix * vec4( position, 1.0 );
	vNormal2 = normalize( normalMatrix * normal );
	vVista = normalize( - mv.xyz );
	gl_Position = projectionMatrix * mv;
}
`

const FRAGMENT = /* glsl */ `
uniform sampler2D uEscena;
uniform vec2 uResolucion;
uniform float uTiempo;
uniform float uFuerza;
varying vec3 vNormal2;
varying vec3 vVista;
varying float vAlto;
varying float vVuelta;
float azarCalor( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
float ruidoCalor( vec2 p ) {
	vec2 i = floor( p );
	vec2 f = fract( p );
	vec2 u = f * f * ( 3.0 - 2.0 * f );
	return mix( mix( azarCalor( i ), azarCalor( i + vec2( 1.0, 0.0 ) ), u.x ), mix( azarCalor( i + vec2( 0.0, 1.0 ) ), azarCalor( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
}
void main() {
	float deFrente = pow( abs( dot( normalize( vNormal2 ), normalize( vVista ) ) ), 1.2 );
	// Más fuerte abajo, donde el aire se calienta (el piso y el logo), y apagado hacia el óculo.
	float puntas = smoothstep( 0.0, 0.06, vAlto ) * ( 1.0 - smoothstep( 0.25, 0.6, vAlto ) );
	float m = deFrente * puntas * uFuerza;
	if ( m < 0.003 ) discard;
	// El aire caliente sube: el ruido corre hacia arriba a lo largo de la columna.
	vec2 q = vec2( vVuelta * ${CALOR.escala.vuelta.toFixed(1)}, vAlto * ${CALOR.escala.alto.toFixed(1)} - uTiempo * ${CALOR.sube.toFixed(2)} );
	vec2 corrido = vec2( ruidoCalor( q ), ruidoCalor( q + 17.3 ) ) * 2.0 - 1.0;
	vec2 uv = ( gl_FragCoord.xy + corrido * ${CALOR.desvio.toFixed(2)} * m ) / uResolucion;
	gl_FragColor = vec4( texture2D( uEscena, uv ).rgb, m * ${CALOR.mezcla.toFixed(2)} );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}
`

type VentanaDelBanco = Window & { __calorDelBanco?: { medir: (cuadros: number) => Promise<Medida & { llamadas: number }> } }

export function Calor({ calidad }: { readonly calidad: NivelDeCalidad }) {
  const e = entornoDeLaEscena()
  if (!e.E1 || !e.pruebas.aireCaliente || calidad === 'compacta') return null
  return <CalorPrendido />
}

function CalorPrendido() {
  const scene = useThree((s) => s.scene)
  const armado = useMemo(() => {
    const blanco = new THREE.WebGLRenderTarget(1, 1, { type: THREE.UnsignedByteType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true })
    const uniforms = { uEscena: { value: blanco.texture }, uResolucion: { value: new THREE.Vector2(1, 1) }, uTiempo: VIVO.uTiempo, uFuerza: { value: 0 } }
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT, transparent: true, depthWrite: false, side: THREE.FrontSide })
    const columna = new THREE.Mesh(new THREE.CylinderGeometry(HAZ.radioArriba, HAZ.radioAbajo, ALTO, 48, 1, true), material)
    columna.position.set(0, FLOOR_Y + ALTO / 2, 0)
    columna.renderOrder = 3
    columna.frustumCulled = false
    return { blanco, uniforms, material, columna }
  }, [])
  useEffect(
    () => () => {
      armado.blanco.dispose()
      armado.material.dispose()
      armado.columna.geometry.dispose()
    },
    [armado],
  )
  const medicion = useRef({ cronometro: crearCronometro(), llamadas: 0 })

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__calorDelBanco = {
      medir: async (cuadros) => ({ ...(await medicion.current.cronometro.pedir(cuadros)), llamadas: medicion.current.llamadas }),
    }
    return () => {
      delete ventana.__calorDelBanco
    }
  }, [])

  useFrame((state) => {
    pasadaExtra(armado, state.gl, scene, state.camera, medicion.current)
  })

  return <primitive object={armado.columna} />
}

const tamano = new THREE.Vector2()
const esquinas = [-1, 1].flatMap((lado) => [0, 1].flatMap((arriba) => [0, 1, 2, 3].map((k) => ({ lado, arriba, k }))))
const punto = new THREE.Vector3()

/** La pasada extra: la escena en la textura, sólo donde está la columna, y la fuerza de la refracción. */
function pasadaExtra(armado: { blanco: THREE.WebGLRenderTarget; uniforms: { uResolucion: { value: THREE.Vector2 }; uFuerza: { value: number } }; columna: THREE.Mesh }, gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, m: { cronometro: Cronometro; llamadas: number }): void {
  const fuerza = VIVO.uNoche.value * HAZ_ENCENDIDO.k
  armado.uniforms.uFuerza.value = fuerza
  armado.columna.visible = fuerza > 0.01
  if (!armado.columna.visible) return
  gl.getDrawingBufferSize(tamano)
  armado.uniforms.uResolucion.value.copy(tamano)
  const ancho = Math.max(1, Math.round(tamano.x * CALOR.resolucion))
  const alto = Math.max(1, Math.round(tamano.y * CALOR.resolucion))
  if (armado.blanco.width !== ancho || armado.blanco.height !== alto) armado.blanco.setSize(ancho, alto)
  // El rectángulo de la columna en pantalla: sus dos aros, de cuatro puntos cada uno.
  let [x0, y0, x1, y1] = [1, 1, -1, -1]
  for (const { arriba, k } of esquinas) {
    const r = arriba === 1 ? HAZ.radioArriba : HAZ.radioAbajo
    const a = (k / 4) * Math.PI * 2
    punto.set(Math.cos(a) * r, arriba === 1 ? HAZ.arriba : FLOOR_Y, Math.sin(a) * r).project(camera)
    if (punto.z > 1) continue
    x0 = Math.min(x0, punto.x)
    x1 = Math.max(x1, punto.x)
    y0 = Math.min(y0, punto.y)
    y1 = Math.max(y1, punto.y)
  }
  const aPixel = (v: number, n: number): number => Math.round(((Math.min(1, Math.max(-1, v)) + 1) / 2) * n)
  const [px0, py0, px1, py1] = [aPixel(x0, ancho) - 4, aPixel(y0, alto) - 4, aPixel(x1, ancho) + 4, aPixel(y1, alto) + 4]
  armado.blanco.scissor.set(Math.max(0, px0), Math.max(0, py0), Math.max(1, px1 - px0), Math.max(1, py1 - py0))
  armado.blanco.scissorTest = true

  m.cronometro.correr(gl, () => {
    const previo = gl.getRenderTarget()
    const autoLimpiar = gl.autoClear
    armado.columna.visible = false
    gl.setRenderTarget(armado.blanco)
    gl.autoClear = true
    gl.render(scene, camera)
    gl.setRenderTarget(previo)
    gl.autoClear = autoLimpiar
    armado.columna.visible = true
  })
  // `render` pone a cero la cuenta al empezar: lo que queda es la pasada extra.
  m.llamadas = gl.info.render.calls
}
