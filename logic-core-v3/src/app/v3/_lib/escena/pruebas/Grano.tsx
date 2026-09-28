'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { VIVO } from '../entorno/vivo'

/**
 * [ESCENA 7] T13 · GRANO DE CÁMARA — con bandera, apagado. Un grano de película muy fino y en movimiento,
 * sobre todo el lienzo: un píxel por grano, otro en cada cuadro, monocromo y bajo (±`cuanto`), así todo
 * sigue nítido (T10). Es la última llamada de dibujo del cuadro: un triángulo que cubre la pantalla y MULTIPLICA
 * lo que ya hay por (1 ± el grano); más visible en lo claro, como el grano de verdad. No toca el alfa del lienzo.
 */
export const GRANO = {
  /** Cuánto cambia la luz de un píxel, como mucho (fracción). */
  cuanto: 0.045,
} as const

const VERTEX = /* glsl */ `
void main() {
	gl_Position = vec4( position.xy, 0.0, 1.0 );
}
`

const FRAGMENT = /* glsl */ `
uniform float uTiempo;
float azarDelGrano( vec2 p ) {
	vec3 q = fract( vec3( p.xyx ) * 0.1031 );
	q += dot( q, q.yzx + 33.33 );
	return fract( ( q.x + q.y ) * q.z );
}
void main() {
	// Otro grano en cada cuadro: el reloj en pasos de 1/60 s corre la semilla.
	float cuadro = floor( uTiempo * 60.0 );
	vec2 p = gl_FragCoord.xy + vec2( cuadro * 17.0, cuadro * 31.0 );
	// Dos azares sumados: más granos chicos que grandes (casi normal).
	float g = azarDelGrano( p ) + azarDelGrano( p + 91.7 ) - 1.0;
	// Mezcla propia: el destino por dos veces esto, o sea por (1 ± cuanto).
	gl_FragColor = vec4( vec3( 0.5 + ${GRANO.cuanto.toFixed(3)} * 0.5 * g ), 1.0 );
}
`

export function Grano() {
  if (!entornoDeLaEscena().pruebas.grano) return null
  return <GranoPrendido />
}

function GranoPrendido() {
  const malla = useMemo(() => {
    const geometria = new THREE.BufferGeometry()
    geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3))
    const material = new THREE.ShaderMaterial({
      uniforms: { uTiempo: VIVO.uTiempo },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.DstColorFactor,
      blendDst: THREE.SrcColorFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
    })
    const m = new THREE.Mesh(geometria, material)
    m.frustumCulled = false
    m.renderOrder = 100000
    return m
  }, [])
  useEffect(() => () => {
    malla.geometry.dispose()
    ;(malla.material as THREE.Material).dispose()
  }, [malla])
  return <primitive object={malla} />
}
